'use client';

import { Shield, ShieldAlert, Zap, Activity } from 'lucide-react';
import { useNidsStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accentColor: string;
  className?: string;
  index?: number;
}

function StatCard({ label, value, sub, icon, accentColor, className, index = 0 }: StatCardProps) {
  const delays = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4'];
  return (
    <div className={cn(
      'nids-card p-5 flex flex-col gap-3 animate-fade-up',
      delays[index],
      className
    )}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-widest font-medium text-white/30">{label}</span>
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}25` }}
        >
          <div style={{ color: accentColor }}>{icon}</div>
        </div>
      </div>
      <div>
        <p className="text-3xl font-semibold tracking-tight leading-none mono" style={{ color: accentColor }}>
          {value}
        </p>
        {sub && <p className="text-[11px] text-white/30 mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function StatBar() {
  const { health, events } = useNidsStore();

  const threatRate = health.total_predictions > 0
    ? ((health.threat_count / health.total_predictions) * 100).toFixed(1)
    : '0.0';

  const recentEvents = events.slice(0, 50);
  const avgConf = recentEvents.length > 0
    ? (recentEvents.reduce((s, e) => s + e.confidence, 0) / recentEvents.length * 100).toFixed(1)
    : '—';

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <StatCard
        index={0}
        label="Total Inspected"
        value={health.total_predictions.toLocaleString()}
        sub="packets analysed"
        icon={<Shield size={14} />}
        accentColor="#00d4ff"
      />
      <StatCard
        index={1}
        label="Threats Detected"
        value={health.threat_count.toLocaleString()}
        sub={`${threatRate}% threat rate`}
        icon={<ShieldAlert size={14} />}
        accentColor="#ff2244"
      />
      <StatCard
        index={2}
        label="Avg Latency"
        value={`${health.avg_latency_ms.toFixed(1)}ms`}
        sub="inference time"
        icon={<Zap size={14} />}
        accentColor="#ffaa00"
      />
      <StatCard
        index={3}
        label="Avg Confidence"
        value={`${avgConf}%`}
        sub="last 50 predictions"
        icon={<Activity size={14} />}
        accentColor="#00ff88"
      />
    </div>
  );
}
