export const GRAFANA_URL =
  import.meta.env.PROD ? '/grafana' : (import.meta.env.VITE_GRAFANA_URL ?? 'http://20.249.148.67:3000');

export const GRAFANA_PANELS = [
  {
    uid: 'advq4cq',
    panelId: 'panel-1',
    title: 'LTI Server',
    slug: 'lti-server',
    orgId: 1,
    from: 'now-6h',
    to: 'now',
    timezone: 'browser',
    refresh: '5s',
  },
];

export function panelEmbedUrl(p, cacheBust) {
  const params = new URLSearchParams({
    panelId: String(p.panelId),
    orgId: String(p.orgId ?? 1),
    theme: 'dark',
  });
  if (p.from) params.set('from', p.from);
  if (p.to) params.set('to', p.to);
  if (p.timezone) params.set('timezone', p.timezone);
  if (p.refresh) params.set('refresh', p.refresh);
  params.set('_t', String(cacheBust ?? Date.now()));
  return `${GRAFANA_URL}/d-solo/${p.uid}/${p.slug ?? 'panel'}?${params.toString()}`;
}

export function dashboardUrl() {
  return `${GRAFANA_URL}/dashboards`;
}

export function isConfigured() {
  return GRAFANA_PANELS.length > 0 && GRAFANA_PANELS.every((p) => !p.uid.startsWith('REPLACE_'));
}
