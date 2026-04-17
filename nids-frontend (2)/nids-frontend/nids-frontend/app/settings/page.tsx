'use client';

import { useState } from 'react';
import { useNidsStore } from '@/lib/store';
import { DEFAULT_SETTINGS } from '@/lib/types';
import {
  Save, RotateCcw, Wifi, Clock, Database,
  ShieldAlert, FlaskConical, ExternalLink, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function Section({ title, icon, children }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="nids-card p-5 space-y-5">
      <div className="flex items-center gap-2.5 border-b border-white/[0.05] pb-4">
        <div className="w-7 h-7 rounded-md bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff]">
          {icon}
        </div>
        <h2 className="text-[13px] font-semibold text-white/80">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, description, children }: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-8">
      <div className="flex-1">
        <p className="text-[13px] text-white/70 font-medium">{label}</p>
        {description && (
          <p className="text-[11px] text-white/30 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings, demoMode, setDemoMode, clearHistory } = useNidsStore();

  const [local, setLocal] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');

  const isDirty = JSON.stringify(local) !== JSON.stringify(settings);

  const handleSave = () => {
    updateSettings(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setLocal({ ...DEFAULT_SETTINGS });
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    try {
      const res = await fetch(`${local.apiUrl}/health`, {
        signal: AbortSignal.timeout(10000),
        headers: {
          "ngrok-skip-browser-warning": "true", // <--- ADD THIS LINE
        },
      });
      setTestStatus(res.ok ? 'ok' : 'fail');
    } catch {
      setTestStatus('fail');
    }
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  const INTERVAL_OPTIONS = [
    { label: '500ms',  value: 500 },
    { label: '1s',     value: 1000 },
    { label: '2s',     value: 2000 },
    { label: '5s',     value: 5000 },
    { label: '10s',    value: 10000 },
  ];

  const HISTORY_OPTIONS = [50, 100, 200, 500];

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-up">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Settings</h1>
          <p className="text-[13px] text-white/35 mt-0.5">
            Configure the NIDS sensor connection and inference parameters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.08] text-[12px] text-white/40 hover:text-white/70 hover:border-white/15 transition-all"
          >
            <RotateCcw size={12} />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg border text-[12px] font-semibold transition-all',
              saved
                ? 'bg-[#00ff88]/15 border-[#00ff88]/30 text-[#00dd77]'
                : isDirty
                  ? 'bg-[#00d4ff]/15 border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/20'
                  : 'border-white/[0.06] text-white/20 cursor-not-allowed'
            )}
          >
            {saved ? <Check size={12} /> : <Save size={12} />}
            {saved ? 'Saved' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* API Connection */}
      <Section title="API Connection" icon={<Wifi size={14} />}>
        <Field
          label="FastAPI Endpoint URL"
          description="Your ngrok tunnel URL pointing to the FastAPI /predict_live endpoint. Include the full https:// prefix."
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={local.apiUrl}
              onChange={e => setLocal(l => ({ ...l, apiUrl: e.target.value }))}
              placeholder="https://xxxx.ngrok.io"
              className="w-64 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-[#00d4ff]/30 transition-all mono"
            />
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className={cn(
                'px-3 py-1.5 rounded-lg border text-[12px] transition-all whitespace-nowrap',
                testStatus === 'ok'   ? 'bg-[#00ff88]/10 border-[#00ff88]/25 text-[#00dd77]' :
                testStatus === 'fail' ? 'bg-[#ff2244]/10 border-[#ff2244]/25 text-[#ff4466]' :
                testStatus === 'testing' ? 'border-[#00d4ff]/20 text-[#00d4ff]/50 cursor-wait' :
                'border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/15'
              )}
            >
              {testStatus === 'testing' ? 'Testing…' :
               testStatus === 'ok'      ? '✓ Connected' :
               testStatus === 'fail'    ? '✗ Failed' : 'Test'}
            </button>
          </div>
        </Field>

        <Field
          label="Demo Mode"
          description="Generate synthetic traffic locally without a real API connection. Disables live polling."
        >
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={cn(
              'relative w-12 h-6 rounded-full border transition-all',
              demoMode
                ? 'bg-[#ffaa00]/30 border-[#ffaa00]/40'
                : 'bg-white/[0.06] border-white/[0.08]'
            )}
          >
            <div className={cn(
              'absolute top-1 w-4 h-4 rounded-full transition-all',
              demoMode ? 'left-7 bg-[#ffaa00]' : 'left-1 bg-white/30'
            )} />
          </button>
        </Field>

        <Field
          label="API Documentation"
          description="Open the FastAPI /docs endpoint to inspect the predict_live schema."
        >
          <a
            href={`${local.apiUrl}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] text-[12px] text-white/40 hover:text-white/70 hover:border-white/15 transition-all"
          >
            <ExternalLink size={12} />
            Open /docs
          </a>
        </Field>
      </Section>

      {/* Polling */}
      <Section title="Polling Interval" icon={<Clock size={14} />}>
        <Field
          label="Prediction Interval"
          description="How frequently the frontend queries the inference endpoint. Lower values give better real-time fidelity but increase API load."
        >
          <div className="flex items-center gap-1.5">
            {INTERVAL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setLocal(l => ({ ...l, pollingIntervalMs: opt.value }))}
                className={cn(
                  'px-3 py-1.5 rounded-lg border text-[12px] transition-all mono',
                  local.pollingIntervalMs === opt.value
                    ? 'bg-[#00d4ff]/15 border-[#00d4ff]/30 text-[#00d4ff]'
                    : 'border-white/[0.08] text-white/35 hover:text-white/60 hover:border-white/15'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* History */}
      <Section title="History & Storage" icon={<Database size={14} />}>
        <Field
          label="Max History Items"
          description="Maximum number of events to retain in the Zustand store. Older events are dropped (FIFO) when the limit is reached."
        >
          <div className="flex items-center gap-1.5">
            {HISTORY_OPTIONS.map(v => (
              <button
                key={v}
                onClick={() => setLocal(l => ({ ...l, maxHistoryItems: v }))}
                className={cn(
                  'px-3 py-1.5 rounded-lg border text-[12px] transition-all mono',
                  local.maxHistoryItems === v
                    ? 'bg-[#00d4ff]/15 border-[#00d4ff]/30 text-[#00d4ff]'
                    : 'border-white/[0.08] text-white/35 hover:text-white/60 hover:border-white/15'
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </Field>

        <Field
          label="Clear Event History"
          description="Remove all events from the in-memory store. This action cannot be undone."
        >
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#ff2244]/20 text-[12px] text-[#ff4466]/60 hover:text-[#ff4466] hover:border-[#ff2244]/40 transition-all"
          >
            Clear History
          </button>
        </Field>
      </Section>

      {/* Alert thresholds */}
      <Section title="Alert Thresholds" icon={<ShieldAlert size={14} />}>
        <Field
          label="Critical Threshold"
          description={`Predictions with confidence ≥ this value are classified CRITICAL. Current: ${(local.alertThresholds.criticalConfidence * 100).toFixed(0)}%`}
        >
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0.5}
              max={1.0}
              step={0.05}
              value={local.alertThresholds.criticalConfidence}
              onChange={e => setLocal(l => ({
                ...l,
                alertThresholds: {
                  ...l.alertThresholds,
                  criticalConfidence: parseFloat(e.target.value),
                },
              }))}
              className="w-32 accent-[#ff2244]"
            />
            <span className="text-[12px] mono text-[#ff4466] w-10 text-right">
              {(local.alertThresholds.criticalConfidence * 100).toFixed(0)}%
            </span>
          </div>
        </Field>

        <Field
          label="High Threshold"
          description={`Predictions with confidence ≥ this value (and below critical) are classified HIGH. Current: ${(local.alertThresholds.highConfidence * 100).toFixed(0)}%`}
        >
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0.3}
              max={0.95}
              step={0.05}
              value={local.alertThresholds.highConfidence}
              onChange={e => setLocal(l => ({
                ...l,
                alertThresholds: {
                  ...l.alertThresholds,
                  highConfidence: parseFloat(e.target.value),
                },
              }))}
              className="w-32 accent-[#ff6622]"
            />
            <span className="text-[12px] mono text-[#ff7744] w-10 text-right">
              {(local.alertThresholds.highConfidence * 100).toFixed(0)}%
            </span>
          </div>
        </Field>
      </Section>

      {/* Model info */}
      <Section title="Model Information" icon={<FlaskConical size={14} />}>
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          {[
            ['Algorithm',    'RandomForestClassifier'],
            ['Estimators',   '150'],
            ['Class Weight', 'balanced'],
            ['Dataset',      'CIC-IDS-2017'],
            ['Format',       '.parquet'],
            ['Balancing',    'SMOTE + RandomUnderSampler'],
            ['XAI Engine',   'SHAP TreeExplainer'],
            ['Artifacts',    'nids_rf_model_v2.pkl'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
              <span className="text-white/35">{k}</span>
              <span className="mono text-white/60">{v}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
