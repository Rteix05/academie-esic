<?php

namespace App\Analytics;

use App\Learning\LearningPreferences;
use App\Repository\PageViewRepository;
use Doctrine\DBAL\Connection;

/**
 * Chiffres du tableau de bord du back-office : fréquentation, inscriptions et ventes sur une période,
 * comparés à la période précédente de même durée.
 */
final class SiteStatistics
{
    /** Périodes proposées (en jours) */
    public const PERIODS = [7, 30, 90, 365];

    private const DAY_NAMES = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
    private const MONTH_NAMES = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

    public function __construct(
        private readonly PageViewRepository $pageViews,
        private readonly Connection $connection,
    ) {}

    /** @return array<string, mixed> */
    public function forPeriod(int $days, ?\DateTimeImmutable $today = null): array
    {
        $days  = in_array($days, self::PERIODS, true) ? $days : 30;
        $to    = ($today ?? new \DateTimeImmutable('today'))->setTime(0, 0)->modify('+1 day');
        $from  = $to->modify("-$days days");
        $prevFrom = $from->modify("-$days days");

        $traffic     = $this->pageViews->dailyTraffic($from, $to);
        $prevTraffic = $this->pageViews->dailyTraffic($prevFrom, $from);
        $signups     = $this->dailyCount('SELECT DATE(created_at) AS day, COUNT(*) AS n FROM `user` WHERE created_at >= :from AND created_at < :to GROUP BY DATE(created_at)', $from, $to);
        $sales       = $this->sales($from, $to);
        $prevSales   = $this->sales($prevFrom, $from);

        // Une ligne par jour de la période, y compris les jours sans visite
        $daily = [];
        for ($day = $from; $day < $to; $day = $day->modify('+1 day')) {
            $key = $day->format('Y-m-d');
            $daily[] = [
                'date'     => $key,
                'label'    => self::DAY_NAMES[(int) $day->format('w')] . ' ' . $day->format('j') . ' ' . self::MONTH_NAMES[(int) $day->format('n') - 1],
                'views'    => $traffic[$key]['views'] ?? 0,
                'visitors' => $traffic[$key]['visitors'] ?? 0,
                'signups'  => $signups[$key] ?? 0,
            ];
        }

        $sum = fn (array $rows, string $field) => array_sum(array_column($rows, $field));

        return [
            'days' => $days,
            'from' => $from,
            'to'   => $to->modify('-1 day'),
            'kpis' => [
                'visitors' => ['value' => $sum($traffic, 'visitors'), 'previous' => $sum($prevTraffic, 'visitors')],
                'views'    => ['value' => $sum($traffic, 'views'), 'previous' => $sum($prevTraffic, 'views')],
                'signups'  => [
                    'value'    => array_sum($signups),
                    'previous' => array_sum($this->dailyCount('SELECT DATE(created_at) AS day, COUNT(*) AS n FROM `user` WHERE created_at >= :from AND created_at < :to GROUP BY DATE(created_at)', $prevFrom, $from)),
                ],
                'sales'    => ['value' => $sales['count'], 'previous' => $prevSales['count']],
                'revenue'  => ['value' => $sales['cents'] / 100, 'previous' => $prevSales['cents'] / 100],
            ],
            'daily'    => $daily,
            'chart'    => $chart = $this->chart($daily, $days),
            'chartMax' => max(1, ...array_column($chart, 'views')),
            'pages'    => $this->withTitles($this->pageViews->topPages($from, $to)),
            'sources'  => $this->pageViews->topSources($from, $to),
            'devices'  => $this->pageViews->devices($from, $to),
            'products' => $this->salesByProduct($from, $to),
            'learners' => $this->learnerInterests(),
        ];
    }

    /**
     * Réponses au parcours guidé de tous les élèves (hors période) : domaines et objectifs les plus demandés.
     *
     * @return array{answered: int, interests: array<string, int>, goals: array<string, int>}
     */
    public function learnerInterests(): array
    {
        $rows = $this->connection->fetchAllAssociative('SELECT interests, learning_goal FROM `user` WHERE onboarded_at IS NOT NULL');

        $interests = array_fill_keys(LearningPreferences::INTERESTS, 0);
        $goals     = array_fill_keys(array_values(LearningPreferences::GOALS), 0);
        $answered  = 0;
        foreach ($rows as $row) {
            $list = json_decode((string) $row['interests'], true);
            $goal = LearningPreferences::GOALS[$row['learning_goal'] ?? ''] ?? null;
            if (!$list && $goal === null) {
                continue; // parcours passé sans répondre
            }
            ++$answered;
            foreach (is_array($list) ? $list : [] as $interest) {
                if (isset($interests[$interest])) {
                    ++$interests[$interest];
                }
            }
            if ($goal !== null) {
                ++$goals[$goal];
            }
        }
        arsort($interests);
        arsort($goals);

        return ['answered' => $answered, 'interests' => array_filter($interests), 'goals' => array_filter($goals)];
    }

