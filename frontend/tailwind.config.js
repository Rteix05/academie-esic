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
      xs:   size(0.8125, 1.125), // 13 px : plus petite taille de texte du site
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
        // Arrondis « doux » : 20 px pour les cartes et cadres, 24 px pour les grands panneaux
        '4xl': '1.25rem',
        '5xl': '1.5rem',
      },
      boxShadow: {
        // Pas d'ombre au repos (filets fins) ; ombre douce au survol et sous les menus déroulants
        soft:  '0 12px 24px -12px rgba(15, 41, 30, 0.10)',
        card:  '0 0 #0000',
        float: '0 16px 40px -16px rgba(15, 41, 30, 0.18)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'step-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        // Rien ne bouge tout seul : seules les interactions (survol, clic) animent l'interface
        float: 'none',
        'step-in': 'none',
      },
    },
  },
  plugins: [],
}
