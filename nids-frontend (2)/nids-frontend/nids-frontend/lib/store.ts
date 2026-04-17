'use client';

import { create } from 'zustand';
import type { ThreatEvent, SystemHealth, NidsSettings } from './types';
import { DEFAULT_SETTINGS } from './types';

interface ExtendedHealth extends SystemHealth {
  avg_confidence: number;
  total_conf_sum: number;
}

interface NidsStore {
  settings: NidsSettings;
  updateSettings: (patch: Partial<NidsSettings>) => void;
  events: ThreatEvent[];
  pushEvent: (event: ThreatEvent) => void;
  clearHistory: () => void;
  health: ExtendedHealth;
  setConnected: (connected: boolean) => void;
  recordLatency: (ms: number) => void;
  incrementPredictions: (count: number, threats: number, confSum: number) => void;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  demoMode: boolean;
  setDemoMode: (v: boolean) => void;
  fetchData: () => Promise<void>;
}

export const useNidsStore = create<NidsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
  events: [],
  pushEvent: (event) => set((s) => ({
    events: [event, ...s.events].slice(0, 100),
  })),
  clearHistory: () => set({ 
    events: [],
    health: { 
      connected: true, 
      avg_latency_ms: 0, 
      total_predictions: 0, 
      threat_count: 0, 
      total_conf_sum: 0, 
      avg_confidence: 0,
      uptime_start: Date.now(),
      last_seen: Date.now()
    }
  }),
  health: {
    connected: false,
    avg_latency_ms: 0,
    total_predictions: 0,
    threat_count: 0,
    avg_confidence: 0, 
    total_conf_sum: 0,
    uptime_start: Date.now(),
    last_seen: null,
  },
  setConnected: (connected) => set((s) => ({ health: { ...s.health, connected } })),
  recordLatency: (ms) => set((s) => ({
    health: { ...s.health, avg_latency_ms: ms, last_seen: Date.now() },
  })),
  
incrementPredictions: (count: number, threats: number, confSum: number) => set((s) => {
    const newTotal = (s.health.total_predictions || 0) + count;   
    const newSum = (s.health.total_conf_sum || 0) + confSum; 
    return {
      health: { 
        ...s.health, 
        total_predictions: newTotal,
        threat_count: (s.health.threat_count || 0) + threats,
        total_conf_sum: (s.health.total_conf_sum || 0) + confSum,
        avg_confidence: count > 0 ? (confSum / count) : s.health.avg_confidence 
      }
    };
}),

  selectedEventId: null,
  setSelectedEventId: (id) => set({ selectedEventId: id }),
  demoMode: false,
  setDemoMode: (v) => set({ demoMode: v }),

  fetchData: async () => {
    const { settings, pushEvent, recordLatency, incrementPredictions, setConnected } = get();
    const startTime = Date.now();
    try {
      if (!settings.apiUrl) return;

      const baseUrl = settings.apiUrl.replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/predict_live`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      
      if (!res.ok) throw new Error("API Response Error");

      const data = await res.json();
      const raw = data.predictions || [];
      const actualLatency = Date.now() - startTime;

      setConnected(true);
      recordLatency(actualLatency);

      if (raw.length > 0) {
        let batchSum = 0;
        const processed: ThreatEvent[] = raw.map((p: any) => {
          const conf = typeof p.confidence === 'string' 
            ? parseFloat(p.confidence.replace('%', '')) / 100 
            : (Number(p.confidence) || 0.92);
            
          batchSum += conf;
          return {
            id: String(p.id || Math.random()),
            timestamp: Date.now(),
            status: (p.status || 'BENIGN') as 'BENIGN' | 'THREAT',
            threat_type: String(p.threat_type || 'Normal'),
            severity: (p.severity || 'LOW') as 'LOW' | 'MEDIUM' | 'HIGH',
            confidence: conf,
            latency_ms: actualLatency,
          };
        });

        const threatCount = processed.filter((e: ThreatEvent) => e.status === 'THREAT').length;
        incrementPredictions(processed.length, threatCount, batchSum);
        processed.forEach((e: ThreatEvent) => pushEvent(e));
      }
    } catch (err) {
      setConnected(false);
      console.error("Dashboard Sync Error:", err);
    }
  },
}));