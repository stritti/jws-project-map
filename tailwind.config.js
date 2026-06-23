/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'
import aspectRatio from '@tailwindcss/aspect-ratio'

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // JWS Brand Colors
        primary: {
          DEFAULT: '#3d5e9e',
          light: '#6a8fd4',
          dark: '#2a4374',
          50: '#f0f4ff',
          100: '#e1e9ff',
          200: '#c3d4fd',
          300: '#a4b9f8',
          400: '#829ef3',
          500: '#6a8fd4',
          600: '#527bc4',
          700: '#3d5e9e',
          800: '#2a4374',
          900: '#1d2c4f',
          950: '#121c33',
        },
        // Secondary colors
        secondary: {
          DEFAULT: '#3c5d9d',
          light: '#6a8fd4',
          dark: '#2a4374',
        },
        // Surface colors
        surface: {
          DEFAULT: '#f8f9fa',
          variant: '#e1e3e4',
        },
        // Text colors
        onSurface: {
          DEFAULT: '#191c1d',
          variant: '#64748b',
        },
        // Outline colors
        outline: {
          DEFAULT: '#75777d',
          variant: '#c5c6cd',
        },
        // State colors
        finished: '#198754',
        'under-construction': '#ffc107',
        planned: '#3d5e9e',
      },
      fontFamily: {
        sans: ['Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'headline-lg': ['24px', { lineHeight: '32px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600', letterSpacing: '-0.01em' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-md': ['12px', { lineHeight: '16px', fontWeight: '600', letterSpacing: '0.02em' }],
        'label-sm': ['11px', { lineHeight: '14px', fontWeight: '500', letterSpacing: '0.03em' }],
      },
      spacing: {
        'unit': '4px',
        'gutter-xs': '8px',
        'gutter-md': '16px',
        'margin-sm': '12px',
        'margin-lg': '24px',
        'sidebar-width': '320px',
      },
      lineHeight: {
        'headline-lg': '32px',
        'headline-md': '28px',
        'body-lg': '24px',
        'body-md': '20px',
        'label-md': '16px',
        'label-sm': '14px',
      },
      borderRadius: {
        'round-small': '0.25rem',
        'round-default': '0.5rem',
        'round-medium': '0.75rem',
        'round-large': '1rem',
        'round-xl': '1.5rem',
        'round-full': '9999px',
      },
      boxShadow: {
        'jws-sm': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'jws-md': '0 10px 30px rgba(0, 0, 0, 0.04)',
        'jws-lg': '0 20px 50px rgba(0, 0, 0, 0.08)',
      },
      transitionTimingFunction: {
        'jws': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      outlineWidth: {
        '3': '3px',
      },
      outlineColor: {
        'secondary': '#3c5d9d',
      },
      animation: {
        'loader-slide': 'loader-slide 1.4s ease-in-out infinite',
        'reveal-image': 'revealImage 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
      },
      keyframes: {
        loaderSlide: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        revealImage: {
          from: { transform: 'scale(1.1)', opacity: '0', filter: 'blur(10px)' },
          to: { transform: 'scale(1)', opacity: '1', filter: 'blur(0)' },
        },
      },
    },
  },
  plugins: [
    forms,
    typography,
    aspectRatio,
  ],
}
