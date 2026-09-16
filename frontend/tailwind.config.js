/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brandBg: "#f2f4ef",
        brandLime: "#a3e635",
        brandLimeDark: "#84cc16",
        brandEmerald: "#059669",
        brandDark: "#0f172a",
      },
    },
  },
  plugins: [],
};