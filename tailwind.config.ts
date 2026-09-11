import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        kid: {
          yellow: "#FFD23F",
          orange: "#FF7849",
          red: "#FF4A5A",
          pink: "#FF6B8B",
          purple: "#9B5DE5",
          blue: "#00BBF9",
          teal: "#00F5D4",
          green: "#52B788",
        },
      },
      fontFamily: {
        fun: ["Nunito", "Quicksand", "sans-serif"],
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        pop: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "70%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        wiggle: "wiggle 0.5s ease-in-out infinite",
        pop: "pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;
