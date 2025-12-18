import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#e93131",
        "primary-dark": "#cc2a2a",
        "primary-light": "#f13333",
        "neon-green": "#30ee43",
        "apple-red": "#ff2f2f",
        grey: {
          0: "#fefefe",
          200: "#999999",
          400: "#777777",
          600: "#555555",
          800: "#333333",
          1000: "#212121",
        },
      },
    },
  },
  plugins: [],
};
export default config;
