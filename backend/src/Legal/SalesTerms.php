<?php

namespace App\Legal;

/**
 * Conditions de vente en vigueur et consentements recueillis avant un paiement.
 *
 * À chaque modification des CGV publiées (/cgv), incrémenter CGV_VERSION : la version
 * acceptée est enregistrée avec chaque paiement, ce qui permet de savoir quelles
 * conditions s'appliquent à une commande donnée.
 */
final class SalesTerms
{
    /** Version des CGV publiées (date de mise à jour de la page /cgv) */
    public const CGV_VERSION = '2026-09-28';

    /**
     * Texte de la case de renonciation au droit de rétractation (CGV, article 10.3),
     * identique à celui affiché avant le paiement et repris dans l'email de confirmation.
     * À modifier en même temps que IMMEDIATE_ACCESS_CONSENT (frontend/src/components/PurchaseConsent.tsx)
     * et l'article 10.3 de la page /cgv.
     */
    public const IMMEDIATE_ACCESS_CONSENT = 'Je demande expressément l\'accès immédiat au contenu numérique avant l\'expiration du délai de rétractation et reconnais qu\'en conséquence je perdrai mon droit de rétractation.';

    /** Métadonnées de session Stripe transportant les consentements jusqu'à l'enregistrement du paiement */
    public const META_CGV_VERSION = 'cgv_version';
    public const META_CGV_ACCEPTED_AT = 'cgv_accepted_at';
    public const META_IMMEDIATE_ACCESS_AT = 'immediate_access_consent_at';
}
