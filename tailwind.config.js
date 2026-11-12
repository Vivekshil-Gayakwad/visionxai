/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        // 3) Retro Semaphore Palette
        // 1: Forest Green (#0B6B3A)
        // 2: Warm Golden Yellow (#FFD166)
        // 3: Coral Pink (#EF476F)
        // 4: Deep Midnight Teal (#073B4C)
        // 5: Canvas Light (#0d7192) / Canvas Dark (#082733)
        // Header & Footer: Light (#052631) / Dark (#00080C)
        retro: {
          green: '#0B6B3A',
          gold: '#FFD166',
          coral: '#EF476F',
          teal: '#073B4C',
          canvasLight: '#0d7192',
          canvasDark: '#082733',
          headerLight: '#052631',
          headerDark: '#00080C',
          card: '#073B4C',
          cardHover: '#0A485C',
          border: '#0F5E78',
          borderDark: '#146E8C',
          muted: '#CFE2E8',
        },
        teal: {
          50: '#F0F7F9',
          100: '#CFE2E8',
          200: '#9ECCD7',
          300: '#6DB6C5',
          400: '#3CA0B4',
          500: '#0B6B3A',
          600: '#0F5E78',
          700: '#0A485C',
          800: '#073B4C',
          900: '#052D3A',
          950: '#00080C',
        },
        navy: {
          50: '#0d7192',
          100: '#CFE2E8',
          200: '#9ECCD7',
          300: '#6DB6C5',
          400: '#3CA0B4',
          500: '#0F5E78',
          600: '#0A485C',
          700: '#073B4C',
          800: '#052D3A',
          900: '#031E27',
          950: '#00080C',
        },
        purple: {
          50: '#FFF7E6',
          100: '#FFECC0',
          200: '#FFE09A',
          300: '#FFD166',
          400: '#FFC843',
          500: '#EF476F',
          600: '#E63962',
          700: '#D6224E',
          800: '#073B4C',
          900: '#052D3A',
          950: '#00080C',
        },
        pink: {
          50: '#FDEDF1',
          100: '#FBD2DC',
          200: '#F7A7BA',
          300: '#F37B97',
          400: '#EF476F',
          500: '#EF476F',
          600: '#DE2F58',
          700: '#C01E44',
          800: '#9E1536',
          900: '#073B4C',
          950: '#00080C',
        },
        yellow: {
          50: '#FFFBEA',
          100: '#FFF4C5',
          200: '#FFEAA0',
          300: '#FFDF70',
          400: '#FFD166',
          500: '#FFC338',
          600: '#E6A512',
          700: '#BF8107',
          800: '#8C5A03',
          900: '#5A3601',
        },
        brand: {
          teal: '#073B4C',
          gold: '#FFD166',
          coral: '#EF476F',
          green: '#0B6B3A',
          bgLight: '#0d7192',
          bgDark: '#082733',
          card: '#073B4C',
          cardElevated: '#0A485C',
          border: '#0F5E78',
          textWhite: '#FFFFFF',
          textMuted: '#CFE2E8',
          textDark: '#073B4C',
        }
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
}
