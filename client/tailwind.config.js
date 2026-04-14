/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.05)',
        'card': '0 32px 64px -16px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.04)',
        'glass': '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        'glow-blue': '0 0 40px rgba(14,165,233,0.25)',
        'glow-violet': '0 0 40px rgba(139,92,246,0.25)',
        'glow-rose': '0 0 40px rgba(244,63,94,0.25)',
        'glow-amber': '0 0 40px rgba(245,158,11,0.25)',
        'glow-emerald': '0 0 40px rgba(16,185,129,0.25)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-blue':    'radial-gradient(at 40% 20%, #bfdbfe 0px, transparent 50%), radial-gradient(at 80% 0%, #e0f2fe 0px, transparent 50%), radial-gradient(at 0% 50%, #f0f9ff 0px, transparent 50%)',
        'mesh-violet':  'radial-gradient(at 40% 20%, #ede9fe 0px, transparent 50%), radial-gradient(at 80% 0%, #f5f3ff 0px, transparent 50%), radial-gradient(at 0% 50%, #faf5ff 0px, transparent 50%)',
        'mesh-rose':    'radial-gradient(at 40% 20%, #ffe4e6 0px, transparent 50%), radial-gradient(at 80% 0%, #fff1f2 0px, transparent 50%), radial-gradient(at 0% 50%, #fff5f5 0px, transparent 50%)',
        'mesh-amber':   'radial-gradient(at 40% 20%, #fef3c7 0px, transparent 50%), radial-gradient(at 80% 0%, #fffbeb 0px, transparent 50%), radial-gradient(at 0% 50%, #fffde7 0px, transparent 50%)',
        'mesh-emerald': 'radial-gradient(at 40% 20%, #d1fae5 0px, transparent 50%), radial-gradient(at 80% 0%, #ecfdf5 0px, transparent 50%), radial-gradient(at 0% 50%, #f0fdf4 0px, transparent 50%)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
