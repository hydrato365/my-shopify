// tailwind.config.ts

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ==================== MODIFICATION START ====================
      // Add a custom screen variant for devices that can hover (i.e., have a mouse).
      // We can then use this variant like `can-hover:hover:text-red-500`.
      screens: {
        'can-hover': {'raw': '(hover: hover) and (pointer: fine)'},
      },
      // ===================== MODIFICATION END =====================
      colors: {
        'soft-white': '#dfe3e8',
        'text-light': '#e5e7eb', 
        'soft-black': '#111827',
      },
      keyframes: {
        pop: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.25)' },
        }
      },
      animation: {
        pop: 'pop 0.3s ease-in-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config