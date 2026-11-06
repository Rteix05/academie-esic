'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { API_URL, DEMO_MODE } from '@/lib/api';

/**
 * Mesure d'audience interne (statistiques du back-office) : signale chaque page affichée.
 *
 * Aucun cookie, aucune donnée personnelle : seuls le chemin de la page et, à l'arrivée sur le site,
 * la page d'origine sont envoyés. Requête « simple » (text/plain, sans cookie) : pas de pré-vérification CORS.
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // Même chemin (double exécution en développement) : déjà compté
    if (DEMO_MODE || !pathname || lastPath.current === pathname) return;

    const entry = lastPath.current === null;
    lastPath.current = pathname;

    fetch(`${API_URL}/api/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({ path: pathname, referrer: entry ? document.referrer || null : null, entry }),
      credentials: 'omit',
      keepalive: true,
    }).catch(() => {
      // Statistiques indisponibles : sans incidence pour le visiteur
    });
  }, [pathname]);

  return null;
}
