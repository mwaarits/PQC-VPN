import React from 'react';

const navItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'topology', label: 'Mesh Topology' },
  { id: 'pqc', label: 'PQC Security' },
  { id: 'dark-network', label: 'Dark Network' },
  { id: 'benchmark', label: 'Benchmark' },
  { id: 'logs', label: 'Logs & Monitoring' },
  { id: 'add-client', label: 'Add New Client' },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-64 bg-background border-r border-border/80 flex flex-col flex-shrink-0 min-h-screen">
      <div className="p-5 border-b border-border/80">
        <h1 className="text-base font-bold text-foreground tracking-tight">
          LTI PQC-VPN
        </h1>
        <p className="text-[11px] font-mono text-muted-foreground font-semibold tracking-wider uppercase mt-0.5">
          Security Console
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer text-left ${
                isActive
                  ? 'bg-card text-foreground font-semibold border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/80 border border-transparent'
              }`}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/80 bg-background/50">
        <div className="text-[11px] font-mono text-muted-foreground/80 flex justify-between items-center">
          <span>Lodaya Tech Indo</span>
          <span className="text-muted-foreground font-semibold">v2.4-PQC</span>
        </div>
      </div>
    </aside>
  );
}
