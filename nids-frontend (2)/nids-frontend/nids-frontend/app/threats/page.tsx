'use client';

import { useState, useMemo } from 'react';
import { useNidsStore } from '@/lib/store';
import { SEVERITY_COLORS } from '@/lib/api';
import { formatTimestampFull, formatConfidence, cn } from '@/lib/utils';
import type { SeverityLevel } from '@/lib/types';
import {
  Search, Download, Trash2, ShieldAlert, ShieldCheck,
  ChevronUp, ChevronDown, Info,
} from 'lucide-react';
import ShapChart from '@/components/ShapChart';

type SortKey = 'timestamp' | 'threat_type' | 'severity' | 'confidence' | 'latency_ms';
type SortDir = 'asc' | 'desc';

const SEVERITY_ORDER: Record<SeverityLevel, number> = {
  CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2, BENIGN: 1,
};

const ALL_SEVERITIES: SeverityLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'BENIGN'];

export default function ThreatsPage() {
  const { events, clearHistory, setSelectedEventId, selectedEventId } = useNidsStore();

  const [sortKey, setSortKey]             = useState<SortKey>('timestamp');
  const [sortDir, setSortDir]             = useState<SortDir>('desc');
  const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus]   = useState<'ALL' | 'THREAT' | 'BENIGN'>('ALL');
  const [search, setSearch]               = useState('');
  const [page, setPage]                   = useState(0);
  const [showShap, setShowShap]           = useState(false);

  const PAGE_SIZE = 15;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(0);
  };

  const filtered = useMemo(() => {
    let rows = [...events];
    if (filterSeverity !== 'ALL') rows = rows.filter(e => e.severity === filterSeverity);
    if (filterStatus   !== 'ALL') rows = rows.filter(e => e.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(e =>
        e.threat_type.toLowerCase().includes(q) ||
        e.severity.toLowerCase().includes(q) ||
        e.id.includes(q)
      );
    }
    return rows.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'timestamp')   cmp = a.timestamp - b.timestamp;
      if (sortKey === 'confidence')  cmp = a.confidence - b.confidence;
      if (sortKey === 'latency_ms')  cmp = a.latency_ms - b.latency_ms;
      if (sortKey === 'severity')    cmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      if (sortKey === 'threat_type') cmp = a.threat_type.localeCompare(b.threat_type);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [events, filterSeverity, filterStatus, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // CSV export
  const handleExport = () => {
    const header = 'id,timestamp,status,threat_type,severity,confidence,latency_ms';
    const rows = filtered.map(e =>
      [e.id, new Date(e.timestamp).toISOString(), e.status, e.threat_type,
       e.severity, e.confidence.toFixed(4), e.latency_ms.toFixed(2)].join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `nids_threats_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp size={10} className="text-white/15" />;
    return sortDir === 'asc'
      ? <ChevronUp size={10} className="text-[#00d4ff]" />
      : <ChevronDown size={10} className="text-[#00d4ff]" />;
  };

  const ColHeader = ({ col, label, className }: { col: SortKey; label: string; className?: string }) => (
    <th
      className={cn('text-left text-[10px] uppercase tracking-wider text-white/30 font-medium cursor-pointer hover:text-white/60 transition-colors select-none px-3 py-3', className)}
      onClick={() => handleSort(col)}
    >
      <div className="flex items-center gap-1">{label}<SortIcon col={col} /></div>
    </th>
  );

  // Summary chips
  const criticalCount = events.filter(e => e.severity === 'CRITICAL').length;
  const highCount     = events.filter(e => e.severity === 'HIGH').length;
  const threatPct     = events.length > 0
    ? ((events.filter(e => e.status === 'THREAT').length / events.length) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-up">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Threat Log</h1>
          <p className="text-[13px] text-white/35 mt-0.5">
            Full event history · {events.length.toLocaleString()} records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShap(v => !v)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] transition-all',
              showShap
                ? 'bg-[#a855f7]/15 border-[#a855f7]/30 text-[#a855f7]'
                : 'border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/15'
            )}
          >
            <Info size={12} />
            SHAP Panel
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.08] text-[12px] text-white/40 hover:text-white/70 hover:border-white/15 transition-all"
          >
            <Download size={12} />
            Export CSV
          </button>
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#ff2244]/20 text-[12px] text-[#ff4466]/60 hover:text-[#ff4466] hover:border-[#ff2244]/40 transition-all"
          >
            <Trash2 size={12} />
            Clear
          </button>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex items-center gap-2 flex-wrap animate-fade-up stagger-1">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff2244]/10 border border-[#ff2244]/20">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff2244]" />
          <span className="text-[11px] text-[#ff4466] mono">{criticalCount} critical</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff6622]/10 border border-[#ff6622]/20">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff6622]" />
          <span className="text-[11px] text-[#ff7744] mono">{highCount} high</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <span className="text-[11px] text-white/35 mono">{threatPct}% threat rate</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <span className="text-[11px] text-white/35 mono">{events.length} total events</span>
        </div>
      </div>

      {/* Main layout: table + optional SHAP sidebar */}
      <div className={cn('gap-4', showShap ? 'grid grid-cols-[1fr_280px]' : 'flex flex-col')}>
        {/* Filters + Table */}
        <div className="nids-card flex flex-col animate-fade-up stagger-2">
          {/* Filter bar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.05] flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[160px]">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                type="text"
                placeholder="Search threat type, severity…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); }}
                className="w-full pl-7 pr-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[12px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-[#00d4ff]/30 transition-all mono"
              />
            </div>

            {/* Status filter */}
            {(['ALL', 'THREAT', 'BENIGN'] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setFilterStatus(s); setPage(0); }}
                className={cn(
                  'text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg border font-semibold transition-all',
                  filterStatus === s
                    ? s === 'THREAT'
                      ? 'bg-[#ff2244]/15 border-[#ff2244]/30 text-[#ff4466]'
                      : s === 'BENIGN'
                        ? 'bg-[#00ff88]/10 border-[#00ff88]/20 text-[#00dd77]'
                        : 'bg-[#00d4ff]/15 border-[#00d4ff]/30 text-[#00d4ff]'
                    : 'border-white/[0.06] text-white/25 hover:text-white/50'
                )}
              >
                {s}
              </button>
            ))}

            {/* Severity filter */}
            <div className="flex items-center gap-1 border-l border-white/[0.05] pl-3">
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
                      : 'border-white/[0.06] text-white/20 hover:text-white/40'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="w-4 px-4 py-2.5" />
                  <ColHeader col="timestamp"   label="Timestamp" />
                  <ColHeader col="threat_type" label="Threat Type" />
                  <ColHeader col="severity"    label="Severity" />
                  <th className="text-left text-[10px] uppercase tracking-wider text-white/30 font-medium px-3 py-3">
                    Status
                  </th>
                  <ColHeader col="confidence"  label="Confidence" />
                  <ColHeader col="latency_ms"  label="Latency" />
                  <th className="text-left text-[10px] uppercase tracking-wider text-white/30 font-medium px-3 py-3">
                    Event ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ShieldCheck size={24} className="text-white/15" />
                        <p className="text-[13px] text-white/25">No events match the current filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageRows.map((event) => {
                    const color = SEVERITY_COLORS[event.severity];
                    const isSelected = selectedEventId === event.id;
                    return (
                      <tr
                        key={event.id}
                        onClick={() => {
                          setSelectedEventId(isSelected ? null : event.id);
                          if (!isSelected) setShowShap(true);
                        }}
                        className={cn(
                          'border-b border-white/[0.03] cursor-pointer transition-all duration-100',
                          isSelected ? 'bg-[#00d4ff]/05' : 'hover:bg-white/[0.025]'
                        )}
                      >
                        <td className="px-4 py-2.5 w-4">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              background: color,
                              boxShadow: event.status === 'THREAT' ? `0 0 4px ${color}` : 'none',
                            }}
                          />
                        </td>
                        <td className="px-3 py-2.5 text-[11px] mono text-white/40 whitespace-nowrap">
                          {formatTimestampFull(event.timestamp)}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] font-medium" style={{ color }}>
                          {event.threat_type}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={cn('text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border font-semibold', `badge-${event.severity.toLowerCase()}`)}>
                            {event.severity}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            {event.status === 'THREAT'
                              ? <ShieldAlert size={11} className="text-[#ff4466]" />
                              : <ShieldCheck size={11} className="text-[#00dd77]" />
                            }
                            <span className={cn(
                              'text-[11px] font-semibold',
                              event.status === 'THREAT' ? 'text-[#ff4466]' : 'text-[#00dd77]'
                            )}>
                              {event.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-[12px] mono text-white/50">
                          {formatConfidence(event.confidence)}
                        </td>
                        <td className="px-3 py-2.5 text-[11px] mono text-white/35">
                          {event.latency_ms.toFixed(1)}ms
                        </td>
                        <td className="px-3 py-2.5 text-[10px] mono text-white/20">
                          {event.id.slice(0, 18)}…
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
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                  className="px-2.5 py-1 text-[11px] rounded border border-white/[0.06] text-white/40 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  First
                </button>
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-2.5 py-1 text-[11px] rounded border border-white/[0.06] text-white/40 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Prev
                </button>
                <span className="px-3 py-1 text-[11px] mono text-white/30">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-2.5 py-1 text-[11px] rounded border border-white/[0.06] text-white/40 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
                <button
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                  className="px-2.5 py-1 text-[11px] rounded border border-white/[0.06] text-white/40 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SHAP sidebar */}
        {showShap && (
          <div className="animate-slide-in-right">
            <ShapChart />
          </div>
        )}
      </div>
    </div>
  );
}
