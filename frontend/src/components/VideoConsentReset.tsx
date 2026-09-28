'use client';

import { useEffect, useState } from 'react';
import { forgetVideoConsents, storedVideoConsents } from '@/lib/videoConsent';

/** Retrait des accords mémorisés pour les lecteurs vidéo tiers (politique de confidentialité) */
export default function VideoConsentReset() {
  const [providers, setProviders] = useState<string[] | null>(null);

  // Lecture du navigateur après le rendu serveur (le stockage local n'existe que côté client)
  useEffect(() => {
    setProviders(storedVideoConsents());
  }, []);

  if (providers === null) return null;

  return (
    <div className="mt-4 rounded-2xl bg-brand-mint p-4 dark:bg-white/5" aria-live="polite">
      {providers.length > 0 ? (
        <>
          <p>Choix mémorisés dans ce navigateur : {providers.join(', ')}.</p>
          <button
            type="button"
            onClick={() => { forgetVideoConsents(); setProviders([]); }}
            className="btn-secondary mt-3 py-2 text-sm"
          >
            Retirer mon consentement aux lecteurs vidéo
          </button>
        </>
      ) : (
        <p>Aucun choix mémorisé dans ce navigateur pour les lecteurs vidéo tiers.</p>
      )}
    </div>
  );
}