    /**
     * Barres du graphique : par jour jusqu'à un mois, par semaine sur 90 jours, par mois sur un an.
     *
     * @param list<array{date: string, label: string, views: int, visitors: int, signups: int}> $daily
     * @return list<array{label: string, views: int, visitors: int, signups: int}>
     */
    private function chart(array $daily, int $days): array
    {
        if ($days <= 31) {
            return array_map(fn (array $d) => array_diff_key($d, ['date' => true]), $daily);
        }

        $buckets = [];
        foreach ($daily as $d) {
            $date = new \DateTimeImmutable($d['date']);
            if ($days <= 90) {
                $monday = $date->modify('monday this week');
                $key    = $monday->format('Y-m-d');
                $label  = 'sem. du ' . $monday->format('j') . ' ' . self::MONTH_NAMES[(int) $monday->format('n') - 1];
            } else {
                $key   = $date->format('Y-m');
                $label = self::MONTH_NAMES[(int) $date->format('n') - 1] . ' ' . $date->format('Y');
            }
            $buckets[$key] ??= ['label' => $label, 'views' => 0, 'visitors' => 0, 'signups' => 0];
            $buckets[$key]['views']    += $d['views'];
            $buckets[$key]['visitors'] += $d['visitors'];
            $buckets[$key]['signups']  += $d['signups'];
        }

        return array_values($buckets);
    }

    /** Pages du site nommées en clair dans le tableau de bord */
    private const PAGE_TITLES = [
        '/'                => 'Accueil',
        '/formations'      => 'Formations (catalogue)',
        '/masterclass'     => 'Masterclasses (catalogue)',
        '/histoire'        => 'Notre histoire',
        '/how-it-works'    => 'Comment ça marche',
        '/actualites'      => 'Actualités',
        '/contact'         => 'Contact',
        '/register'        => 'Inscription',
        '/login'           => 'Connexion',
        '/dashboard'       => 'Espace élève',
        '/dashboard/profil' => 'Espace élève : profil',
    ];

    /**
     * Ajoute un titre lisible à chaque page (titre de la formation ou de la masterclass pour les fiches).
     *
     * @param list<array{path: string, views: int, visitors: int}> $pages
     * @return list<array{path: string, title: string, views: int, visitors: int}>
     */
    private function withTitles(array $pages): array
    {
        $ids = ['formation' => [], 'masterclass' => []];
        foreach ($pages as $page) {
            if (preg_match('#^/(formations|masterclass)/(\d+)$#', $page['path'], $m)) {
                $ids[$m[1] === 'formations' ? 'formation' : 'masterclass'][] = (int) $m[2];
            }
        }

        $titles = [];
        foreach ($ids as $table => $list) {
            if ($list) {
                $rows = $this->connection->fetchAllKeyValue(
                    "SELECT id, title FROM $table WHERE id IN (?)",
                    [$list],
                    [\Doctrine\DBAL\ArrayParameterType::INTEGER],
                );
                foreach ($rows as $id => $title) {
                    $titles[($table === 'formation' ? '/formations/' : '/masterclass/') . $id] = ($table === 'formation' ? 'Formation : ' : 'Masterclass : ') . $title;
                }
            }
        }

        return array_map(fn (array $p) => $p + ['title' => $titles[$p['path']] ?? self::PAGE_TITLES[$p['path']] ?? $p['path']], $pages);
    }

    /** @return array<string, int> */
    private function dailyCount(string $sql, \DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        $counts = [];
        foreach ($this->connection->fetchAllAssociative($sql, $this->range($from, $to)) as $row) {
            $counts[substr((string) $row['day'], 0, 10)] = (int) $row['n'];
        }

        return $counts;
    }

    /** @return array{count: int, cents: int} */
    private function sales(\DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        $row = $this->connection->fetchAssociative(
            'SELECT COUNT(*) AS n, COALESCE(SUM(amount_cents), 0) AS cents FROM payment WHERE created_at >= :from AND created_at < :to',
            $this->range($from, $to),
        );

        return ['count' => (int) ($row['n'] ?? 0), 'cents' => (int) ($row['cents'] ?? 0)];
    }

    /** @return list<array{label: string, count: int, amount: float}> */
    private function salesByProduct(\DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        $rows = $this->connection->fetchAllAssociative(
            'SELECT label, COUNT(*) AS n, SUM(amount_cents) AS cents FROM payment
              WHERE created_at >= :from AND created_at < :to GROUP BY label ORDER BY cents DESC, n DESC LIMIT 8',
            $this->range($from, $to),
        );

        return array_map(fn (array $r) => ['label' => (string) $r['label'], 'count' => (int) $r['n'], 'amount' => (int) $r['cents'] / 100], $rows);
    }

    /** @return array{from: string, to: string} */
    private function range(\DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        return ['from' => $from->format('Y-m-d H:i:s'), 'to' => $to->format('Y-m-d H:i:s')];
    }
}
