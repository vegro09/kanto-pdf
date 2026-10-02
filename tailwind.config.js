import typography from '@tailwindcss/typography';

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
        kanto: {
          black: '#0D0D0D',
          cream: '#F5F0E6',
          silver: '#C7C9CC',
          white: '#FFFFFF',
          // Muted text tokens derived strictly from the 4-color palette
          muted: '#5A5D61',
          'muted-cream': '#8C857B',
        }
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '8px',
        md: '8px',
        lg: '8px',
        xl: '8px',
        '2xl': '8px',
        '3xl': '8px',
        full: '9999px',
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Playfair Display Fallback"', 'Georgia', 'serif'],
        sans: ['Inter', '"Inter Fallback"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        arabic: ['Tajawal', 'Cairo', 'sans-serif'],
        arabicHeading: ['"Aref Ruqaa"', 'Tajawal', 'sans-serif'],
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        250: '250ms',
      }
    },
  },
  plugins: [typography],
}
