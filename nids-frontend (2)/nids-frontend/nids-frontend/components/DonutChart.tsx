'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useNidsStore } from '@/lib/store';
import { getThreatColor } from '@/lib/api';
import type { TrafficSlice } from '@/lib/types';
import { useMemo } from 'react';

function buildSlices(events: ReturnType<typeof useNidsStore.getState>['events']): TrafficSlice[] {
  const counts: Record<string, number> = {};
  for (const e of events) {
    counts[e.threat_type] = (counts[e.threat_type] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({
      name,
      value,
      color: getThreatColor(name),
    }));
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: TrafficSlice }> }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#14141f] border border-white/10 rounded-lg px-3 py-2 text-[12px]">
      <p className="font-semibold" style={{ color: d.color }}>{d.name}</p>
      <p className="text-white/50 mt-0.5">{d.value} events</p>
    </div>
  );
};

const renderLegend = (props: { payload?: Array<{ color: string; value: string; payload: TrafficSlice }> }) => {
  const items = (props.payload ?? []).slice(0, 6);
  return (
    <div className="space-y-1.5 mt-2">
      {items.map((item) => (
        <div key={item.value} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
            <span className="text-[11px] text-white/50 truncate max-w-[110px]">{item.value}</span>
          </div>
          <span className="text-[11px] mono text-white/30">{item.payload.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DonutChart() {
  const { events } = useNidsStore();
  const slices = useMemo(() => buildSlices(events), [events]);
  const total = events.length;

  return (
    <div className="nids-card p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-semibold text-white/70 uppercase tracking-wider">
          Traffic Distribution
        </span>
        <span className="text-[11px] mono text-white/25">{total} total</span>
      </div>

      {slices.length === 0 ? (
        <div className="flex items-center justify-center h-44 text-[12px] text-white/25">
          Awaiting data…
        </div>
      ) : (
        <div className="relative h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={76}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {slices.map((slice) => (
                  <Cell key={slice.name} fill={slice.color} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Centre label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[22px] font-semibold text-white/90 mono leading-none">
              {total > 999 ? `${(total / 1000).toFixed(1)}k` : total}
            </p>
            <p className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">events</p>
          </div>
        </div>
      )}

      {/* Legend */}
      {slices.length > 0 && (
        <div className="border-t border-white/[0.05] pt-3 mt-3">
          {renderLegend({ payload: slices.map(s => ({ color: s.color, value: s.name, payload: s })) })}
        </div>
      )}
    </div>
  );
}
