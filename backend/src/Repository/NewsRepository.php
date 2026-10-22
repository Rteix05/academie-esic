<?php

namespace App\Repository;

use App\Entity\News;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<News>
 */
class NewsRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, News::class);
    }

    /**
     * Actualités visibles sur le site : publiées et dont la date de parution est atteinte.
     *
     * @return News[] les plus récentes d'abord
     */
    public function findVisible(?int $limit = null): array
    {
        return $this->createQueryBuilder('n')
            ->andWhere('n.isPublished = true')
            ->andWhere('n.publishedAt <= :now')
            ->setParameter('now', new \DateTimeImmutable())
            ->orderBy('n.publishedAt', 'DESC')
            ->addOrderBy('n.id', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
