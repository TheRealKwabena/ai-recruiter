/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eefdf5',
          100: '#d6f5e3',
          200: '#aeeacc',
          300: '#7dddb1',
          400: '#42cf96',
          500: '#14b77d',
          600: '#0e9666',
          700: '#0c7553',
          800: '#0b5c43',
          900: '#094b37',
        },
        charcoal: '#0f172a',
      },
      fontFamily: {
        sans: ['Open Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-card': '0 20px 60px -25px rgba(15,23,42,0.35)',
      },
      backgroundImage: {
        'hero-gradient':
          'radial-gradient(circle at 20% 20%, rgba(20,183,125,0.25), transparent 55%), radial-gradient(circle at 80% 0%, rgba(14,150,102,0.35), transparent 45%), linear-gradient(135deg, #052e2f 0%, #031b1c 45%, #042423 100%)',
      },
    },
  },
  plugins: [],
}

