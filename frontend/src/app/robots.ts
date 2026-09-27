import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Espace membre et pages de compte : sans intérêt pour les moteurs de recherche
      disallow: ['/dashboard', '/login', '/register', '/forgot-password', '/reset-password'],
    },
    sitemap: 'https://academie-esic.fr/sitemap.xml',
  };
}
