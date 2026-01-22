/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-purple': '#b026ff',
        'neon-blue': '#00f3ff',
        'neon-green': '#00ff41',
        'dark-bg': '#050505',
        'panel-bg': '#111111',
      },
      fontFamily: {
        mono: ['"Courier New"', 'monospace'],
        pixel: ['"Press Start 2P"', 'cursive'], // I'll need to import this font later
      },
    },
  },
  plugins: [],
}
