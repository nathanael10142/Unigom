/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // WhatsApp Dark Theme Exact
        background: '#0a141f',
        sidebar: '#111b21',
        chat: '#202c33',
        primary: '#00a884',
        'primary-hover': '#008069',
        'primary-light': '#dcf8c6',
        'text-primary': '#e9edef',
        'text-secondary': '#8696a0',
        'text-muted': '#667781',
        border: '#2f4550',
        'border-light': '#3b4a52',
        'message-sent': '#005c4b',
        'message-received': '#202c33',
        'hover-bg': '#2a3942',
        'input-bg': '#2f4550',
        'status-online': '#00a884',
        'status-away': '#ffd93d',
        'status-busy': '#ff6b6b',
        'status-offline': '#8696a0',
        // Semantic colors
        success: '#00a884',
        warning: '#ffd93d',
        error: '#ff6b6b',
        info: '#339af0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.7' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
