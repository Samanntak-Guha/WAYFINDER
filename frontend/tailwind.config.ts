import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0C0D0B",
        "background-secondary": "#141613",
        surface: {
          DEFAULT: "#1B1E19",
          hover: "#242821",
          active: "#2D322A",
        },
        primary: {
          DEFAULT: "#F1F0E9",
          hover: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#A4A69C",
          hover: "#C3C5BD",
        },
        muted: {
          DEFAULT: "#777C70",
          dark: "#55594F",
        },
        accent: {
          DEFAULT: "#B7C5A5", // Sage green accent
          hover: "#C6D3B6",
          dark: "#8F9D7D",
        },
        sand: {
          DEFAULT: "#C7B99C", // Warm architectural sand
          hover: "#D6CABA",
          dark: "#A3967C",
        },
        glass: {
          border: "rgba(255, 255, 255, 0.09)",
          "border-hover": "rgba(255, 255, 255, 0.18)",
          bg: "rgba(27, 30, 25, 0.65)",
          "bg-light": "rgba(35, 40, 33, 0.45)",
          highlight: "rgba(255, 255, 255, 0.03)",
        },
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "system-ui", "sans-serif"],
        editorial: ["Instrument Serif", "Georgia", "serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-sm": "0 4px 16px 0 rgba(0, 0, 0, 0.25)",
        "glow-accent": "0 0 24px -4px rgba(183, 197, 165, 0.25)",
        "glow-sand": "0 0 24px -4px rgba(199, 185, 156, 0.25)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
