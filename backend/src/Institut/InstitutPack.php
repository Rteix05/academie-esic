<?php

namespace App\Institut;

/**
 * Accès complet à un institut : achat unique donnant accès à vie à toutes les formations
 * publiées de cet institut, y compris celles publiées après l'achat.
 *
 * Le prix est défini dans Stripe (prix ponctuel), référencé par variable d'environnement
 * (cf. InstitutCatalog) : identifiants différents en mode test et en production.
 */
enum InstitutPack: string
{
    case InstitutBiblique = 'institut-biblique';
    case EcoleMinistere = 'ecole-ministere';

    /** Métadonnée de la session Stripe portant l'accès acheté */
    public const META = 'institut_pack';

    /** Valeur du champ Formation::institut couverte par l'accès */
    public function institut(): string
    {
        return match ($this) {
            self::InstitutBiblique => 'Institut Biblique Théologique',
            self::EcoleMinistere   => 'École du Ministère et du Leadership',
        };
    }

    /** Identifiant stable du produit, enregistré dans Payment::productId */
    public function productId(): int
    {
        return match ($this) {
            self::InstitutBiblique => 1,
            self::EcoleMinistere   => 2,
        };
    }

    public function label(): string
    {
        return 'Accès complet — ' . $this->institut();
    }

    /**
     * Accès couvrant une formation. Une formation sans institut est classée
     * dans l'Institut Biblique Théologique, comme sur le catalogue (/formations).
     */
    public static function forInstitut(?string $institut): ?self
    {
        if ($institut === null || $institut === '') {
            return self::InstitutBiblique;
        }

        foreach (self::cases() as $pack) {
            if ($pack->institut() === $institut) {
                return $pack;
            }
        }

        return null;
    }
}
