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
        // Site public (cabinet médical) : bleu médical + cyan, touche teal en accent secondaire.
        // (Clés `sage`/`clay` conservées pour ne pas retoucher les ~15 fichiers qui les utilisent —
        // seules les valeurs changent.)
        sage: {
          50: "#eef4fd",
          100: "#dbe7fb",
          200: "#b8d0f5",
          300: "#7fb0ec",
          500: "#0ea5e9",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a5f"
        },
        clay: {
          100: "#ccfbf1",
          300: "#5eead4",
          500: "#14b8a6",
          600: "#0d9488"
        }
      },
      boxShadow: {
        premium: "0 28px 80px rgba(16, 25, 35, 0.12)",
        soft: "0 14px 34px rgba(16, 25, 35, 0.07)",
        glow: "0 20px 60px rgba(14, 95, 104, 0.18)",
        depth: "0 1px 0 rgba(255,255,255,0.08) inset, 0 40px 80px -30px rgba(0,0,0,0.75), 0 18px 30px -18px rgba(0,0,0,0.6)",
        sage: "0 24px 55px -18px rgba(37, 99, 235, 0.4)"
      }
    }
  },
  plugins: []
} satisfies Config;
