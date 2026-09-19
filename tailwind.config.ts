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
        indigo: {
          50: '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d9ff',
          300: '#99bcff',
          400: '#5c91ff',
          500: '#2b65f5',
          600: '#1142d4', // Deep Royal Blue
          700: '#0d2d9e', // Rich Deep Blue
          800: '#0c2378',
          900: '#0b1d5e',
          950: '#050a1c', // Deepest Navy
        },
      },
    },
  },
  plugins: [],
};
export default config;
