'use client';

import { useCallback, useId, useState } from 'react';
import Link from 'next/link';

/**
 * Consentements recueillis avant tout paiement (CGV, articles 5 et 10) :
 *  1. acceptation des conditions générales de vente ;
 *  2. demande expresse d'accès immédiat au contenu numérique, avec renonciation au droit de rétractation.
 *
 * Deux cases distinctes, jamais précochées. Le backend refuse le paiement sans elles (422) :
 * la vérification côté navigateur ne sert qu'à guider l'utilisateur.
 */

/** Texte de la case de renonciation : identique à celui des CGV (10.3) et de l'email de confirmation */
export const IMMEDIATE_ACCESS_CONSENT =
  "Je demande expressément l'accès immédiat au contenu numérique avant l'expiration du délai de rétractation et reconnais qu'en conséquence je perdrai mon droit de rétractation.";

export interface Consents {
  acceptCgv: boolean;
  immediateAccess: boolean;
}

/** État des cases + vérification avant paiement (focus sur la première case manquante) */
export function usePurchaseConsent() {
  const [consents, setConsents] = useState<Consents>({ acceptCgv: false, immediateAccess: false });
  const [showErrors, setShowErrors] = useState(false);
  const baseId = useId();
  const ids = { cgv: `${baseId}-cgv`, access: `${baseId}-acces`, error: `${baseId}-erreur` };

  /** true si les deux cases sont cochées ; sinon affiche l'erreur et place le focus sur la case manquante */
  const validate = useCallback((): boolean => {
    if (consents.acceptCgv && consents.immediateAccess) return true;
    setShowErrors(true);
    document.getElementById(consents.acceptCgv ? ids.access : ids.cgv)?.focus();
    return false;
  }, [consents, ids.access, ids.cgv]);

  return { consents, setConsents, showErrors, validate, ids };
}

type ConsentState = ReturnType<typeof usePurchaseConsent>;

export default function PurchaseConsent({ state, tone = 'light' }: { state: ConsentState; tone?: 'light' | 'dark' }) {
  const { consents, setConsents, showErrors, ids } = state;
  const errorId = ids.error;
  const missing = showErrors && (!consents.acceptCgv || !consents.immediateAccess);
  const dark = tone === 'dark';

  const textClass = dark ? 'text-emerald-50' : 'text-brand-muted';
  const linkClass = dark
    ? 'font-semibold text-white underline underline-offset-4 hover:text-emerald-200'
    : 'font-semibold text-brand-forest underline underline-offset-4 hover:text-brand-emerald dark:text-emerald-200';
  const boxClass = 'mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded accent-brand-emerald';

  return (
    <fieldset className="space-y-3" aria-describedby={missing ? errorId : undefined}>
      <legend className="sr-only">Conditions de la commande</legend>

      <div className="flex items-start gap-3">
        <input
          id={ids.cgv}
          type="checkbox"
          checked={consents.acceptCgv}
          onChange={(e) => setConsents((c) => ({ ...c, acceptCgv: e.target.checked }))}
          aria-invalid={showErrors && !consents.acceptCgv ? true : undefined}
          className={boxClass}
        />
        <label htmlFor={ids.cgv} className={`text-sm ${textClass}`}>
          J&apos;ai lu et j&apos;accepte les{' '}
          <Link href="/cgv" target="_blank" rel="noopener" className={linkClass}>
            conditions générales de vente<span className="sr-only"> (nouvelle fenêtre)</span>
          </Link>.
        </label>
      </div>

      <div className="flex items-start gap-3">
        <input
          id={ids.access}
          type="checkbox"
          checked={consents.immediateAccess}
          onChange={(e) => setConsents((c) => ({ ...c, immediateAccess: e.target.checked }))}
          aria-invalid={showErrors && !consents.immediateAccess ? true : undefined}
          className={boxClass}
        />
        <label htmlFor={ids.access} className={`text-sm ${textClass}`}>{IMMEDIATE_ACCESS_CONSENT}</label>
      </div>

      {missing && (
        <p id={errorId} role="alert" className={dark ? 'rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white' : 'rounded-2xl bg-red-50 px-4 py-2 text-sm font-medium text-red-700 dark:bg-red-900/30 dark:text-red-200'}>
          {!consents.acceptCgv
            ? 'Pour poursuivre, veuillez accepter les conditions générales de vente.'
            : "Pour poursuivre, veuillez confirmer votre demande d'accès immédiat au contenu."}
        </p>
      )}
    </fieldset>
  );
}
