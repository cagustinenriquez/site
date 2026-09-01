import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0f172a',
        },
        muted: {
          DEFAULT: '#262626',
          foreground: '#c9c9c9',
        },
        foreground: '#f5f5f5',
        background: '#1a1a1a',
        border: '#404040',
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#f1f5f9',
            a: {
              color: '#0ea5e9',
              '&:hover': {
                color: '#06b6d4',
              },
            },
            code: {
              color: '#f1f5f9',
              backgroundColor: '#1e293b',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
            },
            'pre code': {
              color: 'inherit',
              backgroundColor: 'inherit',
              padding: 0,
            },
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
