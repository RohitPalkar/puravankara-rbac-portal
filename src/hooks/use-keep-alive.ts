import { useEffect } from 'react';

import { CONFIG } from 'src/config-global';

/**
 * Keeps Render free tier warm by pinging /health every 5m.
 * Render sleeps after 15m idle -> 30s cold start. This prevents sluggish login.
 */
export function useKeepAlive() {
  useEffect(() => {
    if (!CONFIG.serverUrl) return undefined;
    const url = `${CONFIG.serverUrl}/api/v1/health`;
    const ping = () => {
      fetch(url, { method: 'GET', keepalive: true }).catch(() => {});
    };
    ping(); // immediate
    const id = setInterval(ping, 5 * 60 * 1000);
    // also ping on visibility change (user returns to tab)
    const onVisible = () => {
      if (document.visibilityState === 'visible') ping();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}
