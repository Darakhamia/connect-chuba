import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'chuba-dark': '#0a0a0a',
        'chuba-grey': '#1a1a1a',
        'chuba-grey-light': '#2a2a2a',
        'chuba-accent': '#2563eb',
        'chuba-accent-hover': '#1d4ed8',
        'chuba-text': '#e5e5e5',
        'chuba-text-muted': '#a1a1a1',
        'chuba-border': '#333333',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
