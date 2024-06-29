/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        theme_primary: '#0094FF',
        theme_secondary: '#9747FF',
        theme_text_normal: '#ffffff',
        theme_text_normal_60: 'rgba(255,255,255,0.6)',
        theme_text_primary: "#91C3E7",
        theme_green: '#00FF38',
        theme_red: '#FF0000',
      },
    },
  },
  plugins: [],
};
