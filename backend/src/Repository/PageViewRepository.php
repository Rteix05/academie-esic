<?php

namespace App\Repository;

use App\Entity\PageView;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Agrégats de fréquentation pour le tableau de bord du back-office.
 *
 * L'empreinte d'un visiteur change chaque jour : un « visiteur » est donc compté une fois par jour,
 * et le total d'une période est la somme des visiteurs de chaque jour.
 *
 * @extends ServiceEntityRepository<PageView>
 */
class PageViewRepository extends ServiceEntityRepository
{
    private const FORMAT = 'Y-m-d H:i:s';

    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PageView::class);
    }

    /**
     * Pages vues et visiteurs pour chaque jour de la période (jours sans visite absents).
     *
     * @return array<string, array{views: int, visitors: int}> clé = date « Y-m-d »
     */
    public function dailyTraffic(\DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        $rows = $this->getEntityManager()->getConnection()->fetchAllAssociative(
            'SELECT DATE(viewed_at) AS day, COUNT(*) AS views, COUNT(DISTINCT visitor_hash) AS visitors
               FROM page_view WHERE viewed_at >= :from AND viewed_at < :to
              GROUP BY DATE(viewed_at)',
            $this->range($from, $to),
        );

        $days = [];
        foreach ($rows as $row) {
            $days[substr((string) $row['day'], 0, 10)] = ['views' => (int) $row['views'], 'visitors' => (int) $row['visitors']];
        }

        return $days;
    }

    /** @return list<array{path: string, views: int, visitors: int}> */
    public function topPages(\DateTimeImmutable $from, \DateTimeImmutable $to, int $limit = 10): array
    {
        $rows = $this->getEntityManager()->getConnection()->fetchAllAssociative(
            'SELECT path, COUNT(*) AS views, COUNT(DISTINCT DATE(viewed_at), visitor_hash) AS visitors
               FROM page_view WHERE viewed_at >= :from AND viewed_at < :to
              GROUP BY path ORDER BY views DESC, path ASC LIMIT ' . max(1, $limit),
            $this->range($from, $to),
        );

        return array_map(fn (array $r) => ['path' => (string) $r['path'], 'views' => (int) $r['views'], 'visitors' => (int) $r['visitors']], $rows);
    }

    /**
     * Provenance des visites : site d'où arrive le visiteur, relevé à son arrivée sur le site.
     *
     * @return list<array{source: ?string, visits: int}> source null = accès direct
     */
    public function topSources(\DateTimeImmutable $from, \DateTimeImmutable $to, int $limit = 8): array
    {
        $rows = $this->getEntityManager()->getConnection()->fetchAllAssociative(
            'SELECT referrer_host AS source, COUNT(*) AS visits
               FROM page_view WHERE viewed_at >= :from AND viewed_at < :to AND entry = 1
              GROUP BY referrer_host ORDER BY visits DESC LIMIT ' . max(1, $limit),
            $this->range($from, $to),
        );

        return array_map(fn (array $r) => ['source' => $r['source'] !== null ? (string) $r['source'] : null, 'visits' => (int) $r['visits']], $rows);
    }

    /** @return array<string, int> appareil → visiteurs */
    public function devices(\DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        $rows = $this->getEntityManager()->getConnection()->fetchAllAssociative(
            'SELECT device, COUNT(DISTINCT DATE(viewed_at), visitor_hash) AS visitors
               FROM page_view WHERE viewed_at >= :from AND viewed_at < :to
              GROUP BY device ORDER BY visitors DESC',
            $this->range($from, $to),
        );

        $devices = [];
        foreach ($rows as $row) {
            $devices[(string) $row['device']] = (int) $row['visitors'];
        }

        return $devices;
    }

    /** Suppression des mesures anciennes (durée de conservation limitée) */
    public function purgeBefore(\DateTimeImmutable $limit): int
    {
        return (int) $this->getEntityManager()->getConnection()->executeStatement(
            'DELETE FROM page_view WHERE viewed_at < :limit',
            ['limit' => $limit->format(self::FORMAT)],
        );
    }

    /** @return array{from: string, to: string} */
    private function range(\DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        return ['from' => $from->format(self::FORMAT), 'to' => $to->format(self::FORMAT)];
    }
}
