import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        serif: ["Playfair Display", "Georgia", "serif"]
      },
      colors: {
        ink: "#101923",
        muted: "#66716f",
        line: "#e5ded0",
        ivory: "#fbfaf7",
        cream: "#f8f5ef",
        graphite: "#263238",
        gold: {
          50: "#fbf7ea",
          200: "#e2d2a5",
          500: "#c0a973"
        },
        petrol: {
          50: "#eef7f6",
          100: "#d6ebea",
          500: "#14707a",
          600: "#0e5f68",
          900: "#0a3038"
        },
        brand: {
          50: "#eef7f6",
          100: "#d6ebea",
          500: "#14707a",
          600: "#0e5f68",
          900: "#0a3038"
        },
        emerald: {
          500: "#10b981"
        }
      },
      boxShadow: {
        premium: "0 28px 80px rgba(16, 25, 35, 0.12)",
        soft: "0 14px 34px rgba(16, 25, 35, 0.07)",
        glow: "0 20px 60px rgba(14, 95, 104, 0.18)"
      }
    }
  },
  plugins: []
} satisfies Config;
