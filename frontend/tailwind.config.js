/** @type {import('tailwindcss').Config} */

// Taille de texte réglable par l'utilisateur (outil d'accessibilité) : --text-scale est posé sur <html>.
// Seul le texte grandit ; marges et largeurs restent fixes, la mise en page ne déborde pas.
const scaled = (rem) => `calc(${rem}rem * var(--text-scale, 1))`;
const size = (rem, lineHeight) => [scaled(rem), { lineHeight: typeof lineHeight === 'number' ? scaled(lineHeight) : lineHeight }];

module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Échelle typographique Tailwind par défaut, rendue proportionnelle à --text-scale
    fontSize: {
      xs:   size(0.75, 1),
      sm:   size(0.875, 1.25),
      base: size(1, 1.5),
      lg:   size(1.125, 1.75),
      xl:   size(1.25, 1.75),
      '2xl': size(1.5, 2),
      '3xl': size(1.875, 2.25),
      '4xl': size(2.25, 2.5),
      '5xl': size(3, '1'),
      '6xl': size(3.75, '1'),
      '7xl': size(4.5, '1'),
      '8xl': size(6, '1'),
      '9xl': size(8, '1'),
    },
    extend: {
      // Palette de l'Académie (inchangée) exposée sous des noms sémantiques
      colors: {
        brand: {
          forest:  '#0F291E', // vert profond : titres, boutons principaux, fonds sombres
          ink:     '#1C2C24', // texte courant
          emerald: '#047857', // accent (emerald-700 : contraste AA 5,5:1 en texte comme en fond sous texte blanc)
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
        // Une seule oscillation de moins de 5 s (RGAA 13.8 : pas de mouvement automatique prolongé)
        float: 'float 3s ease-in-out 1',
      },
    },
  },
  plugins: [],
}
