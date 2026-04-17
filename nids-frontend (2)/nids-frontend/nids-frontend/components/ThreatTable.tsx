'use client';

import { useState, useMemo } from 'react';
import { useNidsStore } from '@/lib/store';
import { SEVERITY_COLORS } from '@/lib/api';
import { formatTimestampFull, formatConfidence, abbreviateThreat, cn } from '@/lib/utils';
import type { SeverityLevel } from '@/lib/types';
import { ChevronUp, ChevronDown, Filter } from 'lucide-react';

type SortKey = 'timestamp' | 'threat_type' | 'severity' | 'confidence' | 'latency_ms';
type SortDir = 'asc' | 'desc';

const SEVERITY_ORDER: Record<SeverityLevel, number> = {
  CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2, BENIGN: 1,
};

const ALL_SEVERITIES: SeverityLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'BENIGN'];

export default function ThreatTable() {
  const { events, setSelectedEventId, selectedEventId } = useNidsStore();
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | 'ALL'>('ALL');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(0);
  };

  const filtered = useMemo(() => {
    let rows = filterSeverity === 'ALL' ? events : events.filter(e => e.severity === filterSeverity);
    return [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'timestamp')   cmp = a.timestamp - b.timestamp;
      if (sortKey === 'confidence')  cmp = a.confidence - b.confidence;
      if (sortKey === 'latency_ms')  cmp = a.latency_ms - b.latency_ms;
      if (sortKey === 'severity')    cmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      if (sortKey === 'threat_type') cmp = a.threat_type.localeCompare(b.threat_type);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [events, sortKey, sortDir, filterSeverity]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const page_rows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp size={10} className="text-white/15" />;
    return sortDir === 'asc'
      ? <ChevronUp size={10} className="text-[#00d4ff]" />
      : <ChevronDown size={10} className="text-[#00d4ff]" />;
  };

  const ColHeader = ({ col, label, className }: { col: SortKey; label: string; className?: string }) => (
    <th
      className={cn('text-left text-[10px] uppercase tracking-wider text-white/30 font-medium cursor-pointer hover:text-white/60 transition-colors select-none', className)}
      onClick={() => handleSort(col)}
    >
      <div className="flex items-center gap-1">{label}<SortIcon col={col} /></div>
    </th>
  );

  return (
    <div className="nids-card flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.05]">
        <span className="text-[12px] font-semibold text-white/70 uppercase tracking-wider">Event History</span>
        <div className="flex items-center gap-2">
          <Filter size={11} className="text-white/25" />
          <div className="flex items-center gap-1">
            {(['ALL', ...ALL_SEVERITIES] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setFilterSeverity(s); setPage(0); }}
                className={cn(
                  'text-[9px] uppercase tracking-wider px-2 py-1 rounded border transition-all font-semibold',
                  filterSeverity === s
                    ? s === 'ALL'
                      ? 'bg-[#00d4ff]/15 border-[#00d4ff]/30 text-[#00d4ff]'
                      : `badge-${s.toLowerCase()}`
                    : 'border-white/[0.06] text-white/25 hover:text-white/50 hover:border-white/10'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="px-4 py-2.5 w-4" />
              <ColHeader col="timestamp"   label="Time"       className="px-2 py-2.5" />
              <ColHeader col="threat_type" label="Type"       className="px-2 py-2.5" />
              <ColHeader col="severity"    label="Severity"   className="px-2 py-2.5" />
              <ColHeader col="confidence"  label="Confidence" className="px-2 py-2.5" />
              <ColHeader col="latency_ms"  label="Latency"    className="px-2 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {page_rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[12px] text-white/25">
                  No events match the current filter
                </td>
              </tr>
            ) : (
              page_rows.map((event) => {
                const color = SEVERITY_COLORS[event.severity];
                const isSelected = selectedEventId === event.id;
                return (
                  <tr
                    key={event.id}
                    onClick={() => setSelectedEventId(isSelected ? null : event.id)}
                    className={cn(
                      'border-b border-white/[0.03] cursor-pointer transition-all duration-100',
                      isSelected
                        ? 'bg-[#00d4ff]/05 border-[#00d4ff]/10'
                        : 'hover:bg-white/[0.025]'
                    )}
                  >
                    {/* Severity indicator dot */}
                    <td className="px-4 py-2.5 w-4">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: color,
                          boxShadow: event.status === 'THREAT' ? `0 0 4px ${color}` : 'none',
                        }}
                      />
                    </td>
                    <td className="px-2 py-2.5 text-[11px] mono text-white/40 whitespace-nowrap">
                      {formatTimestampFull(event.timestamp)}
                    </td>
                    <td className="px-2 py-2.5 text-[12px] font-medium" style={{ color }}>
                      {abbreviateThreat(event.threat_type)}
                    </td>
                    <td className="px-2 py-2.5">
                      <span className={cn('text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border font-semibold', `badge-${event.severity.toLowerCase()}`)}>
                        {event.severity}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-[12px] mono text-white/50">
                      {formatConfidence(event.confidence)}
                    </td>
                    <td className="px-2 py-2.5 text-[11px] mono text-white/35">
                      {event.latency_ms.toFixed(1)}ms
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.05]">
          <span className="text-[11px] text-white/25 mono">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2.5 py-1 text-[11px] rounded border border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i).map((i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={cn(
                  'w-7 h-7 text-[11px] rounded border transition-all mono',
                  i === page
                    ? 'bg-[#00d4ff]/15 border-[#00d4ff]/30 text-[#00d4ff]'
                    : 'border-white/[0.06] text-white/30 hover:border-white/15 hover:text-white/60'
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-2.5 py-1 text-[11px] rounded border border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
