import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm coral accent — replaces flat orange throughout the app
        coral: {
          300: "#fca689",
          400: "#f87858",
          500: "#ef5c35",
          900: "#3b1208",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      spacing: {
        safe: "env(safe-area-inset-bottom, 0px)",
      },
    },
  },
  plugins: [],
};
export default config;
