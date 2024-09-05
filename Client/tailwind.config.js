/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#DDE6ED',
        darkGray:'#27374D',
        registerButton: '#000932',
        background: '#FAF9F7',
      },
      spacing: {
        icon: '0.9rem'
      },
      width: {
        register: '17.3rem'
      },
      height: {
        regImage: '40rem'
      }
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      nav: '900px'
    },
  },
  plugins: [],
}