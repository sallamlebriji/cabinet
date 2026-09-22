import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        serif: ["Playfair Display", "Georgia", "serif"],
        display: ["Instrument Serif", "Playfair Display", "Georgia", "serif"]
      },
      colors: {
        ink: "#101923",
        muted: "#66716f",
        line: "#e5ded0",
        ivory: "#fbfaf7",
        cream: "#f8f5ef",
        graphite: "#263238",
        // Historique : encore utilisés par Button/Card/Badge dans l'espace cabinet (dashboard).
        night: {
          950: "#070b0f",
          900: "#0a0f14",
          800: "#0f171e",
          700: "#16222b",
          600: "#1e2f3a"
        },
        gold: {
          50: "#fbf7ea",
          200: "#e2d2a5",
          300: "#d6c48f",
          500: "#c0a973",
          600: "#9c8650",
          700: "#8a7748"
        },
        petrol: {
          50: "#eef7f6",
          100: "#d6ebea",
          400: "#2fb8c4",
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
        },
        // Site public (cabinet médical) : vert sauge apaisant + argile chaude en accent secondaire.
        sage: {
          50: "#f2f6f1",
          100: "#e3ebe0",
          200: "#c7d8c1",
          300: "#a3bf9a",
          500: "#5c7f54",
          600: "#3f6c5b",
          700: "#33513f",
          900: "#1f3327"
        },
        clay: {
          100: "#f3e4d7",
          300: "#e0b99a",
          500: "#c17a4e",
          600: "#a1613a"
        }
      },
      boxShadow: {
        premium: "0 28px 80px rgba(16, 25, 35, 0.12)",
        soft: "0 14px 34px rgba(16, 25, 35, 0.07)",
        glow: "0 20px 60px rgba(14, 95, 104, 0.18)",
        depth: "0 1px 0 rgba(255,255,255,0.08) inset, 0 40px 80px -30px rgba(0,0,0,0.75), 0 18px 30px -18px rgba(0,0,0,0.6)",
        sage: "0 24px 55px -18px rgba(63, 108, 91, 0.4)"
      }
    }
  },
  plugins: []
} satisfies Config;
