/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // CYNA brand colors - can be customized later
        cyna: {
          primary: '#0066CC',
          secondary: '#003366',
          accent: '#00AAFF',
        },
      },
    },
  },
  plugins: [],
};
