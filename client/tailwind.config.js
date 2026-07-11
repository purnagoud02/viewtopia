export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 30px 90px rgba(255, 14, 45, 0.18)",
      },
      backgroundImage: {
        hero: "linear-gradient(180deg, rgba(7, 8, 18, 0.92), rgba(7, 8, 18, 0.94)), url('/hero-bg.jpg')",
      },
    },
  },
  plugins: [],
};