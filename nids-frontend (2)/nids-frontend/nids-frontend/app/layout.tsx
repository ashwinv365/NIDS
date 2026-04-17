import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import PollerProvider from '@/components/PollerProvider';

export const metadata: Metadata = {
  title: 'NIDS — Network Intrusion Detection',
  description: 'Intelligent Network Intrusion Detection System with Explainable AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-[#0a0a0f] text-white font-sans antialiased overflow-hidden">
        <PollerProvider>
          <div className="flex h-screen w-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
              {/* Subtle grid background */}
              <div
                className="pointer-events-none fixed inset-0 opacity-30"
                style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
                  backgroundSize: '40px 40px',
                }}
              />
              <div className="relative z-10">
                {children}
              </div>
            </main>
          </div>
        </PollerProvider>
      </body>
    </html>
  );
}
