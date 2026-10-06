<?php

namespace App\Repository;

use App\Entity\Subscription;
use App\Entity\User;
use App\Subscription\SubscriptionPlan;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Subscription>
 */
class SubscriptionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Subscription::class);
    }

    /** @return Subscription[] les plus récents d'abord */
    public function findForUser(User $user): array
    {
        return $this->findBy(['user' => $user], ['createdAt' => 'DESC', 'id' => 'DESC']);
    }

    /** @return SubscriptionPlan[] formules donnant actuellement accès au contenu */
    public function activePlansFor(User $user): array
    {
        $plans = [];
        foreach ($this->findBy(['user' => $user, 'status' => Subscription::ACCESS_STATUSES]) as $subscription) {
            $plans[$subscription->getPlan()->value] = $subscription->getPlan();
        }

        return array_values($plans);
    }

    public function findActive(User $user, SubscriptionPlan $plan): ?Subscription
    {
        return $this->findOneBy(['user' => $user, 'plan' => $plan, 'status' => Subscription::ACCESS_STATUSES]);
    }

    /** Client Stripe déjà associé à l'élève (réutilisé pour un nouvel abonnement) */
    public function findCustomerId(User $user): ?string
    {
        return $this->findOneBy(['user' => $user], ['createdAt' => 'DESC'])?->getStripeCustomerId();
    }
}
