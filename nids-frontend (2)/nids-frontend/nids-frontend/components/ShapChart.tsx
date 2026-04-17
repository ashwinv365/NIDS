'use client';

import { useNidsStore } from '@/lib/store';
import { SEVERITY_COLORS } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import type { ShapEntry } from '@/lib/types';

function ShapBar({ entry, max, color }: { entry: ShapEntry; max: number; color: string }) {
  const pct = max > 0 ? (entry.abs_value / max) * 100 : 0;
  const isPositive = entry.value >= 0;

  return (
    <div className="flex items-center gap-2.5 group">
      <span className="text-[11px] text-white/40 w-36 truncate text-right flex-shrink-0 group-hover:text-white/60 transition-colors">
        {entry.feature}
      </span>
      <div className="flex-1 h-4 bg-white/[0.04] rounded-sm overflow-hidden relative">
        <div
          className="h-full rounded-sm transition-all duration-300"
          style={{
            width: `${pct}%`,
            background: isPositive
              ? `linear-gradient(90deg, ${color}60, ${color})`
              : `linear-gradient(90deg, #00d4ff60, #00d4ff)`,
          }}
        />
      </div>
      <span className={cn(
        'text-[10px] mono w-14 text-right flex-shrink-0',
        isPositive ? 'text-white/40' : 'text-[#00d4ff]/60'
      )}>
        {entry.value > 0 ? '+' : ''}{entry.value.toFixed(3)}
      </span>
    </div>
  );
}

export default function ShapChart() {
  const { events, selectedEventId } = useNidsStore();

  const { shapValues, eventInfo } = useMemo(() => {
    // Show SHAP for selected event, or most recent threat
    const target = selectedEventId
      ? events.find(e => e.id === selectedEventId)
      : events.find(e => e.status === 'THREAT' && e.shap_values?.length);

    if (!target?.shap_values) return { shapValues: [], eventInfo: null };
    return { shapValues: target.shap_values, eventInfo: target };
  }, [events, selectedEventId]);

  const max = shapValues.length > 0
    ? Math.max(...shapValues.map(s => s.abs_value))
    : 1;

  const color = eventInfo ? SEVERITY_COLORS[eventInfo.severity] : '#00d4ff';

  return (
    <div className="nids-card p-4 flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[12px] font-semibold text-white/70 uppercase tracking-wider">
          SHAP Feature Importance
        </span>
        <span className="text-[10px] text-white/25 mono">XAI · TreeExplainer</span>
      </div>

      {eventInfo && (
        <p className="text-[11px] mb-3 mt-0.5" style={{ color }}>
          {eventInfo.threat_type}
          <span className="text-white/25 ml-2 font-normal">
            {(eventInfo.confidence * 100).toFixed(1)}% confidence
          </span>
        </p>
      )}

      {shapValues.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-44 gap-2">
          <p className="text-[12px] text-white/25">Select a threat to view feature importance</p>
          <p className="text-[10px] text-white/20">or wait for the next detected threat</p>
        </div>
      ) : (
        <div className="space-y-2 mt-1">
          {shapValues.map((entry) => (
            <ShapBar key={entry.feature} entry={entry} max={max} color={color} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.05]">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-2 rounded-sm" style={{ background: `linear-gradient(90deg, ${color}60, ${color})` }} />
          <span className="text-[10px] text-white/30">Increases threat score</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-2 rounded-sm bg-gradient-to-r from-[#00d4ff]/40 to-[#00d4ff]" />
          <span className="text-[10px] text-white/30">Decreases threat score</span>
        </div>
      </div>
    </div>
  );
}
