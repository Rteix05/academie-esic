import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://academie-esic.fr';

  const staticPages: MetadataRoute.Sitemap = [
    { url: base,                                  lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/formations`,                  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/masterclass`,                 lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/histoire`,                    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`,                     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/plan-du-site`,                     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/accessibilite`,                     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/cgu`,                     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/cgv`,                     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/mentions-legales`,            lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/politique-de-confidentialite`,lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];

  return staticPages;
}
