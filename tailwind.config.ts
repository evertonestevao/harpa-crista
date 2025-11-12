import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // ← Corrigido (string, não array)
  content: ["./app/**/*.{ts,tsx,js,jsx}", "./components/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
