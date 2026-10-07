module.exports = {
  content: ['./src/**/*.{html,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#FDFBF7',
        surface: '#F4EFE6',
        foreground: '#4A3C31',
        primary: {
          DEFAULT: '#C08A6B',
          hover: '#A8765A',
          foreground: '#FFFFFF'
        },
        muted: '#B5A597',
        error: {
          DEFAULT: '#D9736A',
          foreground: '#FFFFFF'
        },
        success: {
          DEFAULT: '#84A98C',
          foreground: '#FFFFFF'
        },
        switch: '#C08A6B',
        panel: '#FFFFFF'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(74, 60, 49, 0.1)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(74, 60, 49, 0.05)'
      }
    },
  },
  plugins: [],
}
