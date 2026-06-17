import type { Config } from "tailwindcss";

/**
 * Tailwind theme wired to the Talosix brand tokens — mirrors apps/web/tailwind.config.ts
 * in TalOSSurvey so this prototype's chrome looks identical.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#F0F3FF",
          100: "#E1E6FF",
          200: "#BDC8FF",
          300: "#8599FF",
          400: "#5C77FF",
          500: "#3355FF",
          600: "#2244D4",
          700: "#1830A8",
          800: "#10207A",
          900: "#091350",
          950: "#060B32",
        },
        navy:    "#0B2340",
        primary: "#2244D4",
        accent:  "#5C77FF",
        bright:  "#3355FF",
        cyan:    "#8599FF",
        canvas:  "#F1F5F9",
        success: "#16A34A",
        warning: "#D97706",
        danger:  "#DC2626",
        ai:      "#6A48F2",
        aiSoft:  "#F1EDFF",
      },
      fontFamily: {
        sans: ["Geist", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      keyframes: {
        "rise-in": {
          "0%":   { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "rise-in": "rise-in 0.35s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
