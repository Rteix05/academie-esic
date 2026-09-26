<?php

namespace App\Repository;

use App\Entity\Event;
use App\Entity\EventRegistration;
use App\Entity\RegistrationStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class EventRegistrationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EventRegistration::class);
    }

    /**
     * Nombre de places occupées : inscriptions confirmées (free/paid)
     * + réservations "pending" encore dans leur délai de paiement.
     */
    public function countOccupiedSeats(Event $event, ?EventRegistration $exclude = null): int
    {
        $qb = $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.event = :event')
            ->andWhere('(r.status != :pending OR r.registeredAt >= :pendingLimit)')
            ->setParameter('event', $event)
            ->setParameter('pending', RegistrationStatus::Pending->value)
            ->setParameter('pendingLimit', new \DateTimeImmutable('-' . EventRegistration::PENDING_TTL));

        if ($exclude?->getId()) {
            $qb->andWhere('r.id != :exclude')->setParameter('exclude', $exclude->getId());
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }
}
