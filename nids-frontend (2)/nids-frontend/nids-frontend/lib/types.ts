// ─── API Response ───────────────────────────────────────────────────────────

export type ThreatStatus = 'THREAT' | 'BENIGN';

export type ThreatType =
  | 'BENIGN'
  | 'DoS Hulk'
  | 'PortScan'
  | 'DDoS'
  | 'DoS GoldenEye'
  | 'FTP-Patator'
  | 'SSH-Patator'
  | 'DoS slowloris'
  | 'DoS Slowhttptest'
  | 'Bot'
  | 'Web Attack – Brute Force'
  | 'Web Attack – XSS'
  | 'Infiltration'
  | 'Web Attack – Sql Injection'
  | 'Heartbleed'
  | string;

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'BENIGN';

export interface PredictionResult {
  status: ThreatStatus;
  threat_type: ThreatType;
  confidence: number;       // 0.0 – 1.0
  latency_ms: number;
}

// ─── Enriched Event (stored in history) ─────────────────────────────────────

export interface ThreatEvent extends PredictionResult {
  id: string;
  timestamp: number;        // Unix ms
  severity: SeverityLevel;
  features?: Record<string, number>; // Optional raw features for SHAP
  shap_values?: ShapEntry[];
}

export interface ShapEntry {
  feature: string;
  value: number;            // Raw SHAP value (signed)
  abs_value: number;        // Absolute (for sorting/bar width)
}

// ─── API Error ───────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  code?: number;
}

// ─── System Health ───────────────────────────────────────────────────────────

export interface SystemHealth {
  connected: boolean;
  avg_latency_ms: number;
  total_predictions: number;
  threat_count: number;
  uptime_start: number;     // Unix ms when polling started
  last_seen: number | null; // Unix ms of last successful response
}

// ─── Donut slice ─────────────────────────────────────────────────────────────

export interface TrafficSlice {
  name: string;
  value: number;
  color: string;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface NidsSettings {
  apiUrl: string;
  pollingIntervalMs: number;   // 1000 – 10000
  maxHistoryItems: number;     // 50 – 500
  alertThresholds: {
    criticalConfidence: number; // 0.9 default
    highConfidence: number;     // 0.7 default
  };
}

export const DEFAULT_SETTINGS: NidsSettings = {
  apiUrl: 'https://your-ngrok-url.ngrok.io',
  pollingIntervalMs: 2000,
  maxHistoryItems: 200,
  alertThresholds: {
    criticalConfidence: 0.9,
    highConfidence: 0.7,
  },
};
