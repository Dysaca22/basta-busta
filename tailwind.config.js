/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-100': '#FFD700',
        'primary-200': '#ddb900',
        'primary-300': '#917800',
        'accent-100': '#FF6347',
        'accent-200': '#8d0000',
        'text-100': '#2c3e50',
        'text-200': '#57687c',
        'bg-100': '#FDFBF6',
        'bg-200': '#f3f1ec',
        'bg-300': '#cac8c3',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        handwriting: ['"Patrick Hand"', 'cursive'],
        marker: ['"Permanent Marker"', 'cursive'],
      }
    },
  },
  plugins: [],
}
