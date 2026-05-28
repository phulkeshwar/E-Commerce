/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#f5f0e8",
        warm: "#faf7f2",
        tc: "#c4622d",
        tcl: "#e07a4a",
        dk: "#2c1a0e",
        mid: "#5a3a1a",
        lt: "#9b6b3a",
        sage: "#6b8f71",
        gold: "#c9a84c",
        bd: "#e0d5c5",
        danger: "#dc2626",
        success: "#16a34a",
        info: "#2563eb",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(44, 26, 14, 0.12)",
        nav: "0 2px 16px rgba(0, 0, 0, 0.3)",
        hover: "0 6px 24px rgba(44, 26, 14, 0.12)",
      },
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
        serif: ['"Playfair Display"', "serif"],
      },
      keyframes: {
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "none" },
        },
        pageIn: {
          from: { opacity: "0", transform: "translateY(18px) scale(0.985)" },
          to: { opacity: "1", transform: "none" },
        },
        pageOut: {
          from: { opacity: "1", transform: "none" },
          to: { opacity: "0", transform: "translateY(-12px) scale(0.99)" },
        },
      },
      animation: {
        spin: "spin 1s linear infinite",
        fadeUp: "fadeUp 0.6s cubic-bezier(.22, 1, .36, 1) both",
        pageIn: "pageIn 0.28s cubic-bezier(.22, 1, .36, 1) both",
        pageOut: "pageOut 0.18s cubic-bezier(.55, 0, 1, .45) both",
      },
    },
  },
  plugins: [],
};
