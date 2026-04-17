'use client';

import { useEffect, useRef } from 'react';
import { useNidsStore } from './store';

export function useNidsPoller() {
  const { settings, demoMode, fetchData } = useNidsStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const tick = async () => {
      if (!demoMode) {
        await fetchData();
      }
    };

    tick();
    intervalRef.current = setInterval(tick, settings.pollingIntervalMs || 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [settings.apiUrl, settings.pollingIntervalMs, demoMode, fetchData]);
}