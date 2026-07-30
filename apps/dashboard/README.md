# LTI PQC-VPN Dashboard

## Prerequisites
- Node.js 18+
- npm

## Run Locally
```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. The app connects to `http://20.249.148.67:8000` as the API backend.

For offline development, run the dummy server alongside:
```bash
python3 dummy-server.py
```

## Build
```bash
npm run build
npm run preview
```

## Environment
- `VITE_GRAFANA_URL` — optional, for Grafana embed URL override
- In production (`vercel.json`), `/api/*` and `/grafana/*` are proxied to the backend
