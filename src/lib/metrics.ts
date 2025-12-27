type Payload = Record<string, any>;

const endpoint = import.meta.env.VITE_METRICS_ENDPOINT;

export function logEvent(eventName: string, payload: Payload = {}) {
  const body = {
    event: eventName,
    payload,
    ts: new Date().toISOString(),
    path: typeof window !== 'undefined' ? window.location.pathname : '',
  };
  if (endpoint) {
    try {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  } else {
    console.log('[metrics]', body);
  }
}

let startTs: number | null = null;

export function startPageTimer(pageKey = 'page') {
  startTs = performance.now();
  logEvent('page_start', { pageKey });
}

export function endPageTimer(pageKey = 'page') {
  if (startTs == null) return;
  const durationMs = performance.now() - startTs;
  logEvent('page_end', { pageKey, durationMs });
  startTs = null;
}

export function logExposure(experiment: string, variant: string) {
  logEvent('experiment_exposure', { experiment, variant });
}
