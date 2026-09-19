import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Identite de marque "outdoor decale" : vert sentier + orange sommet
        trail: {
          50: "#f2f9f0",
          100: "#e0f0da",
          200: "#c2e0b6",
          300: "#98cb85",
          400: "#6cb156",
          500: "#4c9436",
          600: "#3a7529",
          700: "#2f5c22",
          800: "#294a1f",
          900: "#233e1c",
          950: "#0f1a0c",
        },
        summit: {
          50: "#fff7ed",
          100: "#ffedd4",
          200: "#ffd8a8",
          300: "#ffbb70",
          400: "#ff9436",
          500: "#fd7310",
          600: "#ee5906",
          700: "#c54407",
          800: "#9c360e",
          900: "#7e2f0f",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
