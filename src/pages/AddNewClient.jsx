import React, { useState } from 'react';
import { Copy, Check, AlertTriangle, Info, Terminal, FileCode2, Eye, EyeOff } from 'lucide-react';

function genServerPeer(pubkey, ip) {
  return `[Peer]
PublicKey = ${pubkey}
AllowedIPs = ${ip}/32
PersistentKeepalive = 25`;
}

function genClientConf(privkey, ip, serverPubkey, serverEndpoint) {
  return `[Interface]
PrivateKey = ${privkey}
Address = ${ip}/24

[Peer]
PublicKey = ${serverPubkey}
Endpoint = ${serverEndpoint || '20.249.148.67:51820'}
AllowedIPs = 10.100.0.0/24
PersistentKeepalive = 25`;
}

const steps = [
  {
    title: 'Generate Keys for the New Client',
    explanation: 'Generate a new WireGuard keypair and a new Rosenpass keypair for the incoming bank.',
    blocks: [
      {
        type: 'shell',
        label: 'Generate WireGuard & Rosenpass keys:',
        code: `wg genkey | tee bank_new_private.key | wg pubkey > bank_new_public.key\n\nrosenpass gen-keys --secret-key bank_new_rp_secret.key \\\n                    --public-key bank_new_rp_public.key`,
      },
    ],
  },
  {
    title: 'Assign a Tunnel IP',
    explanation: 'Assign the next available address in the 10.100.0.0/24 range. Record the assignment to avoid collisions with existing peers.',
    blocks: [
      {
        type: 'note',
        icon: Info,
        text: 'Example: if Bank A is 10.100.0.2 and Bank B is 10.100.0.3, the next client would be assigned 10.100.0.4.',
      },
    ],
  },
  {
    title: 'Add the Peer to WireGuard',
    explanation: 'Append a new [Peer] block to the server\'s WireGuard configuration.',
    blocks: [
      {
        type: 'shell',
        label: 'Open the WireGuard config:',
        code: 'sudo nano /etc/wireguard/wg0.conf',
      },
      {
        type: 'config',
        label: 'Append this block:',
        code: `[Peer]
PublicKey = <new client's WireGuard public key>
AllowedIPs = 10.100.0.4/32
PersistentKeepalive = 25`,
      },
    ],
  },
  {
    title: 'Reload WireGuard Without Downtime',
    explanation: 'Apply the new configuration using a live sync rather than restarting the interface, so existing connected peers are not disconnected.',
    blocks: [
      {
        type: 'shell',
        code: 'wg syncconf wg0 <(wg-quick strip wg0)',
      },
      {
        type: 'warning',
        icon: AlertTriangle,
        text: 'Do not use `wg-quick down wg0` followed by `wg-quick up wg0` for this step — that will disconnect every currently connected peer, not just the one being added.',
      },
    ],
  },
  {
    title: 'Update the Rosenpass Configuration',
    explanation: 'Add the new peer\'s public key and endpoint to the Rosenpass exchange configuration, then restart the process.',
    blocks: [
      {
        type: 'shell',
        label: 'Restart Rosenpass with the new peer:',
        code: `pkill rosenpass\n\nrosenpass exchange \\\n  public-key ~/lti-keys/lti_rp_public.key \\\n  secret-key ~/lti-keys/lti_rp_secret.key \\\n  listen 0.0.0.0:9999 \\\n  peer public-key ~/lti-keys/bank_a_rp_public.key endpoint 10.100.0.2:9999 \\\n  peer public-key ~/lti-keys/bank_b_rp_public.key endpoint 10.100.0.3:9999 \\\n  peer public-key ~/lti-keys/bank_new_rp_public.key endpoint 10.100.0.4:9999 &`,
      },
    ],
  },
  {
    title: 'Deliver the Client Configuration',
    explanation: 'Provide the new bank with a WireGuard client configuration file containing their private key, assigned tunnel IP, the LTI Server\'s public key, and the server endpoint.',
    blocks: [
      {
        type: 'config',
        label: 'Client configuration file (bank_new.conf):',
        code: `[Interface]
PrivateKey = <new client's private key>
Address = 10.100.0.4/24\n[Peer]
PublicKey = <LTI Server's public key>
Endpoint = 20.249.148.67:51820
AllowedIPs = 10.100.0.0/24
PersistentKeepalive = 25`,
      },
    ],
  },
  {
    title: 'Verify the New Peer',
    explanation: 'Confirm the new peer appears and completes a handshake once the client connects.',
    blocks: [
      {
        type: 'shell',
        label: 'Check peer status:',
        code: 'sudo wg show',
      },
      {
        type: 'tip',
        icon: Check,
        text: 'Look for the new peer\'s public key in the output, with a recent \'latest handshake\' time once the client activates their tunnel.',
      },
    ],
  },
];

