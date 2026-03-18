/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        dm: ['"DM Mono"', 'monospace'],
        instrument: ['"Instrument Serif"', 'serif'],
      },
    },
  },
  plugins: [],
}