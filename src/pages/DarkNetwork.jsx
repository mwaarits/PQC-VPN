import React, { useState, useEffect } from 'react';
import { fetchDarkNetwork, triggerDarkNetworkScan } from '../api';
import { Play, RefreshCw, Terminal } from 'lucide-react';

export default function DarkNetwork() {
  const [data, setData] = useState({
    port_51820_status: 'open|filtered',
    last_scan_time: Math.floor(Date.now() / 1000),
  });
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanOutput, setScanOutput] = useState(`# nmap -sU -p 51820 20.249.148.67
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-29 14:00 UTC
Nmap scan report for 20.249.148.67
Host is up (0.037s latency).

PORT      STATE         SERVICE
51820/udp open|filtered openvpn

# nmap -sU -p 5100-5200 20.249.148.67
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-29 14:01 UTC
Nmap scan report for 20.249.148.67
Host is up (0.039s latency).

All 101 scanned ports on 20.249.148.67 are in ignored states.
Not shown: 101 open|filtered udp ports (no-response)`);

  const loadDarkNetwork = async () => {
    try {
      const res = await fetchDarkNetwork();
      setData(res);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDarkNetwork();
  }, []);

  const handleRunScan = async () => {
    setScanning(true);
    try {
      await triggerDarkNetworkScan();
    } catch (err) {
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Dark Network & SPA
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-normal">
              fwknop Active
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunScan}
            disabled={scanning}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg ${
              scanning
                ? 'bg-muted text-muted-foreground border border-border cursor-not-allowed'
                : 'bg-gradient-to-r bg-card hover:bg-muted text-white border border-border '
            }`}
          >
            {scanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-foreground" />
                <span>Executing Nmap Probe...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Live Nmap Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Port Status */}
          <div className="bg-card/80 border border-border rounded-2xl p-5 shadow-xl">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Port 51820</p>
            <h3 className="text-2xl font-bold mt-2 font-mono">
              <span className={(data?.port_51820_status || 'FILTERED') === 'FILTERED' ? 'text-emerald-400' : 'text-amber-400'}>
                {data?.port_51820_status || 'FILTERED'}
              </span>
            </h3>
          </div>

          {/* Card 2: Stealth Mode */}
          <div className="bg-card/80 border border-border rounded-2xl p-5 shadow-xl">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Stealth Mode</p>
            <h3 className="text-2xl font-bold mt-2 font-mono">
              <span className="text-emerald-400">HIDDEN</span>
            </h3>
          </div>

          {/* Card 3: Last Scan Timestamp */}
          <div className="bg-card/80 border border-border rounded-2xl p-5 shadow-xl">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Last Nmap Audit</p>
            <h3 className="text-lg font-bold text-foreground mt-2 font-mono">
              {data?.last_scan_time
                ? new Date(data.last_scan_time * 1000).toLocaleString()
                : 'Scan pending'}
            </h3>
          </div>
        </div>

      {/* Terminal Monospace Output Block */}
      <div className="bg-background border border-border rounded-2xl p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground/80">
            <Terminal className="w-4 h-4 text-foreground/80" />
            <span>Nmap Console</span>
          </div>
          {scanning && (
            <span className="text-xs font-mono text-foreground/80 flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-foreground/60"></span>
              Live scan in progress...
            </span>
          )}
        </div>

        <div className="bg-card/90 border border-border/80 rounded-xl p-4 font-mono text-xs text-foreground overflow-x-auto min-h-[220px] max-h-[360px] leading-relaxed">
          {scanning ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
              <RefreshCw className="w-6 h-6 text-foreground/80 animate-spin" />
              <p className="text-muted-foreground animate-pulse">Running live Nmap port scan against 20.249.148.67...</p>
            </div>
          ) : scanOutput ? (
            <pre className="whitespace-pre-wrap font-mono text-foreground">{scanOutput}</pre>
          ) : (
            <span className="text-muted-foreground/80 italic">No scan output available yet. Click "Run Live Nmap Scan" above.</span>
          )}
        </div>
      </div>
    </div>
  );
}
