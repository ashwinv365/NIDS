/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-geist-mono)', 'ui-monospace'],
      },
      colors: {
        surface: {
          DEFAULT: '#0a0a0f',
          1: '#0f0f17',
          2: '#14141f',
          3: '#1a1a28',
          4: '#20203200',
          border: '#ffffff0f',
          'border-subtle': '#ffffff06',
        },
        accent: {
          cyan: '#00d4ff',
          'cyan-dim': '#00d4ff20',
          red: '#ff4444',
          'red-dim': '#ff444420',
          amber: '#ffaa00',
          'amber-dim': '#ffaa0020',
          green: '#00ff88',
          'green-dim': '#00ff8820',
          purple: '#a855f7',
          'purple-dim': '#a855f720',
        },
        threat: {
          critical: '#ff2244',
          high: '#ff6622',
          medium: '#ffaa00',
          low: '#00ccff',
          benign: '#00ff88',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'scan': 'scan 4s linear infinite',
        'beacon': 'beacon 2s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        beacon: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 255, 136, 0.4)' },
          '50%': { boxShadow: '0 0 0 6px rgba(0, 255, 136, 0)' },
        },
      },
      backgroundImage: {
        'grid-subtle': `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
};
