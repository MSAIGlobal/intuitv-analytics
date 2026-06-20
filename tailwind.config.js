module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#C6F833', bright: '#D8FF5E', deep: '#9BD600' },
        ink: '#0A0A0A',
        paper: '#F6F6F1',
      },
      fontFamily: {
        display: ['var(--font-anton)', 'Impact', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
