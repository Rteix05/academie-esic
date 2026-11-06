<?php

namespace App\Analytics;

use App\Entity\PageView;
use App\Repository\PageViewRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Enregistre une page vue du site public, sans cookie ni donnée personnelle.
 *
 * Mesure d'audience conforme aux conditions d'exemption de consentement de la CNIL :
 * usage interne uniquement, aucun recoupement avec d'autres traitements, IP jamais stockée,
 * empreinte de visiteur renouvelée chaque jour, conservation limitée à 13 mois.
 */
final class PageViewRecorder
{
    /** Durée de conservation des mesures (recommandation CNIL : 13 mois maximum) */
    public const RETENTION = '-13 months';

    private const BOT_PATTERN = '/bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pagespeed|curl|wget|python|java\/|go-http|monitor|uptime|scan/i';
    private const PATH_PATTERN = '#^/[A-Za-z0-9\-._~/%]*$#';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly PageViewRepository $pageViews,
        #[Autowire('%kernel.secret%')] private readonly string $secret,
        #[Autowire('%env(FRONTEND_URL)%')] private readonly string $frontendUrl,
    ) {}

    /**
     * @return bool false si la requête est ignorée (robot, chemin invalide)
     */
    public function record(string $path, ?string $referrer, bool $entry, ?string $ip, ?string $userAgent): bool
    {
        $userAgent = (string) $userAgent;
        if ($userAgent === '' || preg_match(self::BOT_PATTERN, $userAgent)) {
            return false;
        }

        $path = $this->normalizePath($path);
        if ($path === null) {
            return false;
        }

        $this->em->persist(new PageView(
            $path,
            $this->visitorHash((string) $ip, $userAgent),
            $entry ? $this->externalHost($referrer) : null,
            self::device($userAgent),
            $entry,
        ));
        $this->em->flush();

        // Purge occasionnelle des mesures trop anciennes, sans tâche planifiée à configurer
        if (random_int(1, 200) === 1) {
            $this->pageViews->purgeBefore(new \DateTimeImmutable(self::RETENTION));
        }

        return true;
    }

    public static function device(string $userAgent): string
    {
        if (preg_match('/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i', $userAgent)) {
            return PageView::DEVICE_TABLET;
        }

        return preg_match('/Mobi|iPhone|iPod|Android|Windows Phone/i', $userAgent)
            ? PageView::DEVICE_MOBILE
            : PageView::DEVICE_DESKTOP;
    }

    /** Chemin seul (sans paramètres ni ancre), sans barre finale */
    private function normalizePath(string $path): ?string
    {
        $path = (string) parse_url(trim($path), PHP_URL_PATH);
        if ($path === '' || !preg_match(self::PATH_PATTERN, $path)) {
            return null;
        }

        $path = $path === '/' ? '/' : rtrim($path, '/');

        return mb_substr($path, 0, 255);
    }

    /**
     * Empreinte non réversible : IP + navigateur + date du jour, signés avec le secret de l'application.
     * Le même visiteur obtient une empreinte différente chaque jour.
     */
    private function visitorHash(string $ip, string $userAgent): string
    {
        return substr(hash_hmac('sha256', date('Y-m-d') . '|' . $ip . '|' . $userAgent, $this->secret . '|page-view'), 0, 16);
    }

    /** Nom de domaine du site d'origine, ou null pour un accès direct ou depuis le site lui-même */
    private function externalHost(?string $referrer): ?string
    {
        $host = $referrer ? parse_url($referrer, PHP_URL_HOST) : null;
        if (!is_string($host) || $host === '') {
            return null;
        }

        $host = preg_replace('/^www\./', '', mb_strtolower($host));
        $ownHost = preg_replace('/^www\./', '', mb_strtolower((string) parse_url($this->frontendUrl, PHP_URL_HOST)));

        return $host === $ownHost ? null : mb_substr($host, 0, 100);
    }
}
