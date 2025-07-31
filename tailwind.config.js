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
        neon: {
          purple: '#8B5CF6',
          blue: '#3B82F6',
          pink: '#EC4899',
          cyan: '#06B6D4'
        }
      },
      animation: {
        'scan': 'scan 1.5s ease-in-out infinite',
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' }
        },
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' }
        }
      }
    },
  },
  plugins: [],
}