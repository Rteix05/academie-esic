<?php

namespace App\Repository;

use App\Entity\InstitutAccess;
use App\Entity\User;
use App\Institut\InstitutPack;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<InstitutAccess>
 */
class InstitutAccessRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, InstitutAccess::class);
    }

    /** @return InstitutAccess[] les plus récents d'abord */
    public function findForUser(User $user): array
    {
        return $this->findBy(['user' => $user], ['createdAt' => 'DESC', 'id' => 'DESC']);
    }

    /** @return InstitutPack[] instituts dont l'élève a acheté l'accès complet */
    public function packsOwnedBy(User $user): array
    {
        return array_map(fn (InstitutAccess $access) => $access->getPack(), $this->findBy(['user' => $user]));
    }

    public function findOwned(User $user, InstitutPack $pack): ?InstitutAccess
    {
        return $this->findOneBy(['user' => $user, 'pack' => $pack]);
    }
}
