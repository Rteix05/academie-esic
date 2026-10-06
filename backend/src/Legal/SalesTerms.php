<?php

namespace App\Legal;

use Symfony\Component\HttpFoundation\Request;

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
    public const CGV_VERSION = '2026-10-06';

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

    /**
     * Consentements obligatoires avant tout paiement, vérifiés côté serveur
     * (une case cochée côté navigateur ne suffit pas) : corps JSON {acceptCgv: true, immediateAccess: true}.
     *
     * @return list<string> consentements manquants (vide si tout est accepté)
     */
    public static function missingConsents(Request $request): array
    {
        $body = json_decode($request->getContent() ?: '{}', true);

        return array_values(array_filter(
            ['acceptCgv', 'immediateAccess'],
            fn (string $key) => !is_array($body) || ($body[$key] ?? null) !== true,
        ));
    }

    /**
     * @param list<string> $missing
     * @return array{message: string, missing: list<string>}
     */
    public static function missingConsentsResponse(array $missing): array
    {
        return [
            'message' => in_array('acceptCgv', $missing, true)
                ? 'Veuillez accepter les conditions générales de vente pour poursuivre.'
                : 'Veuillez confirmer votre demande d\'accès immédiat au contenu pour poursuivre.',
            'missing' => $missing,
        ];
    }

    /**
     * Métadonnées Stripe transportant les consentements donnés à l'instant.
     *
     * @return array<string, string>
     */
    public static function consentMetadata(): array
    {
        $consentedAt = (new \DateTimeImmutable())->format(\DateTimeInterface::ATOM);

        return [
            self::META_CGV_VERSION         => self::CGV_VERSION,
            self::META_CGV_ACCEPTED_AT     => $consentedAt,
            self::META_IMMEDIATE_ACCESS_AT => $consentedAt,
        ];
    }

    /**
     * Consentements lus dans les métadonnées Stripe de la session.
     *
     * @param array<string, mixed> $metadata
     * @return array{version: string, acceptedAt: \DateTimeImmutable, immediateAccessAt: ?\DateTimeImmutable}|null null si absents
     */
    public static function consentsFromMetadata(array $metadata): ?array
    {
        $version = $metadata[self::META_CGV_VERSION] ?? null;
        $acceptedAt = self::parseDate($metadata[self::META_CGV_ACCEPTED_AT] ?? null);

        if (!is_string($version) || $version === '' || !$acceptedAt) {
            return null;
        }

        return [
            'version'           => $version,
            'acceptedAt'        => $acceptedAt,
            'immediateAccessAt' => self::parseDate($metadata[self::META_IMMEDIATE_ACCESS_AT] ?? null),
        ];
    }

    private static function parseDate(mixed $value): ?\DateTimeImmutable
    {
        if (!is_string($value) || $value === '') {
            return null;
        }

        return \DateTimeImmutable::createFromFormat(\DateTimeInterface::ATOM, $value) ?: null;
    }
}
