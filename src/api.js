const API_BASE_URL = 'http://20.249.148.67:8000';

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      throw new Error(`Connection timeout: Unable to reach ${url}`);
    }
    throw err;
  }
}

export async function fetchStatus() {
  const res = await fetchWithTimeout(`${API_BASE_URL}/api/status`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchTopology() {
  const res = await fetchWithTimeout(`${API_BASE_URL}/api/topology`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchPQC() {
  const res = await fetchWithTimeout(`${API_BASE_URL}/api/pqc`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchDarkNetwork() {
  const res = await fetchWithTimeout(`${API_BASE_URL}/api/dark-network`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function triggerDarkNetworkScan() {
  const res = await fetchWithTimeout(`${API_BASE_URL}/api/dark-network/scan`, { method: 'POST' }, 15000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchBenchmark() {
  const res = await fetchWithTimeout(`${API_BASE_URL}/api/benchmark`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchLogs(source = 'fwknop', lines = 50) {
  const res = await fetchWithTimeout(`${API_BASE_URL}/api/logs?source=${source}&lines=${lines}`, {}, 8000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchTransactionStatus() {
  const res = await fetchWithTimeout(`${API_BASE_URL}/v1/status`, {}, 5000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function postTransaction(amount, recipient) {
  const res = await fetchWithTimeout(
    `${API_BASE_URL}/v1/transaction`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, recipient }),
    },
    10000
  );
  const body = await res.json();
  if (!res.ok) throw new Error(body.detail || `HTTP ${res.status}`);
  return body;
}
