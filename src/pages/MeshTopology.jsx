import React, { useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position
} from '@xyflow/react';
import { fetchTopology } from '../api';
import { Server, Building2, RefreshCw, WifiOff, Activity } from 'lucide-react';

// Custom Node for LTI Core HQ (Center Hub)
function ServerNode({ data }) {
  return (
    <div className="bg-card border-2 border-border rounded-2xl p-4 shadow-xl shadow-md min-w-[210px]">
      <Handle type="target" position={Position.Top} className="!bg-foreground/60 !w-3 !h-3" />
      <Handle type="source" position={Position.Bottom} className="!bg-foreground/60 !w-3 !h-3" />
      <Handle type="target" position={Position.Left} className="!bg-foreground/60 !w-3 !h-3" />
      <Handle type="source" position={Position.Right} className="!bg-foreground/60 !w-3 !h-3" />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground/80">
          <Server className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-mono text-foreground/80 uppercase font-semibold">Central Hub</div>
          <div className="text-sm font-bold text-foreground">{data.label}</div>
          <div className="text-xs font-mono text-muted-foreground">{data.ip}</div>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-emerald-400">
        <span className="flex items-center gap-1.5 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE
        </span>
        <span className="text-muted-foreground">10.100.0.1</span>
      </div>
    </div>
  );
}

// Custom Node for Remote Banking / Vault Nodes
function BankNode({ data }) {
  const isOffline = data.status === 'offline' || data.status === 'down' || data.status === 'unreachable';
  const isDegraded = data.status === 'degraded';

  let borderColor = 'border-emerald-500/90';
  let iconBg = 'bg-emerald-950/90 text-emerald-400 border-emerald-700/60';
  let statusBadge = 'bg-emerald-950 text-emerald-300 border-emerald-800';
  let statusText = 'ONLINE';

  if (isOffline) {
    borderColor = 'border-red-500/90 shadow-red-500/20';
    iconBg = 'bg-red-950/90 text-red-400 border-red-700/60';
    statusBadge = 'bg-red-950 text-red-400 border-red-800 animate-pulse';
    statusText = 'OFFLINE';
  } else if (isDegraded) {
    borderColor = 'border-amber-500/90';
    iconBg = 'bg-amber-950/90 text-amber-400 border-amber-700/60';
    statusBadge = 'bg-amber-950 text-amber-300 border-amber-800';
    statusText = 'DEGRADED';
  }

  return (
    <div className={`bg-card border-2 ${borderColor} rounded-2xl p-4 shadow-xl min-w-[200px] transition-all`}>
      <Handle type="target" position={Position.Top} className="!bg-foreground/60 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-foreground/60 !w-2.5 !h-2.5" />
      <Handle type="target" position={Position.Left} className="!bg-foreground/60 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!bg-foreground/60 !w-2.5 !h-2.5" />

      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${iconBg}`}>
          {isOffline ? <WifiOff className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
        </div>
        <div>
          <div className="text-xs font-mono text-muted-foreground">{data.ip}</div>
          <div className="text-sm font-bold text-foreground">{data.label}</div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono">
        <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${statusBadge}`}>
          {statusText}
        </span>
        <span className={`font-mono font-bold ${isOffline ? 'text-red-400' : 'text-foreground/80'}`}>
          {isOffline ? 'Ping: Timeout' : data.rtt_ms != null ? `Ping: ${data.rtt_ms} ms` : 'Ping: N/A'}
        </span>
      </div>
    </div>
  );
}

