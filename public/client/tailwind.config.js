import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(__dirname, './index.html'),
    path.join(__dirname, './src/**/*.{js,ts,jsx,tsx}'),
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1d1d1f',
          light: '#424245',
          dark: '#000000',
        },
        secondary: {
          DEFAULT: '#f5f5f7',
          light: '#ffffff',
          dark: '#e8e8ed',
        },
        accent: {
          DEFAULT: '#0071e3',
          light: '#358fe6',
          dark: '#005bb5',
        },
        background: {
          light: '#f5f5f7',
          dark: '#000000',
        },
        card: {
          light: '#ffffff',
          dark: '#1d1d1f',
        },
        text: {
          light: '#1d1d1f',
          dark: '#f5f5f7',
          mutedLight: '#86868b',
          mutedDark: '#a1a1a6',
        },
        success: '#388e3c',
        error: '#ff6161',
        warning: '#ff9f00',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 10px 30px -10px rgba(108, 99, 255, 0.15)',
        premiumHover: '0 20px 40px -15px rgba(108, 99, 255, 0.25)',
        glass: '0 8px 32px 0 rgba(108, 99, 255, 0.08)',
        soft: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(-8px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(16px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(108, 99, 255, 0.25)' },
          '50%': { boxShadow: '0 0 0 8px rgba(108, 99, 255, 0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        fadeIn: 'fadeIn 0.25s ease-out forwards',
        fadeInUp: 'fadeInUp 0.35s ease-out forwards',
        pulseGlow: 'pulseGlow 2.5s infinite',
        marquee: 'marquee 20s linear infinite',
      },
    },
  },
  plugins: [],
}
