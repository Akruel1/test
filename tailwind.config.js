/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-bg': '#0f0f1a',
        'game-primary': '#00ff9d',
        'game-secondary': '#7000ff',
        'game-accent': '#ff0055',
        'game-text': '#e0e0e0',
        'terminal-bg': '#1e1e1e',
      },
      fontFamily: {
        mono: ['"Fira Code"', 'monospace'],
        pixel: ['"Press Start 2P"', 'cursive', 'monospace'], // We'll need to load a pixel font or use a web safe one
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 1s linear infinite',
      },
      keyframes: {
        glitch: {
          '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' },
          '62%': { transform: 'translate(0,0) skew(5deg)' },
        }
      }
    },
  },
  plugins: [],
}
