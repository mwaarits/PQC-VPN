import React, { useState, useEffect } from 'react';
import { fetchLogs } from '../api';
import ErrorAlert from '../components/ErrorAlert';
import { Terminal, RefreshCw } from 'lucide-react';
import { GRAFANA_PANELS, panelEmbedUrl } from '../lib/grafana';

function PanelCard({ panel, cacheBust }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = panelEmbedUrl(panel, cacheBust);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [cacheBust]);

  return (
    <div className="bg-card/70 border border-border rounded-2xl overflow-hidden shadow-md">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/80">
        <h3 className="text-sm font-bold text-foreground">{panel.title}</h3>
        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
          panel {panel.panelId}
        </span>
      </div>
      <div className="relative h-[360px] w-full bg-background">
        {!loaded && !failed && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            Loading panel...
          </div>
        )}
        {failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-4">
            <p className="text-xs text-muted-foreground">
              Panel blocked. Set <code className="font-mono">allow_embedding = true</code> in Grafana.
            </p>
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-foreground bg-card border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              Open panel
            </a>
          </div>
        ) : (
          <iframe
            key={cacheBust}
            src={src}
            title={panel.title}
            className="h-full w-full"
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  );
}

export default function LogsMonitoring() {
  const [source, setSource] = useState('fwknop');
  const [logData, setLogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const sources = [
    { id: 'fwknop', label: 'fwknop SPA Daemon' },
    { id: 'prometheus', label: 'Prometheus Metrics' },
    { id: 'api', label: 'FastAPI Backend' },
  ];

  const loadLogs = async (selectedSource = source) => {
    setLoading(true);
    try {
      setError(null);
      const res = await fetchLogs(selectedSource, 50);
      setLogData(res);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.message || `Failed to fetch logs for ${selectedSource}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(source);
    const interval = setInterval(() => loadLogs(source), 10000);
    return () => clearInterval(interval);
  }, [source]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Logs & Monitoring
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-xs font-mono text-muted-foreground/80">
              {lastRefreshed.toLocaleTimeString()} (10s)
            </span>
          )}
          <button
            onClick={() => loadLogs(source)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-card hover:bg-muted text-foreground rounded-lg border border-border transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <ErrorAlert
          message={error}
          onRetry={() => loadLogs(source)}
        />
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Grafana</h3>
          <button
            onClick={() => setRefreshKey(Date.now())}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-card hover:bg-muted text-foreground rounded-lg border border-border transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Panels
          </button>
        </div>
        <div className="grid gap-4">
          {GRAFANA_PANELS.map((p) => (
            <PanelCard key={`${p.uid}-${p.panelId}`} panel={p} cacheBust={refreshKey} />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {sources.map((tab) => {
          const isActive = source === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSource(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-card text-foreground font-bold border border-border shadow-sm'
                  : 'bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-background border border-border rounded-2xl p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground/80">
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <span>
              Logs: <strong className="text-foreground">{source.toUpperCase()}</strong>
            </span>
          </div>
        </div>

        <div className="bg-black/40 border border-border rounded-xl p-4 font-mono text-xs overflow-x-auto min-h-[380px] max-h-[500px] leading-relaxed">
          {loading && !logData ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <p className="text-muted-foreground font-mono text-xs">Loading log stream...</p>
            </div>
          ) : logData?.logs && logData.logs.length > 0 ? (
            <div className="space-y-1.5">
              {logData.logs.map((line, idx) => {
                let textColor = 'text-foreground/80';
                if (line.includes('[ALERT]') || line.includes('ERROR') || line.includes('Dropped')) {
                  textColor = 'text-red-400 font-semibold';
                } else if (line.includes('[SPA]') || line.includes('[ROSENPASS]') || line.includes('200 OK')) {
                  textColor = 'text-emerald-400';
                }

                return (
                  <div key={idx} className="flex items-start gap-3 hover:bg-card/60 py-0.5 px-2 rounded">
                    <span className="text-muted-foreground/60 select-none w-8 text-right font-mono text-[11px]">
                      {idx + 1}
                    </span>
                    <span className={`flex-1 font-mono whitespace-pre-wrap ${textColor}`}>
                      {line}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-muted-foreground/80 italic p-4">No log entries for source: {source}</div>
          )}
        </div>
      </div>
    </div>
  );
}
