'use client';

import { useEffect } from 'react'; // Added this
import StatBar from '@/components/StatBar';
import ThreatFeed from '@/components/ThreatFeed';
import DonutChart from '@/components/DonutChart';
import ShapChart from '@/components/ShapChart';
import ThreatTable from '@/components/ThreatTable';
import { useNidsStore } from '@/lib/store';
import { formatTimestamp } from '@/lib/utils';

export default function DashboardPage() {
  // 1. Added fetchData and settings to the store call
  const { health, demoMode, fetchData, settings } = useNidsStore();

  // 2. THE HEARTBEAT ENGINE
  // This tells the frontend: "Every 2 seconds, go talk to Python"
  useEffect(() => {
    if (demoMode) return;

    // Fetch immediately when you open the page
    fetchData();

    // Then set up the repeating timer
    const interval = setInterval(() => {
      fetchData();
    }, settings.pollingIntervalMs || 2000);

    return () => clearInterval(interval);
  }, [demoMode, fetchData, settings.pollingIntervalMs]);

  return (
    <div className="p-6 space-y-5 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">
            Network Overview
          </h1>
          <p className="text-[13px] text-white/35 mt-0.5">
            Real-time intrusion detection · RandomForest v2 · XAI enabled
          </p>
        </div>
        <div className="flex items-center gap-3">
          {demoMode && (
            <span className="text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-md border border-[#ffaa00]/30 bg-[#ffaa00]/10 text-[#ffaa00] font-semibold">
              Demo Mode
            </span>
          )}
          <div className="text-right">
            <p className="text-[11px] text-white/25 mono">
              {health.last_seen ? `Last event ${formatTimestamp(health.last_seen)}` : 'Awaiting events…'}
            </p>
            <p className="text-[10px] text-white/20 mono mt-0.5">
              {health.total_predictions.toLocaleString()} total predictions
            </p>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <StatBar />

      {/* Main 3-column grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px_260px] gap-4">
        {/* Left: Threat Feed */}
        <div className="min-h-[460px] animate-fade-up stagger-2">
          <ThreatFeed />
        </div>

        {/* Middle: Donut */}
        <div className="animate-fade-up stagger-3">
          <DonutChart />
        </div>

        {/* Right: SHAP */}
        <div className="animate-fade-up stagger-4">
          <ShapChart />
        </div>
      </div>

      {/* Bottom: Full-width table */}
      <div className="animate-fade-up stagger-5">
        <ThreatTable />
      </div>
    </div>
  );
}