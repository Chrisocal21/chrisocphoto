import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Inter for text and interface, Sora for headings. Both are loaded in app/layout.tsx.
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        display: ["var(--font-sora)", ...defaultTheme.fontFamily.sans],
      },
      backgroundImage: {
        // The logo's spectrum. Defined once in app/globals.css.
        spectrum: "var(--spectrum)",
      },
      transitionTimingFunction: {
        swift: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fade: {
          from: { opacity: "0" },
        },
        rise: {
          from: { opacity: "0", transform: "translateY(14px)" },
        },
        "tile-in": {
          from: { opacity: "0", transform: "scale(1.05)" },
        },
        pop: {
          from: { opacity: "0", transform: "translateY(-6px) scale(0.97)" },
        },
        sheet: {
          from: { opacity: "0", transform: "translateY(18px)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        fade: "fade 0.35s ease-out both",
        rise: "rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "tile-in": "tile-in 0.9s cubic-bezier(0.16, 1, 0.3, 1) backwards",
        pop: "pop 0.18s cubic-bezier(0.16, 1, 0.3, 1) both",
        sheet: "sheet 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
