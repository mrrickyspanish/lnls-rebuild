/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'slate-base': '#0D0D0D',
        'slate-surface': '#1A1A1D',
        'slate-elevated': '#25252A',
        'slate-muted': '#9E9E9E', // text-secondary
        'offwhite': '#FFFFFF', // text-primary
        'neon-orange': '#FF6B35',
        'neon-blue': '#00D4FF',
        'neon-purple': '#B857FF',
      },
      fontFamily: {
        'bebas': ['Inter', 'sans-serif'], // Replacing Bebas with Inter Bold for headlines
        'inter': ['Inter', 'sans-serif'],
        'space': ['var(--font-space)', 'sans-serif'],
        'netflix': ['Inter', 'sans-serif'], // Fallback
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
