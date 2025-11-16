/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",   // <— IMPORTANT so all your components get tailwind
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
