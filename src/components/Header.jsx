import React, { useState, useEffect } from 'react';

export default function Header({ globalError }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 border-b border-border/80 bg-background/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-card border border-border">
          <span
            className={`w-2 h-2 rounded-full ${
              globalError ? 'bg-red-500 animate-pulse' : 'bg-emerald-400 animate-pulse'
            }`}
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
            Status:{' '}
            <span
              className={`font-bold ${
                globalError ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {globalError ? 'DISCONNECTED' : 'SECURE'}
            </span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-card/80 border border-border">
          <span className="text-muted-foreground">API:</span>
          <span className="text-foreground font-medium">20.249.148.67:8000</span>
        </div>

        <div className="text-xs font-mono text-muted-foreground bg-card/90 px-3 py-1.5 rounded-lg border border-border">
          {time.toLocaleTimeString()} UTC
        </div>
      </div>
    </header>
  );
}
