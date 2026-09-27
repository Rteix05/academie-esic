/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Palette de l'Académie (inchangée) exposée sous des noms sémantiques
      colors: {
        brand: {
          forest:  '#0F291E', // vert profond : titres, boutons principaux, fonds sombres
          ink:     '#1C2C24', // texte courant
          emerald: '#059669', // accent
          leaf:    '#10B981', // accent clair (survols, décor)
          mint:    '#F0FDF4', // fonds de section doux
          sage:    '#D1FAE5', // décor, pastilles
          cream:   '#FBFBFA', // fond de page
          muted:   '#4B5563', // texte secondaire
          gold:    '#D97706', // accent chaud ponctuel
        },
      },
      fontFamily: {
        // Texte courant : DM Sans — titres, navigation, boutons : Poppins
        sans:    ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft:  '0 20px 50px -24px rgba(15, 41, 30, 0.25)',
        card:  '0 10px 30px -12px rgba(15, 41, 30, 0.12)',
        float: '0 30px 60px -20px rgba(15, 41, 30, 0.30)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
