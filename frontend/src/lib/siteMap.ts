/**
 * Arborescence publique du site : source unique du pied de page et de la page « Plan du site ».
 */
export interface SiteLink {
  href: string;
  label: string;
}

export interface SiteSection {
  title: string;
  links: SiteLink[];
}

export const SITE_SECTIONS: SiteSection[] = [
  {
    title: 'Académie',
    links: [
      { href: '/', label: 'Accueil' },
      { href: '/histoire', label: 'À propos' },
      { href: '/how-it-works', label: 'Comment ça marche' },
      // { href: '/temoignages', label: 'Témoignages' }, — masquée jusqu'à la réception de vrais avis
      { href: '/actualites', label: 'Actualités' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Apprendre',
    links: [
      { href: '/formations', label: 'Formations' },
      { href: '/masterclass', label: 'Masterclass' },
    ],
  },
  {
    title: 'Mon compte',
    links: [
      { href: '/login', label: 'Connexion' },
      { href: '/register', label: 'Inscription' },
      { href: '/dashboard', label: 'Mon espace' },
      { href: '/dashboard/profil', label: 'Mon profil' },
    ],
  },
  {
    title: 'Informations',
    links: [
      { href: '/mentions-legales', label: 'Mentions légales' },
      { href: '/politique-de-confidentialite', label: 'Politique de confidentialité' },
      { href: '/accessibilite', label: 'Accessibilité' },
      { href: '/plan-du-site', label: 'Plan du site' },
    ],
  },
];
