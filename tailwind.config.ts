import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f8f5ee',
          100: '#ebe5d3',
          200: '#d4c9a8',
          300: '#a89b78',
          500: '#5a4f3a',
          700: '#2d261a',
          900: '#0e0a05',
        },
        cinnabar: {
          DEFAULT: '#9d2b20',
          light: '#c0392b',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        brush: ['"Ma Shan Zheng"', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;