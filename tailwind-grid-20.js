// Add this to your tailwind.config.js in the extend section:
module.exports = {
  theme: {
    extend: {
      gridTemplateColumns: {
        '20': 'repeat(20, minmax(0, 1fr))'
      },
      gridColumn: {
        'span-6': 'span 6 / span 6',
        'span-8': 'span 8 / span 8',
        'span-12': 'span 12 / span 12',
      }
    }
  }
}
