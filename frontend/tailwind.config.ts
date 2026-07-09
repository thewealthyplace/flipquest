import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B120B",
        cream: "#FCF6F1",
        yellow: "#FCFF52",
        purple: "#B28CFF",
        green: "#56DF7C",
        red: "#F65E5E",
      },
      fontFamily: {
        display: ["var(--font-unbounded)", "sans-serif"],
        body: ["var(--font-sora)", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
