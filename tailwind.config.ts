import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ibkr: {
          bg: "#0a0a0a",
          card: "#141414",
          border: "#1f1f1f",
          text: "#e8e8e8",
          dim: "#8a8a8a",
          green: "#3ec77c",
          red: "#ff4d4d",
          orange: "#ff7a00",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Display", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["SF Mono", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
