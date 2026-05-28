/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.01)',
        'premium-hover': '0 20px 50px -12px rgba(99, 102, 241, 0.12), 0 1px 5px rgba(0, 0, 0, 0.02)',
        'glow': '0 0 25px rgba(79, 70, 229, 0.15)',
        'glow-success': '0 0 25px rgba(16, 185, 129, 0.15)',
        'glow-warning': '0 0 25px rgba(245, 158, 11, 0.15)',
      },
      animation: {
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'scale-up': 'scale-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pulse-subtle': 'pulse-subtle 2s infinite ease-in-out',
        'scanner': 'scanner 2.5s linear infinite',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(25px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-up': {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-subtle': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.03)', opacity: '0.95' },
        },
        'scanner': {
          '0%': { top: '0%' },
          '50%': { top: '100%' },
          '100%': { top: '0%' },
        }
      },
    },
  },
  plugins: [],
};
