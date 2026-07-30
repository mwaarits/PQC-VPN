import React, { useState, useEffect } from 'react';
import { fetchBenchmark } from '../api';
import ErrorAlert from '../components/ErrorAlert';

export default function Benchmark() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [standard] = useState({
    latency_ms: 0.037,
    throughput_mbps: 940,
    loss_pct: 0.17,
    connections: 58,
  });

  const loadBenchmark = async () => {
    try {
      setError(null);
      const res = await fetchBenchmark();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch benchmark data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBenchmark();
    const interval = setInterval(loadBenchmark, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Performance Benchmarks
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-card/80 border border-border text-foreground/80 font-normal">
              ML-KEM-1024
            </span>
          </h2>
        </div>
      </div>

      {error && (
        <ErrorAlert
          message={error}
          onRetry={loadBenchmark}
        />
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card/80 border border-border rounded-2xl p-5 shadow-lg">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Handshake Latency</p>
              <h3 className="text-3xl font-extrabold text-foreground mt-2 font-mono">
                {data.pqc_latency_ms != null ? `${data.pqc_latency_ms} ms` : 'N/A'}
              </h3>
            </div>

            <div className="bg-card/80 border border-border rounded-2xl p-5 shadow-lg">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Throughput</p>
              <h3 className="text-3xl font-extrabold text-foreground mt-2 font-mono">
                {data.pqc_throughput_mbps != null ? `${data.pqc_throughput_mbps} Mbps` : 'N/A'}
              </h3>
            </div>

            <div className="bg-card/80 border border-border rounded-2xl p-5 shadow-lg">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Packet Loss</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">
                {data.packet_loss_pct != null ? `${data.packet_loss_pct}%` : '0%'}
              </h3>
            </div>

            <div className="bg-card/80 border border-border rounded-2xl p-5 shadow-lg">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Concurrent Sessions</p>
              <h3 className="text-3xl font-extrabold text-foreground mt-2 font-mono">
                {data.concurrent_connections != null ? data.concurrent_connections : 'N/A'}
              </h3>
            </div>
          </div>

          <details className="bg-card/80 border border-border rounded-2xl shadow-xl group">
            <summary className="p-6 cursor-pointer select-none list-none flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">How Metrics Are Measured</h3>
              <span className="text-xs font-mono text-muted-foreground group-open:hidden">Click to expand</span>
              <span className="text-xs font-mono text-muted-foreground hidden group-open:inline">Collapse</span>
            </summary>
            <div className="px-6 pb-6 space-y-4 border-t border-border pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
                <div className="bg-background/60 border border-border rounded-lg p-3">
                  <span className="text-muted-foreground">Test 1 & 4 — </span>
                  <span className="text-foreground/90">Latency</span>
                  <p className="text-muted-foreground/70 mt-0.5">Measured via <code className="text-foreground/80">ping -c 20</code>. The RTT avg is taken before (Test 1) and during (Test 4) HTTP load.</p>
                </div>
                <div className="bg-background/60 border border-border rounded-lg p-3">
                  <span className="text-muted-foreground">Test 2 — </span>
                  <span className="text-foreground/90">Throughput</span>
                  <p className="text-muted-foreground/70 mt-0.5">Measured via <code className="text-foreground/80">iperf3 -u -b 100M</code> with 10 parallel streams over 60s.</p>
                </div>
                <div className="bg-background/60 border border-border rounded-lg p-3">
                  <span className="text-muted-foreground">Test 3 — </span>
                  <span className="text-foreground/90">Packet Loss &amp; Concurrency</span>
                  <p className="text-muted-foreground/70 mt-0.5">580 POST requests to <code className="text-foreground/80">/v1/transaction</code> with 58 concurrent sessions. Success/fail ratio determines loss.</p>
                </div>
                <div className="bg-background/60 border border-border rounded-lg p-3">
                  <span className="text-muted-foreground">Overhead </span>
                  <span className="text-foreground/90">Formulas</span>
                  <p className="text-muted-foreground/70 mt-0.5">latency = (PQC − Base) ÷ Base × 100<br />throughput = (Base − PQC) ÷ Base × 100</p>
                </div>
              </div>
            </div>
          </details>

          <div className="bg-card/80 border border-border rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                Data Breakdown
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-background/80 border border-border rounded-xl p-5">
                <div className="text-sm font-bold text-foreground font-mono mb-4">PQC Tunnels</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-sm font-mono text-muted-foreground">Latency</span>
                    <span className="text-base font-mono font-semibold text-foreground tabular-nums">{data.pqc_latency_ms ?? 'N/A'} <span className="text-muted-foreground/60 text-xs font-normal">ms</span></span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-sm font-mono text-muted-foreground">Throughput</span>
                    <span className="text-base font-mono font-semibold text-foreground tabular-nums">{data.pqc_throughput_mbps ?? 'N/A'} <span className="text-muted-foreground/60 text-xs font-normal">Mbps</span></span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-sm font-mono text-muted-foreground">Packet Loss</span>
                    <span className="text-base font-mono font-semibold text-foreground tabular-nums">{data.packet_loss_pct ?? '0'} <span className="text-muted-foreground/60 text-xs font-normal">%</span></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-mono text-muted-foreground">Streams</span>
                    <span className="text-base font-mono font-semibold text-foreground tabular-nums">{data.concurrent_connections ?? 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-background/80 border border-border rounded-xl p-5">
                <div className="text-sm font-bold text-foreground font-mono mb-4">Standard WG Baseline</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-sm font-mono text-muted-foreground">Latency</span>
                    <span className="text-base font-mono font-semibold text-foreground tabular-nums">{standard.latency_ms} <span className="text-muted-foreground/60 text-xs font-normal">ms</span></span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-sm font-mono text-muted-foreground">Throughput</span>
                    <span className="text-base font-mono font-semibold text-foreground tabular-nums">{standard.throughput_mbps} <span className="text-muted-foreground/60 text-xs font-normal">Mbps</span></span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-sm font-mono text-muted-foreground">Packet Loss</span>
                    <span className="text-base font-mono font-semibold text-foreground tabular-nums">{standard.loss_pct} <span className="text-muted-foreground/60 text-xs font-normal">%</span></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-mono text-muted-foreground">Streams</span>
                    <span className="text-base font-mono font-semibold text-foreground tabular-nums">{standard.connections}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
