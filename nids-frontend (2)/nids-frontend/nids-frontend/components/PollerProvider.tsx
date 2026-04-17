'use client';

import { useNidsPoller } from '@/lib/usePoller';

export default function PollerProvider({ children }: { children: React.ReactNode }) {
  useNidsPoller();
  return <>{children}</>;
}
