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
        // Semantic aliases. These lived in a tailwind.config.ts that was never
        // loaded, so classes using them produced no CSS. Same mapping, in the
        // config that is actually read.
        background: 'var(--bg-primary)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        primary: 'var(--neon-orange)',
        secondary: 'var(--neon-blue)',
        accent: 'var(--neon-purple)',
      },
      fontFamily: {
        'bebas': ['Inter', 'sans-serif'], // Replacing Bebas with Inter Bold for headlines
        'inter': ['Inter', 'sans-serif'],
        'anton': ['var(--font-anton)', 'Arial Narrow', 'sans-serif'],
        'plex': ['var(--font-ibm-plex)', 'system-ui', 'sans-serif'],
        'display': ['var(--font-anton)', 'Arial Narrow', 'sans-serif'],
        'netflix': ['Inter', 'sans-serif'], // Fallback
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
