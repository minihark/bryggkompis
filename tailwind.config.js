/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brew: {
          950: '#0a0c0f',
          900: '#11141a',
          850: '#181d26',
          800: '#212836',
          700: '#323d52',
          600: '#4b5b7a',
          500: '#6d7f9f',
          400: '#9aa8c0',
          300: '#c5d0e0',
          200: '#e4ebf5',
          100: '#f4f7fc',
        },
        amber: {
          glow: '#d97706',
          beer: '#b45309',
        },
        hop: {
          50: '#f0fdf4',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
