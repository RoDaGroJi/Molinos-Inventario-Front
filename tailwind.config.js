/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0f172a",    // Slate-900
          primary: "#2563eb", // Blue-600
          light: "#f8fafc",   // Gray-50
        }
      }
    },
  },
  plugins: [],
}