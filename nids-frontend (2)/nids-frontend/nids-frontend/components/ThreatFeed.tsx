'use client';

import { useNidsStore } from '@/lib/store';
import { SEVERITY_COLORS, SEVERITY_BG } from '@/lib/api';
import { formatTimestamp, formatConfidence, abbreviateThreat, cn } from '@/lib/utils';
import type { ThreatEvent } from '@/lib/types';
import { ShieldAlert, ShieldCheck, ChevronRight } from 'lucide-react';

function EventCard({ event, isSelected, onClick }: {
  event: ThreatEvent;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isThreat = event.status === 'THREAT';
  const color = SEVERITY_COLORS[event.severity] || '#00ff88';
  const bg = SEVERITY_BG[event.severity] || 'rgba(0, 255, 136, 0.1)';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3.5 py-3 rounded-lg border transition-all duration-150 animate-slide-in-right group',
        isSelected
          ? 'border-[#00d4ff]/40 bg-[#00d4ff]/05'
          : 'border-transparent hover:border-white/[0.08] hover:bg-white/[0.03]'
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{
            background: color,
            boxShadow: isThreat ? `0 0 6px ${color}` : 'none',
          }}
        />

        <div
          className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: bg, border: `1px solid ${color}25` }}
        >
          {isThreat
            ? <ShieldAlert size={11} style={{ color }} />
            : <ShieldCheck size={11} style={{ color }} />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-[12px] font-semibold truncate"
              style={{ color: isThreat ? color : '#00ff88' }}
            >
              {abbreviateThreat(event.threat_type)}
            </span>
            <span
              className={cn(
                'text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border font-semibold flex-shrink-0',
                `badge-${event.severity.toLowerCase()}`
              )}
            >
              {event.severity}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-white/30 mono">{formatTimestamp(event.timestamp)}</span>
            <span className="text-[10px] text-white/20">·</span>
            <span className="text-[10px] text-white/30 mono">{formatConfidence(event.confidence)}</span>
            <span className="text-[10px] text-white/20">·</span>
            <span className="text-[10px] text-white/25 mono">{event.latency_ms.toFixed(1)}ms</span>
          </div>
        </div>

        <ChevronRight size={11} className="text-white/20 flex-shrink-0 group-hover:text-white/40 transition-colors" />
      </div>
    </button>
  );
}

export default function ThreatFeed() {
  const { events, selectedEventId, setSelectedEventId } = useNidsStore();

  const recentEvents = events.slice(0, 30);
  const totalShown = recentEvents.length;

  return (
    <div className="nids-card flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
          <span className="text-[12px] font-semibold text-white/80 uppercase tracking-wider">Live Traffic Feed</span>
        </div>
        <span className="text-[11px] mono text-white/25">{totalShown} events</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {recentEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <ShieldCheck size={22} className="text-[#00ff88]/30" />
            <p className="text-[12px] text-white/25">Awaiting network data...</p>
          </div>
        ) : (
          recentEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isSelected={selectedEventId === event.id}
              onClick={() => setSelectedEventId(
                selectedEventId === event.id ? null : event.id
              )}
            />
          ))
        )}
      </div>
    </div>
  );
}