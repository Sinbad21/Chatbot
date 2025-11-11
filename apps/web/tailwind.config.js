/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors (kept for compatibility)
        primary: '#6366f1',
        secondary: '#8b5cf6',
        // New Charcoal/Emerald palette
        charcoal: '#0F172A',
        'off-white': '#F8FAFC',
        emerald: '#10B981',
        'muted-gray': '#94A3B8',
      },
    },
  },
  plugins: [],
};
