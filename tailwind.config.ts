import type { Config } from 'tailwindcss'

/**
 * Playful, original aesthetic (see spec §1, §7). Warm "food lab" palette.
 * Color is never the sole signal — components pair hue with icon/text/shape
 * for color-independent accessibility (spec §7, §10).
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mustard: {
          DEFAULT: '#E8B81E',
          dark: '#B8900F',
        },
        ketchup: {
          DEFAULT: '#D64527',
          dark: '#A8321A',
        },
        bun: {
          DEFAULT: '#E6A866',
          dark: '#C27F3C',
        },
        // Semantic, color-independent (always paired with icon/text):
        yes: '#2E8B57', // hot dog / correct
        no: '#6B5B95', // not hot dog / incorrect (purple, not red — distinct from ketchup)
        ink: '#2B2320',
        paper: '#FFF9F0',
        shelf: '#F4E9D8',
      },
      fontFamily: {
        display: ['"Fredoka"', 'system-ui', 'sans-serif'],
        body: ['system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        pulseWire: {
          '0%, 100%': { opacity: '1', strokeWidth: '3' },
          '50%': { opacity: '0.55', strokeWidth: '7' },
        },
      },
      animation: {
        pulseWire: 'pulseWire 0.6s ease-in-out 2',
      },
    },
  },
  plugins: [],
} satisfies Config
