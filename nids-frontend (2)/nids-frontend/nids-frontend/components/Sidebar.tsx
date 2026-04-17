'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldAlert,
  Settings,
  Activity,
  Wifi,
  WifiOff,
  Zap,
  FlaskConical,
} from 'lucide-react';
import { useNidsStore } from '@/lib/store';
import { cn, formatUptime } from '@/lib/utils';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { href: '/',         label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/threats',  label: 'Threat Log',  icon: ShieldAlert },
  { href: '/settings', label: 'Settings',    icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { health, demoMode, setDemoMode } = useNidsStore();
  const [uptime, setUptime] = useState('0s');

  // Live uptime ticker
  useEffect(() => {
    const t = setInterval(() => setUptime(formatUptime(health.uptime_start)), 1000);
    return () => clearInterval(t);
  }, [health.uptime_start]);

  return (
    <aside className="flex flex-col w-[220px] min-w-[220px] h-screen border-r border-white/[0.06] bg-[#0d0d14] relative z-20">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.06]">
        <div className="relative">
          <div className="w-8 h-8 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center">
            <Zap size={15} className="text-[#00d4ff]" />
          </div>
          {health.connected && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00ff88] animate-pulse-glow" />
          )}
        </div>
        <div>
          <p className="text-[13px] font-semibold tracking-wide text-white leading-none">NIDS</p>
          <p className="text-[10px] text-white/30 mt-0.5 tracking-widest uppercase">Sentinel v2</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                active
                  ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
              )}
            >
              <Icon size={15} className={active ? 'text-[#00d4ff]' : 'text-white/30'} />
              {label}
              {href === '/threats' && health.threat_count > 0 && (
                <span className="ml-auto text-[10px] bg-[#ff2244]/20 text-[#ff4466] border border-[#ff2244]/30 rounded-full px-1.5 py-0.5 mono">
                  {health.threat_count > 99 ? '99+' : health.threat_count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* System status */}
      <div className="px-4 pb-3 space-y-2.5 border-t border-white/[0.06] pt-4">
        {/* Connection status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {health.connected ? (
              <Wifi size={11} className="text-[#00ff88]" />
            ) : (
              <WifiOff size={11} className="text-[#ff2244] animate-blink" />
            )}
            <span className="text-[11px] text-white/40">
              {health.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <span className={cn(
            'text-[10px] px-1.5 py-0.5 rounded-full border mono',
            health.connected
              ? 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/20'
              : 'text-[#ff4466] bg-[#ff2244]/10 border-[#ff2244]/20'
          )}>
            {health.connected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        {/* Latency */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={11} className="text-white/20" />
            <span className="text-[11px] text-white/30">Latency</span>
          </div>
          <span className="text-[11px] mono text-[#00d4ff]/80">
            {health.avg_latency_ms.toFixed(1)}ms
          </span>
        </div>

        {/* Uptime */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-white/30">Uptime</span>
          <span className="text-[11px] mono text-white/40">{uptime}</span>
        </div>

        {/* Demo mode toggle */}
        <button
          onClick={() => setDemoMode(!demoMode)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 rounded-lg border text-[11px] transition-all mt-1',
            demoMode
              ? 'bg-[#ffaa00]/10 border-[#ffaa00]/25 text-[#ffaa00]'
              : 'bg-white/[0.03] border-white/[0.06] text-white/30 hover:text-white/50'
          )}
        >
          <div className="flex items-center gap-1.5">
            <FlaskConical size={11} />
            <span>Demo Mode</span>
          </div>
          <div className={cn(
            'w-7 h-3.5 rounded-full transition-colors relative',
            demoMode ? 'bg-[#ffaa00]/40' : 'bg-white/10'
          )}>
            <div className={cn(
              'absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all',
              demoMode ? 'left-[14px] bg-[#ffaa00]' : 'left-0.5 bg-white/30'
            )} />
          </div>
        </button>
      </div>
    </aside>
  );
}
