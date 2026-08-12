/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0F19",
        surface: "#131826",
        surface2: "#1B2436",
        border: "#1E2536",
        text: {
          primary: "#E7E9EE",
          muted: "#B7BDC9",
          faint: "#7A8299",
        },
        gold: "#F2B84B",
        teal: "#38B2AC",
        blue: "#5B8DEF",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
