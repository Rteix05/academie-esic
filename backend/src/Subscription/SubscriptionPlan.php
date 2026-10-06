<?php

namespace App\Subscription;

/**
 * Formules d'abonnement mensuel : une par institut, donnant accès à toutes
 * les formations publiées de cet institut tant que l'abonnement est actif.
 *
 * Le prix est défini dans Stripe (prix récurrent), référencé par variable d'environnement
 * (cf. SubscriptionCatalog) : identifiants différents en mode test et en production.
 */
enum SubscriptionPlan: string
{
    case InstitutBiblique = 'institut-biblique';
    case EcoleMinistere = 'ecole-ministere';

    /** Valeur du champ Formation::institut couverte par la formule */
    public function institut(): string
    {
        return match ($this) {
            self::InstitutBiblique => 'Institut Biblique Théologique',
            self::EcoleMinistere   => 'École du Ministère et du Leadership',
        };
    }

    public function label(): string
    {
        return 'Abonnement mensuel — ' . $this->institut();
    }

    /**
     * Formule couvrant une formation. Une formation sans institut est classée
     * dans l'Institut Biblique Théologique, comme sur le catalogue (/formations).
     */
    public static function forInstitut(?string $institut): ?self
    {
        if ($institut === null || $institut === '') {
            return self::InstitutBiblique;
        }

        foreach (self::cases() as $plan) {
            if ($plan->institut() === $institut) {
                return $plan;
            }
        }

        return null;
    }
}
