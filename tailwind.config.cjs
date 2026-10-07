module.exports = {
  content: ['./src/**/*.{html,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#06141B',
        surface: '#11222C',
        foreground: '#E2E8F0',
        primary: {
          DEFAULT: '#34D399',
          hover: '#10B981',
          foreground: '#06141B'
        },
        muted: '#64748B',
        error: {
          DEFAULT: '#F43F5E',
          foreground: '#FFFFFF'
        },
        success: {
          DEFAULT: '#34D399',
          foreground: '#06141B'
        },
        switch: '#34D399',
        panel: '#11222C'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0, 0, 0, 0.4)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'
      }
    },
  },
  plugins: [],
}
