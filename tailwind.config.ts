import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF3EA", paper: "#FFFAF3", blush: "#F6D9D6", rose: "#C9677E",
        rosedeep: "#A84E66", lavender: "#CFC3E8", plum: "#4A2C3C", mauve: "#8A6B7A",
      },
      fontFamily: { serif: ["var(--font-serif)", "Georgia", "serif"], sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
      boxShadow: { paper: "0 1px 0 #fff inset, 0 18px 40px -22px rgba(120,60,80,.35)", lift: "0 10px 22px -12px rgba(168,78,102,.55)" },
    },
  },
  plugins: [],
} satisfies Config;
