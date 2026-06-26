/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0A0A',
          secondary: '#141414',
          card: '#1A1A1A',
          elevated: '#242424',
        },
        brand: {
          green: '#00FFA3',
          purple: '#9945FF',
        },
        up: '#00C896',
        down: '#FF4757',
        text: {
          primary: '#FFFFFF',
          secondary: '#8B8B8B',
          muted: '#444444',
        },
        border: '#2A2A2A',
      },
      fontFamily: {
        sans: ['Inter', 'System'],
        mono: ['SpaceMono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
