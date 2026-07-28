import React, { useState, useCallback } from 'react';
import { fetchTransactionStatus, postTransaction } from '../api';
import { Send, Terminal, CheckCircle2, XCircle, RefreshCw, Clock } from 'lucide-react';

function relativeTime(ts) {
  const diff = Math.floor((Date.now() - ts * 1000) / 1000);
  if (diff < 5) return 'just now';
  return `${diff}s ago`;
}

export default function TransactionDemo() {
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(false);
  const [amount, setAmount] = useState('100000');
  const [recipient, setRecipient] = useState('Bank B');
  const [sending, setSending] = useState(false);
  const [requestLog, setRequestLog] = useState(null);
  const [responseLog, setResponseLog] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const checkStatus = useCallback(async () => {
    setChecking(true);
    setError(null);
    try {
      const res = await fetchTransactionStatus();
      setStatus({ ok: true, data: res });
    } catch {
      setStatus({ ok: false });
    } finally {
      setChecking(false);
    }
  }, []);

  const handleSend = async () => {
    setSending(true);
    setError(null);
    const amt = parseInt(amount, 10) || 0;
    const recip = recipient.trim() || 'Unknown';

    const curl = `curl -X POST http://10.100.0.1:8000/v1/transaction \\\n     -H "Content-Type: application/json" \\\n     -d '${JSON.stringify({ amount: amt, recipient: recip })}'`;

    setRequestLog(curl);
    setResponseLog(null);

    try {
      const res = await postTransaction(amt, recip);
      setResponseLog({ type: 'success', body: JSON.stringify(res, null, 2) });
      setHistory((prev) => [
        { tx_id: res.tx_id, amount: res.amount, recipient: res.recipient, status: 'success', timestamp: res.timestamp },
        ...prev,
      ].slice(0, 5));
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.message.includes('timeout') || err.message.includes('NetworkError')) {
        setError('Request could not be completed — the tunnel may be down or the service unreachable.');
        setResponseLog(null);
      } else {
        setResponseLog({ type: 'fail', body: JSON.stringify({ detail: err.message }, null, 2) });
        setHistory((prev) => [
          { tx_id: null, amount: amt, recipient: recip, status: 'failed', timestamp: Date.now() / 1000 },
          ...prev,
        ].slice(0, 5));
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border/80 pb-4">
        <h2 className="text-2xl font-bold text-foreground">Transaction Demo</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          This endpoint simulates a real inter-bank transaction. It is only
          reachable through an active WireGuard tunnel — it is not exposed on
          the public internet. Use this panel to send a live test transaction
          and see the actual response from the LTI transaction service.
        </p>
      </div>

      <div className="bg-card/80 border border-border rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground">Connectivity Check</h3>
          <button
            onClick={checkStatus}
            disabled={checking}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-card hover:bg-muted text-foreground rounded-lg border border-border transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            Check Tunnel
          </button>
        </div>

        {status === null && !checking && (
          <p className="text-xs text-muted-foreground font-mono">Click "Check Tunnel" to verify connectivity.</p>
        )}

        {checking && (
          <p className="text-xs text-foreground/80 font-mono flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Checking tunnel...
          </p>
        )}

        {status && !checking && (
          <div className="flex items-center gap-2">
            {status.ok ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  Tunnel reachable — transaction service is online
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs font-mono text-red-400 font-semibold">
                  Cannot reach transaction service — check your WireGuard connection
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="bg-card/80 border border-border rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-foreground mb-4">Send Transaction</h3>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-mono text-muted-foreground mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100000"
              disabled={sending}
              className="w-full px-3 py-2 text-sm font-mono bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/40 transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-mono text-muted-foreground mb-1">Recipient</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Bank B"
              disabled={sending}
              className="w-full px-3 py-2 text-sm font-mono bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/40 transition-colors"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSend}
              disabled={sending || (status && !status.ok)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sending
                  ? 'bg-muted text-muted-foreground border border-border cursor-not-allowed'
                  : status && !status.ok
                  ? 'bg-muted text-muted-foreground border border-border cursor-not-allowed'
                  : 'bg-card hover:bg-muted text-foreground border border-border shadow-md'
              }`}
            >
              {sending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Transaction
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300/90 font-mono">{error}</p>
        </div>
      )}

      {(requestLog || responseLog) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {requestLog && (
            <div className="bg-card/80 border border-border rounded-2xl p-5 shadow-xl">
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Request</h3>
              <pre className="bg-black/70 border border-border/80 rounded-xl p-4 text-xs text-emerald-300 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
                {requestLog}
              </pre>
            </div>
          )}

          {responseLog && (
            <div className="bg-card/80 border border-border rounded-2xl p-5 shadow-xl">
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Response</h3>
              <pre className={`bg-black/70 border rounded-xl p-4 text-xs font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed ${
                responseLog.type === 'success'
                  ? 'border-emerald-800/60 text-emerald-300'
                  : 'border-red-800/60 text-red-300'
              }`}>
                {responseLog.body}
              </pre>
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="bg-card/80 border border-border rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Recent Transactions</h3>
            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
              Last 5
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  <th className="py-2.5 px-3">TX ID</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-sm">
                {history.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs text-foreground/80">
                      {tx.tx_id || '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-foreground">
                      {tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-foreground/80">
                      {tx.recipient}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs">
                      <span className={tx.status === 'success' ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                        {tx.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {relativeTime(tx.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
