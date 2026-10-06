module.exports = {
  content: ['./src/**/*.{html,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Courier New"', 'Courier', 'monospace'],
      },
      colors: {
        background: '#0A0A1A',
        surface: '#151525',
        foreground: '#00FFFF',
        primary: {
          DEFAULT: '#FF007F',
          hover: '#FF3399',
          foreground: '#0A0A1A'
        },
        muted: '#FF007F',
        error: {
          DEFAULT: '#FF0055',
          foreground: '#FFFFFF'
        },
        success: {
          DEFAULT: '#00FFCC',
          foreground: '#0A0A1A'
        },
        switch: '#00FFFF',
        panel: '#151525'
      },
      borderRadius: {
        'xl': '0.5rem',
        '2xl': '0.5rem',
        '3xl': '0.5rem',
      },
      boxShadow: {
        'soft': '0 0 20px rgba(0, 255, 255, 0.3)',
        'inner-soft': 'inset 0 0 10px rgba(255, 0, 127, 0.2)'
      }
    },
  },
  plugins: [],
}
