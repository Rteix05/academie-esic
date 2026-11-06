'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AUTH_EVENT, fetchMe } from '@/lib/api';
import { INSCRIPTIONS_DATE_LIMITE } from '@/lib/parcours';

/**
 * Dernier écran avant le plan du site : la date limite des inscriptions et l'action principale.
 * Un élève connecté n'a plus de compte à créer : on lui propose le catalogue.
 */
export default function FooterClose() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    fetchMe().then((me) => setSignedIn(!!me));
    const onAuth = (e: Event) => setSignedIn(!!(e as CustomEvent<{ authenticated: boolean }>).detail?.authenticated);
    window.addEventListener(AUTH_EVENT, onAuth);
    return () => window.removeEventListener(AUTH_EVENT, onAuth);
  }, []);

  return (
    <section aria-labelledby="footer-close-title" className="border-t border-brand-forest/10 py-20 sm:py-24 dark:border-white/10">
      <div className="container-page grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <h2 id="footer-close-title" className="section-title">
            Inscriptions ouvertes jusqu&apos;au {INSCRIPTIONS_DATE_LIMITE}
          </h2>
          <p className="section-lead">
            {signedIn
              ? 'Choisissez votre prochaine formation dans le catalogue : elle s’ajoute à votre espace dès l’achat.'
              : 'Créez votre compte en une minute, puis choisissez les formations qui vous correspondent.'}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
          {signedIn ? (
            <Link href="/formations" className="btn-primary">
              Voir les formations
              <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </Link>
          ) : (
            <Link href="/register" className="btn-primary">
              Créer mon compte
              <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </Link>
          )}
          <Link href="/contact" className="btn-secondary">Contacter l&apos;Académie</Link>
        </div>
      </div>
    </section>
  );
}
