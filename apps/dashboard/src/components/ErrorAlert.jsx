import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorAlert({ message, onRetry }) {
  return (
    <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-4 mb-6 backdrop-blur-md ">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-red-200 uppercase tracking-wide">
              API Connection Interrupted
            </h4>
            <p className="text-xs text-red-300/80 mt-1 font-mono">
              {message || 'Failed to fetch data from http://20.249.148.67:8000. Remote server may be unreachable or network filtered.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-900/60 hover:bg-red-800 text-red-100 rounded-lg border border-red-700/50 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry API
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
