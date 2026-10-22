<?php

namespace App\Repository;

use App\Entity\ContactMessage;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ContactMessage>
 */
class ContactMessageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ContactMessage::class);
    }

    /** Messages en attente de réponse (pastille du menu de l'admin) */
    public function countUnhandled(): int
    {
        return $this->count(['isHandled' => false]);
    }
}
