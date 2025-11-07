import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      gridTemplateColumns: {
        '20': 'repeat(20, minmax(0, 1fr))'
      },
      gridColumn: {
        'span-6': 'span 6 / span 6',
        'span-8': 'span 8 / span 8',
        'span-12': 'span 12 / span 12',
        'span-20': 'span 20 / span 20',
      }
    },
  },
  plugins: [],
};
export default config;
