'use client'

import { useState, useEffect } from 'react';

/**
 * useDataRefresh
 *
 * Returns a `refreshKey` integer that increments:
 *   1. Immediately on mount (key starts at 0, first fetch runs via the calling useEffect).
 *   2. Every `intervalMs` milliseconds (default: 15 minutes) while the page is open.
 *   3. Whenever the browser tab becomes visible again (user switches back to the tab).
 *
 * Wire `refreshKey` into the dependency array of any data-fetching useEffect to
 * automatically re-fetch on each of these events.
 */
export function useDataRefresh(intervalMs: number = 15 * 60 * 1000): number {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // ── 15-minute polling interval ─────────────────────────────────────────────
    const timer = setInterval(() => {
      setRefreshKey((k) => k + 1);
    }, intervalMs);

    // ── Tab visibility refresh ─────────────────────────────────────────────────
    // Re-fetch when the user returns to the tab (e.g. after being away > 0s).
    // We track when the tab was hidden so we only refresh if it's been hidden
    // for at least 60 seconds (avoids spurious re-fetches on quick tab switches).
    let hiddenAt: number | null = null;
    const HIDDEN_THRESHOLD_MS = 60_000; // 1 minute minimum hidden time

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now();
      } else if (document.visibilityState === 'visible' && hiddenAt !== null) {
        const hiddenDuration = Date.now() - hiddenAt;
        hiddenAt = null;
        if (hiddenDuration >= HIDDEN_THRESHOLD_MS) {
          setRefreshKey((k) => k + 1);
        }
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [intervalMs]);

  return refreshKey;
}
