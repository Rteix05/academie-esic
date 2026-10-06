import type { MetadataRoute } from 'next';
import { SERVER_API_URL } from '@/lib/api';
import { collection, formationToItem, masterclassToItem, type CatalogItem, type FormationDto, type MasterclassDto } from '@/lib/catalog';

const BASE = 'https://academie-esic.fr';

// Sitemap régénéré au plus toutes les heures : les nouvelles fiches y apparaissent sans redéploiement
export const revalidate = 3600;

async function getCatalog<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${SERVER_API_URL}${path}`, { next: { revalidate }, headers: { Accept: 'application/ld+json' } });
    return res.ok ? collection<T>(await res.json()) : [];
  } catch {
    return []; // API injoignable : sitemap limité aux pages fixes plutôt qu'une erreur
  }
}

/** Fiches disponibles uniquement : une fiche « bientôt disponible » n'a pas d'intérêt pour les moteurs */
function detailPages(items: CatalogItem[]): MetadataRoute.Sitemap {
  return items
    .filter((i) => i.available)
    .map((i) => ({ url: `${BASE}${i.href}`, changeFrequency: 'monthly', priority: 0.8 }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [formations, masterclasses] = await Promise.all([
    getCatalog<FormationDto>('/api/formations'),
    getCatalog<MasterclassDto>('/api/masterclasses'),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                                   lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/formations`,                   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/masterclass`,                  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/histoire`,                     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`,                      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/plan-du-site`,                 lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/accessibilite`,                lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/cgu`,                          lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/cgv`,                          lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/mentions-legales`,             lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/politique-de-confidentialite`, lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];

  return [
    ...staticPages,
    ...detailPages(formations.map(formationToItem)),
    ...detailPages(masterclasses.map(masterclassToItem)),
  ];
}
