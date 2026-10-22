<?php

namespace App\Doctrine;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Extension\QueryItemExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Event;
use App\Entity\Formation;
use Doctrine\ORM\QueryBuilder;

/**
 * Catalogue public (API Platform) : les brouillons (non publiés) ne sont ni listés
 * ni accessibles par leur identifiant — 404 comme pour un contenu inexistant.
 */
final class PublishedOnlyExtension implements QueryCollectionExtensionInterface, QueryItemExtensionInterface
{
    private const PUBLISHABLE = [Formation::class, Event::class];

    public function applyToCollection(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, ?Operation $operation = null, array $context = []): void
    {
        $this->onlyPublished($queryBuilder, $resourceClass);
    }

    public function applyToItem(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, array $identifiers, ?Operation $operation = null, array $context = []): void
    {
        $this->onlyPublished($queryBuilder, $resourceClass);
    }

    private function onlyPublished(QueryBuilder $queryBuilder, string $resourceClass): void
    {
        if (!in_array($resourceClass, self::PUBLISHABLE, true)) {
            return;
        }

        $alias = $queryBuilder->getRootAliases()[0];
        $queryBuilder->andWhere(sprintf('%s.isPublished = true', $alias));
    }
}
