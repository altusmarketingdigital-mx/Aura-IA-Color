/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          black: "#111111",
          dark: "#1A1A1A",
          card: "#222222",
          gold: "#C6A15B",
          goldLight: "#DFBF7E",
          goldDark: "#9E7B3B",
          ivory: "#F5F1E9",
          cream: "#FAF8F5",
          white: "#FFFFFF",
          muted: "#888888",
          border: "#333333"
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
