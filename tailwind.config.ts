import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#6A0DF5", dark: "#5208C4", light: "#EFE6FF" },
        surface: "#EBEAEE",
        muted: "#6B6478",
      },
      boxShadow: { pill: "0 6px 18px rgba(0,0,0,0.06)" },
    },
  },
  plugins: [],
} satisfies Config;
