/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#4f378a",
        "primary-light": "#6750a4",
        "surface": "#fdf7ff",
        "surface-variant": "#e6e0e9",
        "on-surface": "#1d1b20",
        "on-surface-variant": "#494551",
        "error": "#f43f5e",
        "success": "#10b981",
        "warning": "#f59e0b",
        "outline": "#7a7582",
        "outline-variant": "#cbc4d2"
      },
      fontFamily: {
        "display": ["Hanken Grotesk", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "mono": ["Geist", "monospace"]
      },
      borderRadius: {
        "glass": "1rem",
        "glass-lg": "1.5rem"
      }
    },
  },
  plugins: [],
}
