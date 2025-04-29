/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cosmic: ["'Orbitron'", 'sans-serif'],
      },
      colors: {
        spaceBlue: "#0b0f1a",
        neonPurple: "#8f00ff",
        starWhite: "#f0f0f0",
      },
      backgroundImage: {
        'space': "url('/astro4.webp')",
      },
    },
  },
  plugins: [],
}
