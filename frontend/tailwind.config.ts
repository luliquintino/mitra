import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coral: '#FF6B4A',
        'coral-light': '#FFF5F2',
        rosa: '#FF4E8C',
        'rosa-light': '#FFF0F5',
        amarelo: '#FFB930',
        'amarelo-light': '#FFF8E8',
        menta: '#2ED8A3',
        'menta-light': '#F0FFF8',
        azul: '#4DA3FF',
        'azul-light': '#F0F6FF',
        creme: '#FFF8F0',
        'creme-dark': '#FFF0E0',
        texto: '#2D1B14',
        'texto-soft': '#8C7A6B',
        'texto-muted': '#B5A898',
        branco: '#FFFFFF',
        footer: '#2D1B14',
        erro: '#E53935',
        'erro-light': '#FFEBEE',
      },
      fontFamily: {
        headline: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body: ['var(--font-vietnam)', 'Be Vietnam Pro', 'system-ui', 'sans-serif'],
        label: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '2rem',
        xl: '3rem',
        full: '9999px',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(45,27,20,0.06)',
        'card-hover': '0 8px 24px rgba(45,27,20,0.08)',
        'modal': '0 20px 60px rgba(45,27,20,0.12)',
        'nav': '0 -8px 30px rgba(45,27,20,0.06)',
        'ambient': '0 4px 48px rgba(45,27,20,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'bounce-down': 'bounceDown 2s ease-in-out infinite',
        'reveal-up': 'revealUp 0.6s ease-out forwards',
        'wiggle': 'wiggle 0.3s ease-in-out',
        'float': 'float 7s ease-in-out infinite',
        'float-slow': 'floatSlow 9s ease-in-out infinite',
        'squishy': 'squishy 0.15s ease-out',
        'bounce-in': 'bounceIn 0.4s var(--ease-bounce) forwards',
        'fade-slide-up': 'fadeSlideUp 0.5s ease-out forwards',
        'pulse-badge': 'pulseBadge 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        bounceDown: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(8px)' },
        },
        revealUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-14px) scale(1.03)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(3deg)' },
        },
        squishy: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.92)' },
          '100%': { transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
          '75%': { transform: 'scale(0.96)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseBadge: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.25)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