function CodeBlock({ block }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(block.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isShell = block.type === 'shell';
  const isConfig = block.type === 'config';

  if (!isShell && !isConfig) return null;

  return (
    <div className="space-y-1.5">
      {block.label && (
        <p className="text-xs font-mono text-muted-foreground">{block.label}</p>
      )}
      <div className={`relative rounded-xl border ${
        isShell ? 'bg-black/70 border-border/80' : 'bg-background/80 border-border'
      }`}>
        <button
          onClick={copy}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-card/80 border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer z-10"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
        <pre className="p-4 pr-12 text-xs font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
          <code className={isShell ? 'text-emerald-300/90' : 'text-foreground/80'}>
            {isShell
              ? block.code.split('\n').map((line, i) => (
                  <span key={i} className="block">
                    {line ? <span className="text-muted-foreground select-none mr-2">$</span> : null}{line}
                  </span>
                ))
              : block.code}
          </code>
        </pre>
      </div>
    </div>
  );
}

function CalloutBlock({ block }) {
  const Icon = block.icon || Info;

  const styles = {
    warning: 'bg-amber-950/30 border-amber-800/40 text-amber-300/80',
    tip: 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300/80',
    note: 'bg-cyan-950/30 border-cyan-800/40 text-cyan-300/80',
  };

  return (
    <div className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs ${styles[block.type] || styles.note}`}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span className="font-mono leading-relaxed whitespace-pre-wrap">{block.text}</span>
    </div>
  );
}

function StepBlock({ block }) {
  if (block.type === 'shell' || block.type === 'config') {
    return <CodeBlock block={block} />;
  }
  return <CalloutBlock block={block} />;
}

export default function AddNewClient() {
  const [clientPubkey, setClientPubkey] = useState('');
  const [clientPrivkey, setClientPrivkey] = useState('');
  const [tunnelIP, setTunnelIP] = useState('');
  const [serverPubkey, setServerPubkey] = useState('');
  const [showPrivkey, setShowPrivkey] = useState(false);
  const [copiedPeer, setCopiedPeer] = useState(false);
  const [copiedConf, setCopiedConf] = useState(false);

  const hasInput = clientPubkey && tunnelIP;
  const serverPeer = hasInput ? genServerPeer(clientPubkey, tunnelIP) : '';
  const clientConf = hasInput && clientPrivkey ? genClientConf(clientPrivkey, tunnelIP, serverPubkey) : '';

  const copyPeer = async () => {
    await navigator.clipboard.writeText(serverPeer);
    setCopiedPeer(true);
    setTimeout(() => setCopiedPeer(false), 2000);
  };

  const copyConf = async () => {
    await navigator.clipboard.writeText(clientConf);
    setCopiedConf(true);
    setTimeout(() => setCopiedConf(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border/80 pb-4">
        <h2 className="text-2xl font-bold text-foreground">Add New Client</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          This is a reference guide for administrators.
        </p>
      </div>

      {/* Config Generator */}
      <div className="bg-card/80 border border-border rounded-2xl p-6 shadow-xl space-y-5">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <FileCode2 className="w-4 h-4" />
          Config Generator
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono text-muted-foreground mb-1.5 block">Client Public Key *</label>
            <input
              type="text"
              value={clientPubkey}
              onChange={(e) => setClientPubkey(e.target.value)}
              placeholder="e.g. xTIBdR2B7v3G..."
              className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/40"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground mb-1.5 block">Tunnel IP Address *</label>
            <input
              type="text"
              value={tunnelIP}
              onChange={(e) => setTunnelIP(e.target.value)}
              placeholder="e.g. 10.100.0.4"
              className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/40"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground mb-1.5 block">Client Private Key</label>
            <div className="relative">
              <input
                type={showPrivkey ? 'text' : 'password'}
                value={clientPrivkey}
                onChange={(e) => setClientPrivkey(e.target.value)}
                placeholder="— needed for client .conf —"
                className="w-full px-3 py-2 pr-9 text-xs font-mono bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/40"
              />
              <button
                onClick={() => setShowPrivkey(!showPrivkey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPrivkey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground mb-1.5 block">Server Public Key</label>
            <input
              type="text"
              value={serverPubkey}
              onChange={(e) => setServerPubkey(e.target.value)}
              placeholder="LTI Server WireGuard public key"
              className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/40"
            />
          </div>
        </div>

        {hasInput && (
          <div className="space-y-4 pt-2 border-t border-border">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono text-muted-foreground">Server Peer Block (append to wg0.conf)</span>
                <button
                  onClick={copyPeer}
                  className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {copiedPeer ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedPeer ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-black/70 border border-border/80 rounded-xl p-4 text-xs font-mono text-emerald-300/90 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {serverPeer}
              </pre>
            </div>

            {clientConf && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-muted-foreground">Client .conf File</span>
                  <button
                    onClick={copyConf}
                    className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {copiedConf ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedConf ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-background/80 border border-border rounded-xl p-4 text-xs font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {clientConf}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-0 max-h-[600px] overflow-y-auto pr-1 border border-border/60 rounded-2xl p-4 bg-card/30">
        {steps.map((step, idx) => (
          <div key={idx} className="relative flex gap-5 pb-8 last:pb-0">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-card border-2 border-border flex items-center justify-center text-sm font-bold text-foreground font-mono flex-shrink-0 z-10">
                {idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div className="w-px flex-1 bg-border/60 mt-1" />
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-3 pt-1">
              <h3 className="text-base font-bold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.explanation}</p>
              <div className="space-y-3">
                {step.blocks.map((block, bi) => (
                  <StepBlock key={bi} block={block} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
