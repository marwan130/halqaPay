/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1A3C5E",
        accent: "#D4AF37",
        background: "#F8F9FA"
      }
    }
  },
  plugins: []
};
