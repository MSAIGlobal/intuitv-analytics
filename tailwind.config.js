module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        itv: {
          bg: '#171819', 'bg-secondary': '#202123', 'bg-tertiary': '#292A2D',
          panel: '#222325', 'panel-hover': '#303135',
          border: '#383A3D', 'border-subtle': '#2D2E31',
          accent: '#DFFF00', 'accent-hover': '#EDFF59', 'accent-dark': '#A9BF00',
          text: '#FFFFFF', 'text-secondary': '#A9AAAD', 'text-muted': '#74767A',
          success: '#64E6A3', warning: '#FFBF47', danger: '#FF6262', info: '#65B9FF',
        },
        brand: { DEFAULT: '#DFFF00', bright: '#EDFF59', deep: '#A9BF00' },
        ink: '#0A0A0A',
        paper: '#F6F6F1',
      },
      borderRadius: {
        'itv-sm': '6px', 'itv-md': '10px', 'itv-lg': '16px', 'itv-xl': '24px',
      },
      fontFamily: {
        display: ['var(--font-anton)', 'Impact', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
