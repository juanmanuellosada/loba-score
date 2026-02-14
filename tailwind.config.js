/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'casino-green': '#10b981',
        'casino-gold': '#f59e0b',
        'dark-bg': '#0a0a0a',
        'dark-card': '#1a1a1a',
      },
    },
  },
  plugins: [],
}
