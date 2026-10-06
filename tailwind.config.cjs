module.exports = {
  content: ['./src/**/*.{html,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F9FAFB',
        surface: '#FFFFFF',
        foreground: '#374151',
        primary: {
          DEFAULT: '#7BA085',
          hover: '#8EB298',
          foreground: '#FFFFFF'
        },
        muted: '#9CA3AF',
        error: {
          DEFAULT: '#FECDD3',
          foreground: '#BE123C'
        },
        success: {
          DEFAULT: '#BBF7D0',
          foreground: '#15803D'
        },
        switch: '#7BA085',
        panel: '#FFFFFF'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)'
      }
    },
  },
  plugins: [],
}
