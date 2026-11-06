/**
 * Photographies d'ambiance libres de droits (Wikimedia Commons), en attendant les photos de l'Académie.
 * Fichiers dans public/assets/img (plusieurs largeurs). Crédits : page /credits-photos.
 *
 * À remplacer par des photos de l'Académie (salle de cours, enseignants, bibliothèque) dès qu'elles existent.
 */

export interface Photo {
  src: string;
  /** Largeurs disponibles, pour srcset */
  srcSet: string;
  width: number;
  height: number;
  alt: string;
  credit: { by: string; licence: string; licenceUrl: string; page: string };
}

const dir = '/assets/img';

export const PHOTOS = {
  /** Carnet ouvert et crayon sur une table en bois */
  carnet: {
    src: `${dir}/photo-d183.webp`,
    srcSet: `${dir}/photo-d183-500.webp 500w, ${dir}/photo-d183-960.webp 960w, ${dir}/photo-d183-1280.webp 1280w, ${dir}/photo-d183.webp 1920w`,
    width: 1920,
    height: 1280,
    alt: 'Carnet ouvert avec un marque-page et un crayon posé sur les pages, sur une table en bois',
    credit: { by: 'Jan Kahánek', licence: 'CC0', licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Tabel_day_1_(Unsplash).jpg' },
  },
  /** Piles de livres */
  livres: {
    src: `${dir}/photo-c877.webp`,
    srcSet: `${dir}/photo-c877-500.webp 500w, ${dir}/photo-c877-960.webp 960w, ${dir}/photo-c877.webp 1280w`,
    width: 1280,
    height: 853,
    alt: 'Piles de livres vues de près',
    credit: { by: 'Nenad Stojkovic', licence: 'CC BY 2.0', licenceUrl: 'https://creativecommons.org/licenses/by/2.0/', page: 'https://commons.wikimedia.org/wiki/File:Close-up_of_stacked_books._(51539890528).jpg' },
  },
  /** Reliure à spirale d'un cahier */
  cahier: {
    src: `${dir}/photo-d185.webp`,
    srcSet: `${dir}/photo-d185-500.webp 500w, ${dir}/photo-d185-960.webp 960w, ${dir}/photo-d185.webp 1280w`,
    width: 1280,
    height: 962,
    alt: 'Reliure à spirale d’un cahier, en gros plan',
    credit: { by: 'Dietmar Rabich', licence: 'CC BY-SA 4.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', page: 'https://commons.wikimedia.org/wiki/File:Spiralbinder%C3%BCcken_--_2022_--_9739.jpg' },
  },
} satisfies Record<string, Photo>;
