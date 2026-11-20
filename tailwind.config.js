/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: { DEFAULT: "#0A4B42", dark: "#073A33", light: "#1B6E63" },
        navy: "#0E2A4A",
        gold: { DEFAULT: "#C9A24B", light: "#E0C27A" },
        ivory: "#FBF7EF",
        mist: "#E7EFEA",
      },
      fontFamily: {
        display: ["Alexandria", "sans-serif"],
        body: ["Tajawal", "sans-serif"],
      },
      keyframes: {
        "seal-pulse": {
          "0%": { boxShadow: "0 0 0 0 rgba(201,162,75,0.45)" },
          "70%": { boxShadow: "0 0 0 16px rgba(201,162,75,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(201,162,75,0)" },
        },
        drift: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(2deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "seal-pulse": "seal-pulse 2.6s ease-out infinite",
        drift: "drift 7s ease-in-out infinite",
        marquee: "marquee 22s linear infinite",
      },
    },
  },
  plugins: [],
};
