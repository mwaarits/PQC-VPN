import React, { useState, useEffect } from 'react';
import { fetchStatus } from '../api';
import ErrorAlert from '../components/ErrorAlert';

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const loadData = async () => {
    try {
      setError(null);
      const res = await fetchStatus();
      setData(res);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.message || 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-sm font-mono text-muted-foreground">Loading status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">System Overview</h2>
        </div>
        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-xs font-mono text-muted-foreground/80">
              {lastRefreshed.toLocaleTimeString()} (15s)
            </span>
          )}
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-card hover:bg-muted text-foreground rounded-lg border border-border transition-all cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <ErrorAlert
          message={error}
          onRetry={loadData}
        />
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card/70 border border-border rounded-2xl p-5 shadow-md">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Connected Peers</p>
              <h3 className="text-3xl font-extrabold text-foreground mt-2 font-mono">{data.peer_count}</h3>
            </div>

            <div className="bg-card/70 border border-border rounded-2xl p-5 shadow-md">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">API Status</p>
              <h3 className="text-2xl font-bold mt-2 font-mono">
                <span className={data.enforcement_status === 'ENFORCED' ? 'text-emerald-400' : 'text-amber-400'}>
                  {data.enforcement_status}
                </span>
              </h3>
            </div>

            <div className="bg-card/70 border border-border rounded-2xl p-5 shadow-md">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Rosenpass PQC</p>
              <h3 className="text-2xl font-bold mt-2 font-mono">
                <span className={data.rosenpass_active ? 'text-emerald-400' : 'text-red-400'}>
                  {data.rosenpass_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </h3>
            </div>

            <div className="bg-card/70 border border-border rounded-2xl p-5 shadow-md">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">fwknop Service</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-2 font-mono uppercase">
                {data.fwknop_status || 'active'}
              </h3>
            </div>
          </div>

          <div className="bg-card/70 border border-border rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">
                Peers
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-foreground/80 ml-2">
                  {data.peers ? data.peers.length : 0} Peers
                </span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-4">Public Key</th>
                    <th className="py-3 px-4">Endpoint</th>
                    <th className="py-3 px-4">Allowed IPs</th>
                    <th className="py-3 px-4">Latest Handshake</th>
                    <th className="py-3 px-4">Transfer Stats</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {data.peers && data.peers.length > 0 ? (
                    data.peers.map((peer, idx) => (
                      <tr key={idx} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs">
                          <span className="bg-muted px-2 py-1 rounded inline-block text-foreground/80">
                            {peer.public_key.length > 20 ? peer.public_key.slice(0, 20) + '...' : peer.public_key}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-foreground">
                          {peer.endpoint}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-foreground/80">
                          <span className="bg-muted px-2 py-0.5 rounded">
                            {peer.allowed_ips}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-emerald-400">
                          {peer.latest_handshake}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-foreground/80">
                          <div className="flex items-center gap-6">
                            <span className="text-emerald-400">&#8595; {peer.transfer ? peer.transfer.split(',')[0] : 'N/A'}</span>
                            <span className="text-foreground/60">&#8593; {peer.transfer ? peer.transfer.split(',')[1] || '' : ''}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-muted-foreground/80 font-mono text-sm">
                        No active peers connected.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
