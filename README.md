
## Structure
- `apps/dashboard/` — PQC-VPN monitoring dashboard (React + Vite)
- `Presentation/` — project documentation

## Run Dashboard
```bash
cd apps/dashboard
npm install
npm run dev
```

See [apps/dashboard/README.md](apps/dashboard/README.md) for details.

# LTI PQC VPN — Dark Network Mesh & Post-Quantum Cryptography VPN

A multi-layer VPN security system built for a simulated B2B FinTech
inter-bank network, designed to protect today's transaction traffic
against both current network threats and future quantum computing
attacks.

This project was developed as a final project for President
University, implementing a fictional deployment for **Lodaya
Technologies Indonesia (LTI)**, a B2B FinTech company processing
high-frequency transactions between partner banks.

---

## The Problem

Traditional VPN encryption (RSA, ECC) relies on mathematical problems
that are solvable by a sufficiently powerful quantum computer running
Shor's algorithm. This creates a "Harvest Now, Decrypt Later" risk:
an adversary can record encrypted traffic today and decrypt it
retroactively once quantum computing matures — a real long-term risk
for financial data that must stay confidential for years.

This project addresses that risk with three independent, complementary
security layers rather than a single point of protection.

---

## Architecture

```
                    +-------------------------+
                    |     LTI Core Server      |
                    |   (Azure VPS, public IP) |
                    |                           |
                    |  fwknop -> WireGuard      |
                    |            -> Rosenpass   |
                    +------------+--------------+
                                 |
                 WireGuard tunnel (PQC-keyed)
                     /                      \
             +--------------+        +--------------+
             |   Bank A     |        |   Bank B     |
             | 10.100.0.2   |        | 10.100.0.3   |
             +--------------+        +--------------+
```

### Layer 1 — Dark Network (`fwknop`)
The VPN's WireGuard port stays completely closed to the public
internet by default. A client must first send a single, encrypted,
HMAC-authenticated packet (Single Packet Authorization) before the
port opens — for exactly 10 seconds, and only to that client's IP.

### Layer 2 — Mesh VPN (`WireGuard`)
Every bank connects to LTI through its own independent, encrypted
WireGuard tunnel using Curve25519, forming a mesh rather than routing
all traffic through a single fragile hub.

### Layer 3 — Post-Quantum Cryptography (`Rosenpass`)
Running alongside WireGuard, Rosenpass performs an ML-KEM-1024
(NIST FIPS 203) key exchange and injects a fresh quantum-resistant
pre-shared key into the tunnel every 120 seconds — without ever
dropping the connection.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Dark Network / SPA | fwknop |
| VPN Tunnel | WireGuard |
| Post-Quantum Key Exchange | Rosenpass (ML-KEM-1024) |
| Transaction Simulation API | FastAPI |
| Monitoring | Prometheus, Grafana, WireGuard exporter |
| Web Dashboard | React 19, Vite, Tailwind CSS, React Flow |
| Infrastructure | Azure VPS (Ubuntu 24.04 LTS) |

---


## Web Dashboard

A companion dashboard provides live visibility into the deployed
system: tunnel status, mesh topology, PQC key rotation status, dark
network scan results, benchmark data, and log monitoring.

Live: `https://pqc-vpn.vercel.app`
Source: `/dashboard`

---

## Limitations

- A formal latency/throughput comparison against a classical
  RSA/AES-only baseline was scoped out of this iteration
- The dashboard does not currently support adding/removing clients
  directly through the backend (configuration must still be applied
  manually by an administrator)
- No authentication layer is implemented on the web dashboard

---

## AI Usage Disclaimer

This project made use of AI assistance during development for tasks
including configuration troubleshooting, documentation drafting, and
command generation. All architectural decisions, testing, and
verification were performed and validated by the project team.

---

## License

Licensed under the MIT License. See [LICENSE](LICENSE) for details.
