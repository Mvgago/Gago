/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        michroma: ['"Michroma"', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      letterSpacing: {
        'ultra-wide': '0.28em',
        'mega-wide': '0.45em',
      },
    },
  },
  plugins: [],
}