export default function MeshTopology() {
  const [nodesData, setNodesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [pollIntervalMs] = useState(10000);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodeTypes = useMemo(() => ({
    serverNode: ServerNode,
    bankNode: BankNode,
  }), []);

  const loadTopology = async () => {
    try {
      const res = await fetchTopology();
      const rawNodes = res.nodes || [];
      setNodesData(rawNodes);
      setLastRefreshed(new Date());

      const centerNode = rawNodes.find((n) => n.id === 'lti-server' || n.ip === '10.100.0.1') || rawNodes[0];
      const peripheralNodes = rawNodes.filter((n) => n !== centerNode);

      const flowNodes = [];
      const flowEdges = [];

      if (centerNode) {
        flowNodes.push({
          id: centerNode.id,
          type: 'serverNode',
          position: { x: 320, y: 220 },
          data: { label: centerNode.label || 'LTI Core HQ', ip: centerNode.ip, status: centerNode.status }
        });
      }

      const count = peripheralNodes.length;
      const radius = 270;
      peripheralNodes.forEach((node, idx) => {
        const angle = (idx / Math.max(count, 1)) * 2 * Math.PI - Math.PI / 2;
        const x = 320 + radius * Math.cos(angle);
        const y = 220 + radius * Math.sin(angle);

        const isOffline = node.status === 'offline' || node.status === 'down' || node.status === 'unreachable';
        const isDegraded = node.status === 'degraded';

        flowNodes.push({
          id: node.id,
          type: 'bankNode',
          position: { x, y },
          data: {
            label: node.label || `Peer ${node.ip}`,
            ip: node.ip,
            status: node.status,
            rtt_ms: node.rtt_ms
          }
        });

        if (centerNode) {
          let edgeColor = '#06b6d4';
          let edgeLabel = node.rtt_ms != null ? `Ping: ${node.rtt_ms} ms` : 'connected';

          if (isOffline) {
            edgeColor = '#ef4444';
            edgeLabel = 'Ping: TIMEOUT';
          } else if (isDegraded) {
            edgeColor = '#f59e0b';
          }

          flowEdges.push({
            id: `edge-${centerNode.id}-${node.id}`,
            source: centerNode.id,
            target: node.id,
            animated: !isOffline,
            label: edgeLabel,
            style: {
              stroke: edgeColor,
              strokeWidth: isOffline ? 2 : 2.5,
              strokeDasharray: isOffline ? '5 5' : undefined
            },
            labelStyle: {
              fill: isOffline ? '#f87171' : '#38bdf8',
              fontFamily: 'JetBrains Mono',
              fontSize: 11,
              fontWeight: 'bold'
            },
            labelBgStyle: { fill: 'hsl(var(--card))', rx: 4, ry: 4 }
          });
        }
      });

      setNodes(flowNodes.length > 0 ? flowNodes : fallbackNodes());
      if (flowNodes.length === 0) {
        setNodesData([
          { id: 'lti-server', label: 'LTI Core HQ', ip: '10.100.0.1', status: 'online' },
          { id: 'bank-a', label: 'Bank A', ip: '10.100.0.2', status: 'unreachable' },
          { id: 'bank-b', label: 'Bank B', ip: '10.100.0.3', status: 'unreachable' },
        ]);
      }
      setEdges(flowEdges);
    } catch {
      setNodes(fallbackNodes());
      setEdges(fallbackEdges());
      setNodesData([
        { id: 'lti-server', label: 'LTI Core HQ', ip: '10.100.0.1', status: 'online' },
        { id: 'bank-a', label: 'Bank A', ip: '10.100.0.2', status: 'degraded' },
        { id: 'bank-b', label: 'Bank B', ip: '10.100.0.3', status: 'degraded' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  function serverNode() {
    return {
      id: 'lti-server',
      type: 'serverNode',
      position: { x: 320, y: 220 },
      data: { label: 'LTI Core HQ', ip: '10.100.0.1', status: 'online' }
    };
  }

  function bankNode(label, ip) {
    return {
      id: label === 'Bank A' ? 'bank-a' : 'bank-b',
      type: 'bankNode',
      position: label === 'Bank A' ? { x: 320, y: -50 } : { x: 320, y: 490 },
      data: { label, ip, status: 'degraded', rtt_ms: null }
    };
  }

  function edgeTo(source, target, offline) {
    return {
      id: `edge-${source}-${target}`,
      source,
      target,
      animated: !offline,
      label: 'Ping: TIMEOUT',
      style: {
        stroke: '#f59e0b',
        strokeWidth: 2,
        strokeDasharray: '5 5'
      },
      labelStyle: {
        fill: '#f59e0b',
        fontFamily: 'JetBrains Mono',
        fontSize: 11,
        fontWeight: 'bold'
      },
      labelBgStyle: { fill: 'hsl(var(--card))', rx: 4, ry: 4 }
    };
  }

  function fallbackNodes() {
    return [
      serverNode(),
      bankNode('Bank A', '10.100.0.2'),
      bankNode('Bank B', '10.100.0.3'),
    ];
  }

  function fallbackEdges() {
    return [edgeTo('lti-server', 'bank-a', true), edgeTo('lti-server', 'bank-b', true)];
  }

  useEffect(() => {
    loadTopology();
    const interval = setInterval(loadTopology, pollIntervalMs);
    return () => clearInterval(interval);
  }, [pollIntervalMs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Mesh Topology
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-normal flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live (10s)
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-xs font-mono text-muted-foreground/80">
              Last Poll: {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={loadTopology}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-card hover:bg-muted text-foreground rounded-lg border border-border transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-foreground/80' : ''}`} />
            Refresh Ping Now
          </button>
        </div>
      </div>

      {/* Main Grid: React Flow Graph + Side Tunnel & Ping Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: React Flow Diagram */}
        <div className="lg:col-span-2 bg-card/80 border border-border rounded-2xl h-[540px] relative overflow-hidden shadow-xl">
          <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border text-xs font-mono flex items-center gap-2">
            <Activity className="w-4 h-4 text-foreground/80" />
            <span className="text-foreground/80">Mesh Graph</span>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            colorMode="dark"
          >
            <Background color="hsl(var(--border))" gap={20} size={1} />
            <Controls />
          </ReactFlow>
        </div>

        {/* Right: Ping Latency & Tunnel Registry Side Panel */}
        <div className="bg-card/80 border border-border rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <h3 className="text-base font-bold text-foreground">
                Node Registry
              </h3>
              <span className="text-xs font-mono bg-muted text-foreground/80 px-2.5 py-0.5 rounded border border-border">
                {nodesData.length} Registered Nodes
              </span>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {nodesData.map((node) => {
                const isOffline = node.status === 'offline' || node.status === 'down' || node.status === 'unreachable';
                const isDegraded = node.status === 'degraded';

                return (
                  <div
                    key={node.id}
                    className={`bg-background/80 border rounded-xl p-3.5 transition-all ${
                      isOffline
                        ? 'border-red-900/80 bg-red-950/20'
                        : isDegraded
                        ? 'border-amber-900/80'
                        : 'border-border hover:border-border/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">{node.label}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          isOffline
                            ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
                            : isDegraded
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {node.status ? node.status.toUpperCase() : 'ONLINE'}
                      </span>
                    </div>

                    <div className="mt-2.5 text-xs font-mono flex items-center justify-between">
                      <span className="text-muted-foreground">IP: <strong className="text-foreground">{node.ip}</strong></span>
                      <span className={`font-bold ${isOffline ? 'text-red-400' : 'text-foreground/80'}`}>
                        {isOffline ? 'Ping: Timeout' : node.rtt_ms != null ? `RTT: ${node.rtt_ms} ms` : 'Ping: N/A'}
                      </span>
                    </div>

                    {node.latest_handshake && (
                      <div className="mt-2 pt-2 border-t border-border text-[11px] font-mono text-muted-foreground/80 flex justify-between">
                        <span>Handshake: {node.latest_handshake}</span>
                        <span className="text-muted-foreground">{node.transfer ? node.transfer.split(',')[0] : ''}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
