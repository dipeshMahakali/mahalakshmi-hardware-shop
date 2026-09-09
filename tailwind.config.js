/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#F47B20',
          hover: '#D96510',
          light: '#FFF5EE'
        },
        primary: {
          DEFAULT: '#141414',
          subtle: '#1E2024'
        }
      }
    },
  },
  plugins: [],
}
