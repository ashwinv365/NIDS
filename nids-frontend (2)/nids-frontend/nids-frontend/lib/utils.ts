import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatConfidence(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

export function formatLatency(ms: number): string {
  return `${ms.toFixed(1)}ms`;
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatTimestampFull(ts: number): string {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatUptime(startMs: number): string {
  const diff = Date.now() - startMs;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function abbreviateThreat(t: string): string {
  const map: Record<string, string> = {
    'Web Attack – Brute Force': 'BruteForce',
    'Web Attack – XSS': 'XSS',
    'Web Attack – Sql Injection': 'SQLi',
    'DoS Slowhttptest': 'SlowHTTP',
    'DoS slowloris': 'Slowloris',
    'DoS GoldenEye': 'GoldenEye',
    'DoS Hulk': 'DoS Hulk',
  };
  return map[t] ?? t;
}
