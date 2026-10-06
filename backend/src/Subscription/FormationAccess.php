<?php

namespace App\Subscription;

use App\Entity\Formation;
use App\Entity\User;
use App\Repository\FormationRepository;
use App\Repository\SubscriptionRepository;

/**
 * Droit d'accès au contenu d'une formation : formation acquise (achat ou inscription gratuite)
 * ou abonnement actif à la formule de son institut.
 */
class FormationAccess
{
    public function __construct(
        private readonly SubscriptionRepository $subscriptions,
        private readonly FormationRepository $formations,
    ) {}

    public function canAccess(User $user, Formation $formation): bool
    {
        return $user->getFormations()->contains($formation) || $this->coveredBySubscription($user, $formation);
    }

    /** Formation publiée incluse dans un abonnement actif de l'élève */
    public function coveredBySubscription(User $user, Formation $formation): bool
    {
        $plan = SubscriptionPlan::forInstitut($formation->getInstitut());

        return $plan !== null
            && $formation->isPublished()
            && in_array($plan, $this->subscriptions->activePlansFor($user), true);
    }

    /**
     * Formations accessibles, avec leur origine : 'achat' (acquise) ou 'abonnement'.
     *
     * @return list<array{formation: Formation, access: string}>
     */
    public function accessibleFormations(User $user): array
    {
        $result = [];
        foreach ($user->getFormations() as $formation) {
            $result[$formation->getId()] = ['formation' => $formation, 'access' => 'achat'];
        }

        $plans = $this->subscriptions->activePlansFor($user);
        if ($plans) {
            foreach ($this->formations->findBy(['isPublished' => true], ['id' => 'ASC']) as $formation) {
                if (!isset($result[$formation->getId()]) && in_array(SubscriptionPlan::forInstitut($formation->getInstitut()), $plans, true)) {
                    $result[$formation->getId()] = ['formation' => $formation, 'access' => 'abonnement'];
                }
            }
        }

        return array_values($result);
    }
}
