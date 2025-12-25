/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // This tells Tailwind: "When I say 'bg-brand', use the variable --primary-color"
        brand: "var(--primary-color)", 
        
        // We can also map your background colors if you want
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "border-color": "var(--border-color)",
      },
    },
  },
  plugins: [],
}