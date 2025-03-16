/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          500: '#007AFF',
          600: '#0066D6',
        },
      },
    },
  },
  plugins: [],
}
