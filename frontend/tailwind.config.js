/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#071113',
          900: '#0b191b',
          850: '#102124',
          800: '#17292b',
          700: '#223638',
        },
        gold: {
          antique: '#a66b3f',
          warm: '#b67c4d',
          pale: '#d5aa78',
          dark: '#70472f',
        },
        parchment: {
          light: '#f5f0e6',
          muted: '#ded6c7',
          dim: '#8f887b',
        },
        order: {
          sindhu: '#14b8a6',
          aakar: '#eab308',
          pragya: '#10b981',
          kshatra: '#ef4444',
          aarohan: '#3b82f6',
          utkarsh: '#a855f7',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
        devanagari: ['"Noto Serif Devanagari"', '"Rozha One"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'radial-vignette': 'radial-gradient(circle at 50% 30%, rgba(35, 67, 68, 0.25) 0%, rgba(7, 17, 19, 0.92) 85%)',
        'gold-glow': 'radial-gradient(circle, rgba(166, 107, 63, 0.14) 0%, rgba(0, 0, 0, 0) 70%)',
      },
      boxShadow: {
        'gold-subtle': '0 0 20px -5px rgba(166, 107, 63, 0.25)',
        'gold-intense': '0 0 35px 2px rgba(166, 107, 63, 0.42)',
      }
    },
  },
  plugins: [],
}
