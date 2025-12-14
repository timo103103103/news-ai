/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        heading: ["Oswald", "Inter", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        sans: ["Roboto", "Open Sans", "Segoe UI", "Noto Sans", "Helvetica", "Arial", "sans-serif"],
      },
      colors: {
        neonBlue: "#00f2fe",
        neonMagenta: "#fe00f1",
        neonCyan: "#00ffea",
        neonPurple: "#9d00ff",
      },
      boxShadow: {
        neon: "0 0 10px rgba(0, 242, 254, 0.7), 0 0 20px rgba(0, 242, 254, 0.4)",
        neonMagenta: "0 0 10px rgba(254, 0, 241, 0.7), 0 0 20px rgba(254, 0, 241, 0.4)",
      },
      keyframes: {
        borderGlow: {
          "0%,100%": { boxShadow: "0 0 0px rgba(0, 242, 254, 0), 0 0 0px rgba(254, 0, 241, 0)" },
          "50%": { boxShadow: "0 0 12px rgba(0, 242, 254, 0.6), 0 0 22px rgba(254, 0, 241, 0.5)" },
        },
        neonPulse: {
          "0%,100%": { filter: "drop-shadow(0 0 0px rgba(0, 242, 254, 0))" },
          "50%": { filter: "drop-shadow(0 0 12px rgba(0, 242, 254, 0.6))" },
        },
      },
      animation: {
        "border-glow": "borderGlow 2.5s ease-in-out infinite",
        "neon-pulse": "neonPulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtils = {
        ".text-shadow-neon": { textShadow: "0 0 10px #00f2fe, 0 0 18px #fe00f1" },
        ".text-shadow-blue": { textShadow: "0 0 10px #00f2fe" },
        ".text-shadow-magenta": { textShadow: "0 0 10px #fe00f1" },
      }
      addUtilities(newUtils, ["responsive", "hover"])
    },
  ],
};
