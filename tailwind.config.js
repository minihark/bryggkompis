/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#F7F3EB',
          card: '#FBF9F5',
          warm: '#EFE9DC',
          border: '#D8CEBE',
          dark: '#C7B9A3',
        },
        stout: {
          DEFAULT: '#1E1610',
          800: '#2E231A',
          600: '#5C4B3B',
          400: '#8A7765',
        },
        copper: {
          DEFAULT: '#B85D19',
          hover: '#9E4D12',
          light: '#F5E6D8',
        },
        hop: {
          DEFAULT: '#2D5A27',
          light: '#E6EFE4',
          50: '#f0fdf4',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        brew: {
          950: '#1E1610',
          900: '#2A2018',
          850: '#362A20',
          800: '#45372B',
          700: '#5C4B3B',
          600: '#786452',
          500: '#96826E',
          400: '#B5A390',
          300: '#D4C7B8',
          200: '#EBE3D8',
          100: '#F7F3EB',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Lora', 'Georgia', 'serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
