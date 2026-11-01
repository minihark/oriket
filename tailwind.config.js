/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Fredoka', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fredoka', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        nordic: {
          slate: '#0F172A',
          pine: '#166534',
          water: '#0284C7',
          faluRed: '#B91C1C',
          sand: '#FEF3C7',
          sun: '#FBBF24',
        },
      },
    },
  },
  plugins: [],
};
