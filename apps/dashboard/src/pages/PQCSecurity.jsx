import React, { useState, useEffect } from 'react';
import { fetchPQC } from '../api';
import ErrorAlert from '../components/ErrorAlert';
import { ShieldCheck, Cpu, Key, Lock, CheckCircle2, AlertTriangle, Info, Zap } from 'lucide-react';

export default function PQCStatus() {
  const [pqcData, setPqcData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPQC = async () => {
    try {
      setError(null);
      const res = await fetchPQC();
      setPqcData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch PQC status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPQC();
  }, []);

  const comparisonTable = [
    {
      algorithm: "RSA-2048",
      type: "Asymmetric (Factorization)",
      keySize: "2048 bits (256 B)",
      securityLevel: "112-bit Classical",
      quantumStatus: "BROKEN by Shor's Algorithm",
      statusColor: "text-red-400 border-red-800/80 bg-red-950/60",
      nistStatus: "Deprecated for PQC"
    },
    {
      algorithm: "ECDSA P-256",
      type: "Elliptic Curve (ECDLP)",
      keySize: "256 bits (32 B)",
      securityLevel: "128-bit Classical",
      quantumStatus: "BROKEN by Shor's Algorithm",
      statusColor: "text-red-400 border-red-800/80 bg-red-950/60",
      nistStatus: "Deprecated for PQC"
    },
    {
      algorithm: "X25519",
      type: "Classical Diffie-Hellman",
      keySize: "256 bits (32 B)",
      securityLevel: "128-bit Classical",
      quantumStatus: "VULNERABLE (Harvest-Now-Decrypt-Later)",
      statusColor: "text-amber-400 border-amber-800/80 bg-amber-950/60",
      nistStatus: "Classical Only"
    },
    {
      algorithm: "ML-KEM-1024",
      type: "Lattice-Based Module-LWR",
      keySize: "12,544 bits (1568 B)",
      securityLevel: "Category 5 (256-bit Quantum)",
      quantumStatus: "QUANTUM RESISTANT (Immune to Shor's)",
      statusColor: "text-emerald-400 border-emerald-800/80 bg-emerald-950/60 font-bold",
      nistStatus: "NIST FIPS 203 Standardized"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Post-Quantum Cryptographic Security
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-card/80 border border-border text-foreground/80 font-normal">
              NIST FIPS 203
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
              </div>
      </div>

      {error && (
        <ErrorAlert
          message={error}
          onRetry={loadPQC}
        />
      )}

      {/* Live PQC Engine Status Cards */}
      {pqcData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Engine Status */}
          <div className="bg-card/80 border border-border rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">PQC Status</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
              {pqcData.status || 'ACTIVE'}
            </h3>
          </div>

          {/* Card 2: Algorithm Name */}
          <div className="bg-card/80 border border-border rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Algorithm</p>
            <h3 className="text-2xl font-bold text-foreground mt-2 font-mono">
              {pqcData.algorithm || 'ML-KEM-1024'}
            </h3>
          </div>

          {/* Card 3: Public Key Size */}
          <div className="bg-card/80 border border-border rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Public Key Size</p>
            <h3 className="text-2xl font-bold text-foreground mt-2 font-mono">
              {pqcData.public_key_size_bytes ? `${pqcData.public_key_size_bytes} Bytes` : '1568 Bytes'}
            </h3>
          </div>

          {/* Card 4: Rekey Interval */}
          <div className="bg-card/80 border border-border rounded-2xl p-5 shadow-lg">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Key Rotation</p>
            <h3 className="text-2xl font-bold text-foreground mt-2 font-mono">
              {pqcData.rekey_interval_seconds ? `${pqcData.rekey_interval_seconds}s` : '120s'}
            </h3>
          </div>
        </div>
      )}

      {/* Cryptographic Quantum Resistance Comparison Table */}
      <div className="bg-card/80 border border-border rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-lg font-bold text-foreground">
            Quantum Resistance Reference Matrix
          </h3>
          <span className="text-xs font-mono bg-muted text-foreground/80 px-3 py-1 rounded-full border border-border">
            Static Reference
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs font-mono text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Key Size</th>
                <th className="py-3 px-4">Classical Security</th>
                <th className="py-3 px-4">Quantum Resistance Status</th>
                <th className="py-3 px-4">NIST Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {comparisonTable.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                    {row.algorithm}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-foreground/80">
                    {row.type}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                    {row.keySize}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-foreground/80">
                    {row.securityLevel}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs">
                    <span className={`inline-block px-2.5 py-1 rounded border text-xs font-semibold ${row.statusColor}`}>
                      {row.quantumStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                    {row.nistStatus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
