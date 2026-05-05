import type { Config } from "tailwindcss";
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  "#f0f4f8",
          100: "#d9e2ec",
          600: "#1e3a5f",
          700: "#162d4a",
          800: "#0f2137",
          900: "#0a1628",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
