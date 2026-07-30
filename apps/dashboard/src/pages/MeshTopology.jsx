import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from '@xyflow/react';
import { fetchTopology, fetchStatus } from '../api';
import { Server, Building2, RefreshCw, X } from 'lucide-react';

function ServerNode({ data }) {
  return (
    <div
      onClick={() => data.onNodeClick?.(data)}
      className="bg-background border-2 border-emerald-500/60 rounded-xl px-4 py-3 shadow-lg cursor-pointer hover:shadow-xl transition-all min-w-[160px]"
    >
      <Handle type="target" position={Position.Top} className="!bg-emerald-500/60 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500/60 !w-2 !h-2" />
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
          <Server className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold text-foreground">{data.label}</div>
          <div className="text-[10px] font-mono text-muted-foreground">{data.ip}</div>
        </div>
        <span className="ml-auto text-[8px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50 uppercase">Core</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
      </div>
    </div>
  );
}

function BankNode({ data }) {
  const isOffline = data.status === 'offline' || data.status === 'down' || data.status === 'unreachable';
  const isDegraded = data.status === 'degraded';

  const borderColor = isOffline ? 'border-red-500/60' : isDegraded ? 'border-amber-500/60' : 'border-emerald-500/60';
  const dotColor = isOffline ? 'bg-red-400' : isDegraded ? 'bg-amber-400' : 'bg-emerald-400';

  return (
    <div
      onClick={() => data.onNodeClick?.(data)}
      className={`bg-background border ${borderColor} rounded-xl px-4 py-3 shadow-lg cursor-pointer hover:shadow-xl transition-all min-w-[140px]`}
    >
      <Handle type="target" position={Position.Top} className="!bg-amber-500/60 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-amber-500/60 !w-2 !h-2" />
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-800/50 flex items-center justify-center text-amber-400">
          <Building2 className="w-3.5 h-3.5" />
        </div>
        <div>
          <div className="text-xs font-bold text-foreground">{data.label}</div>
          <div className="text-[10px] font-mono text-muted-foreground">{data.ip}</div>
        </div>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`}></span>
      </div>
    </div>
  );
}

export default function MeshTopology() {
  const [nodesData, setNodesData] = useState([
    { id: 'lti-server', label: 'LTI Core HQ', ip: '10.100.0.1', status: 'online', rtt_ms: 3.5, public_key: null, endpoint: null, allowed_ips: null, latest_handshake: null, transfer: null },
    { id: 'bank-a', label: 'Bank A', ip: '10.100.0.2', status: 'online', rtt_ms: 4.2, public_key: 'v8VqNAasNJ8JuiwH3...', endpoint: '10.100.0.2:51820', allowed_ips: '10.100.1.0/24', latest_handshake: null, transfer: null },
    { id: 'bank-b', label: 'Bank B', ip: '10.100.0.3', status: 'degraded', rtt_ms: null, public_key: null, endpoint: null, allowed_ips: null, latest_handshake: null, transfer: null },
  ]);
  const [selectedNode, setSelectedNode] = useState({
    id: 'lti-server', label: 'LTI Core HQ', ip: '10.100.0.1', status: 'online', rtt_ms: 3.5, public_key: null, endpoint: null, allowed_ips: null, latest_handshake: null, transfer: null
  });
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodeTypes = useMemo(() => ({
    serverNode: ServerNode,
    bankNode: BankNode,
  }), []);

  const onNodeClick = useCallback((nodeData) => {
    setSelectedNode(nodeData);
  }, []);

  function buildGraph(rawNodes) {
    const centerNode = rawNodes.find((n) => n.id === 'lti-server' || n.ip === '10.100.0.1') || rawNodes[0];
    const peripheralNodes = rawNodes.filter((n) => n !== centerNode);

    const flowNodes = [];
    const flowEdges = [];

    if (centerNode) {
      flowNodes.push({
        id: centerNode.id,
        type: 'serverNode',
        position: { x: 350, y: 100 },
        data: { label: centerNode.label || 'LTI Core HQ', ip: centerNode.ip, status: centerNode.status, public_key: centerNode.public_key, endpoint: centerNode.endpoint, allowed_ips: centerNode.allowed_ips, rtt_ms: centerNode.rtt_ms, onNodeClick }
      });
    }

    const count = peripheralNodes.length;
    const spacing = 250;
    const startX = 350 - ((count - 1) * spacing) / 2;

    peripheralNodes.forEach((node, idx) => {
      const x = startX + idx * spacing;
      const y = 320;

      const isOffline = node.status === 'offline' || node.status === 'down' || node.status === 'unreachable';
      const isDegraded = node.status === 'degraded';

      flowNodes.push({
        id: node.id,
        type: 'bankNode',
        position: { x, y },
        data: { label: node.label || `Peer ${node.ip}`, ip: node.ip, status: node.status, rtt_ms: node.rtt_ms, latest_handshake: node.latest_handshake, transfer: node.transfer, public_key: node.public_key, endpoint: node.endpoint, allowed_ips: node.allowed_ips, onNodeClick }
      });

      if (centerNode) {
        let edgeColor = '#f59e0b';
        let edgeLabel = node.rtt_ms != null ? `${node.rtt_ms}ms` : '';

        if (isOffline) {
          edgeColor = '#ef4444';
          edgeLabel = 'timeout';
        } else if (isDegraded) {
          edgeColor = '#f59e0b';
        }

        flowEdges.push({
          id: `edge-${centerNode.id}-${node.id}`,
          source: centerNode.id,
          target: node.id,
          style: { stroke: edgeColor, strokeWidth: 2 },
        });
      }
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }

  useEffect(() => {
    buildGraph(nodesData);
    loadTopology();
  }, []);

  const loadTopology = async () => {
    try {
      const [topoRes, statusRes] = await Promise.all([fetchTopology(), fetchStatus()]);
      const raw = topoRes.nodes || [];
      const peers = statusRes.peers || [];

      const enriched = raw.map((node) => {
        const match = peers.find((p) => {
          const ip = p.endpoint?.split(':')[0];
          return ip === node.ip;
        });
        if (match) {
          return {
            ...node,
            status: 'online',
            rtt_ms: node.rtt_ms ?? null,
            latest_handshake: match.latest_handshake,
            transfer: match.transfer,
            public_key: match.public_key,
            endpoint: match.endpoint,
            allowed_ips: match.allowed_ips,
          };
        }
        return node;
      });

      setNodesData(enriched);
      setLastRefreshed(new Date());
      buildGraph(enriched);
      setSelectedNode((prev) => {
        if (!prev) return enriched[0] || null;
        return enriched.find((n) => n.id === prev.id) || enriched[0] || null;
      });
    } catch {
      const fallback = [
        { id: 'lti-server', label: 'LTI Core HQ', ip: '10.100.0.1', status: 'online', rtt_ms: 3.5, public_key: null, endpoint: null, allowed_ips: null, latest_handshake: null, transfer: null },
        { id: 'bank-a', label: 'Bank A', ip: '10.100.0.2', status: 'online', rtt_ms: 4.2, public_key: 'v8VqNAasNJ8JuiwH3...', endpoint: '10.100.0.2:51820', allowed_ips: '10.100.1.0/24', latest_handshake: null, transfer: null },
        { id: 'bank-b', label: 'Bank B', ip: '10.100.0.3', status: 'degraded', rtt_ms: null, public_key: null, endpoint: null, allowed_ips: null, latest_handshake: null, transfer: null },
      ];
      setNodesData(fallback);
      setLastRefreshed(new Date());
      buildGraph(fallback);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          {lastRefreshed && (
            <span className="text-[11px] font-mono text-muted-foreground">{lastRefreshed.toLocaleTimeString()}</span>
          )}
          <button onClick={loadTopology} className="px-3 py-1.5 text-[11px] font-semibold bg-card hover:bg-muted text-foreground rounded-lg border border-border transition-all cursor-pointer flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-4">
        {/* Left: Graph */}
        <div className="flex-1 bg-card/80 border border-border rounded-xl relative overflow-hidden">
          <div className="px-5 py-3 border-b border-border/80">
            <h3 className="text-sm font-bold text-foreground">Interactive Network Graph</h3>
          </div>
          <div className="h-[480px]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              colorMode="dark"
              proOptions={{ hideAttribution: true }}
            >
              <Background color="hsl(var(--border))" gap={20} size={1} />
              <MiniMap
                nodeColor="#f59e0b"
                maskColor="rgba(0,0,0,0.7)"
                className="!bg-background !border !border-border rounded-lg"
                style={{ bottom: 16, right: 16, width: 160, height: 100 }}
              />
              <Controls
                showInteractive={false}
                className="!bg-background !border !border-border rounded-lg"
                style={{ bottom: 16, left: 16 }}
              />
            </ReactFlow>
          </div>
        </div>

        {/* Right: Node Detail */}
        <div className="w-[300px] bg-card/80 border border-border rounded-xl flex-shrink-0">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border/80">
            <h3 className="text-sm font-bold text-foreground">Node Detail</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted transition-colors cursor-pointer text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-3">
            {selectedNode ? (
              [
                { label: 'Label', value: selectedNode.label },
                { label: 'IP Address', value: selectedNode.ip },
                { label: 'Status', value: selectedNode.status, isStatus: true },
                { label: 'Public Key', value: selectedNode.public_key || '—', mono: true },
                { label: 'Endpoint', value: selectedNode.endpoint || '—', mono: true },
                { label: 'Allowed IPs', value: selectedNode.allowed_ips || '—', mono: true },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">{row.label}</span>
                  {row.isStatus ? (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      row.value === 'online' || row.value === 'ONLINE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : row.value === 'degraded' || row.value === 'DEGRADED'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                    }`}>
                      {row.value}
                    </span>
                  ) : (
                    <span className={`text-foreground font-semibold ${row.mono ? 'text-[10px] max-w-[140px] truncate' : ''}`}>{row.value}</span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-8">Click a node to view details</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
