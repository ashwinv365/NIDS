import type {
  PredictionResult,
  ThreatEvent,
  SeverityLevel,
  ShapEntry,
  NidsSettings,
} from './types';

// ─── Severity classifier ─────────────────────────────────────────────────────

export function classifySeverity(
  result: PredictionResult,
  settings: NidsSettings
): SeverityLevel {
  if (result.status === 'BENIGN') return 'BENIGN';
  const c = result.confidence;
  if (c >= settings.alertThresholds.criticalConfidence) return 'CRITICAL';
  if (c >= settings.alertThresholds.highConfidence) return 'HIGH';
  if (c >= 0.5) return 'MEDIUM';
  return 'LOW';
}

// ─── SHAP placeholder (replace with real endpoint when available) ────────────

const FEATURE_NAMES = [
  'Flow Duration', 'Total Fwd Packets', 'Total Bwd Packets',
  'Fwd Packet Length Max', 'Bwd Packet Length Max',
  'Flow Bytes/s', 'Flow Packets/s', 'Flow IAT Mean',
  'Fwd IAT Total', 'Bwd IAT Total',
  'Fwd PSH Flags', 'SYN Flag Count', 'RST Flag Count',
  'Packet Length Variance', 'Average Packet Size',
  'Avg Fwd Segment Size', 'Init_Win_bytes_forward',
  'Init_Win_bytes_backward', 'min_seg_size_forward',
  'Active Mean',
];

export function generateMockShap(threatType: string): ShapEntry[] {
  const seed = threatType.length;
  return FEATURE_NAMES.map((feature, i) => {
    const raw = Math.sin(seed * (i + 1) * 0.7) * 0.6;
    return { feature, value: raw, abs_value: Math.abs(raw) };
  })
    .sort((a, b) => b.abs_value - a.abs_value)
    .slice(0, 10);
}

// ─── ID generator ────────────────────────────────────────────────────────────

let _counter = 0;
export function generateId(): string {
  return `evt_${Date.now()}_${(_counter++).toString(36)}`;
}

// ─── Core fetch call ─────────────────────────────────────────────────────────

export async function fetchPrediction(
  apiUrl: string,
  features: Record<string, number>
): Promise<PredictionResult> {
  const res = await fetch(`${apiUrl}/predict_live`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(features),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<PredictionResult>;
}

// ─── Demo traffic generator (used when no real sensor is connected) ──────────

const ATTACK_TYPES = [
  'DoS Hulk', 'PortScan', 'DDoS', 'DoS GoldenEye',
  'FTP-Patator', 'SSH-Patator', 'Bot', 'Web Attack – Brute Force',
  'Web Attack – XSS', 'DoS Slowhttptest',
];

export function generateDemoEvent(settings: NidsSettings): ThreatEvent {
  const isBenign = Math.random() > 0.35;
  const threatType = isBenign
    ? 'BENIGN'
    : ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
  const confidence = isBenign
    ? 0.85 + Math.random() * 0.14
    : 0.55 + Math.random() * 0.44;
  const result: PredictionResult = {
    status: isBenign ? 'BENIGN' : 'THREAT',
    threat_type: threatType,
    confidence,
    latency_ms: 8 + Math.random() * 40,
  };
  const severity = classifySeverity(result, settings);
  return {
    ...result,
    id: generateId(),
    timestamp: Date.now(),
    severity,
    shap_values: isBenign ? undefined : generateMockShap(threatType),
  };
}

// ─── Severity color map ───────────────────────────────────────────────────────

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  CRITICAL: '#ff2244',
  HIGH:     '#ff6622',
  MEDIUM:   '#ffaa00',
  LOW:      '#00ccff',
  BENIGN:   '#00ff88',
};

export const SEVERITY_BG: Record<SeverityLevel, string> = {
  CRITICAL: 'rgba(255,34,68,0.12)',
  HIGH:     'rgba(255,102,34,0.12)',
  MEDIUM:   'rgba(255,170,0,0.12)',
  LOW:      'rgba(0,204,255,0.12)',
  BENIGN:   'rgba(0,255,136,0.12)',
};

export const THREAT_COLORS: Record<string, string> = {
  'BENIGN':                        '#00ff88',
  'DoS Hulk':                      '#ff2244',
  'PortScan':                      '#ff6622',
  'DDoS':                          '#ff0066',
  'DoS GoldenEye':                 '#ff4400',
  'FTP-Patator':                   '#aa44ff',
  'SSH-Patator':                   '#8800ff',
  'DoS slowloris':                 '#ff3300',
  'DoS Slowhttptest':              '#ff5500',
  'Bot':                           '#ff88ff',
  'Web Attack – Brute Force':      '#ffaa00',
  'Web Attack – XSS':              '#ffcc00',
  'Infiltration':                  '#ff00aa',
  'Web Attack – Sql Injection':    '#ffee00',
  'Heartbleed':                    '#ff1111',
};

export function getThreatColor(threatType: string): string {
  return THREAT_COLORS[threatType] ?? '#00d4ff';
}
