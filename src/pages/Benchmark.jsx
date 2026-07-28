import React, { useState, useEffect } from 'react';
import { fetchBenchmark } from '../api';
import ErrorAlert from '../components/ErrorAlert';

export default function Benchmark() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [standard, setStandard] = useState({
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

          <div className="bg-card/80 border border-border rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                Data Breakdown
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-background/80 border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-sm font-bold text-foreground font-mono">PQC-VPN Enforced Network</span>
                  <span className="text-[10px] font-mono bg-card text-foreground/80 px-2 py-0.5 rounded border border-border">
                    TESTED
                  </span>
                </div>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between py-1.5 border-b border-border text-foreground/80">
                    <span className="text-muted-foreground">Latency:</span>
                    <span className="font-bold text-foreground">{data.pqc_latency_ms} ms</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border text-foreground/80">
                    <span className="text-muted-foreground">Throughput:</span>
                    <span className="font-bold text-foreground">{data.pqc_throughput_mbps} Mbps</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border text-foreground/80">
                    <span className="text-muted-foreground">Packet Loss:</span>
                    <span className="font-bold text-emerald-400">{data.packet_loss_pct}%</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-foreground/80">
                    <span className="text-muted-foreground">Concurrent Streams:</span>
                    <span className="font-bold text-foreground">{data.concurrent_connections}</span>
                  </div>
                </div>
              </div>

              <div className="bg-background/80 border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-sm font-bold text-foreground font-mono">
                    Standard WireGuard Baseline
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-card text-foreground/80 px-2 py-0.5 rounded border border-border">
                      TESTED
                    </span>
                  </div>
                </div>
                <div className="space-y-3 font-mono text-xs text-foreground/80">
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Latency:</span>
                    <span className="font-bold text-foreground">{standard.latency_ms} ms</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Throughput:</span>
                    <span className="font-bold text-foreground">{standard.throughput_mbps} Mbps</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Packet Loss:</span>
                    <span className="font-bold text-foreground">{standard.loss_pct}%</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted-foreground">Concurrent Streams:</span>
                    <span className="font-bold text-foreground">{standard.connections}</span>
                  </div>
                </div>
              </div>
            </div>

            {(() => {
              const lo = data.pqc_latency_ms != null
                ? ((data.pqc_latency_ms - standard.latency_ms) / standard.latency_ms * 100).toFixed(1)
                : null;
              const to = data.pqc_throughput_mbps != null
                ? ((standard.throughput_mbps - data.pqc_throughput_mbps) / standard.throughput_mbps * 100).toFixed(1)
                : null;
              return (
                <div className="border-t border-border pt-4 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] font-mono">
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-foreground/90">
                    <span className="text-muted-foreground">Latency Overhead </span>
                    <span className="font-bold text-amber-400">{lo ? `+${lo}%` : 'N/A'}</span>
                    <span className="text-muted-foreground/60 ml-1">(PQC is slower)</span>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-foreground/90">
                    <span className="text-muted-foreground">Throughput Overhead </span>
                    <span className="font-bold text-blue-400">{to ? `${to}%` : 'N/A'}</span>
                    <span className="text-muted-foreground/60 ml-1">(throughput drops)</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}
