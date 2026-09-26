<?php

namespace App\EventSubscriber;

use App\Security\CookieJwtAuthenticator;
use App\Security\JwtCookie;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Protections liées à l'authentification par cookie sur /api :
 *
 * 1. Anti-CSRF : un cookie est envoyé automatiquement par le navigateur, même depuis
 *    un site tiers. Toute requête modifiante (POST/PUT/PATCH/DELETE) portant le cookie
 *    doit donc provenir de l'origine du frontend (en-tête Origin, envoyé par tous les
 *    navigateurs modernes sur les requêtes cross-origin et les POST).
 * 2. Nettoyage : un cookie JWT expiré ou invalidé est supprimé du navigateur.
 */
final class ApiCookieSecuritySubscriber implements EventSubscriberInterface
{
    private const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

    public function __construct(
        #[Autowire('%env(FRONTEND_URL)%')] private readonly string $frontendUrl,
        #[Autowire('%env(default::BACKEND_URL)%')] private readonly ?string $backendUrl,
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [
            // Avant le firewall (priorité 8) : on bloque avant toute authentification
            KernelEvents::REQUEST  => ['checkOrigin', 16],
            KernelEvents::RESPONSE => 'clearInvalidCookie',
        ];
    }

    public function checkOrigin(RequestEvent $event): void
    {
        $request = $event->getRequest();

        if (!$event->isMainRequest()
            || !str_starts_with($request->getPathInfo(), '/api/')
            || in_array($request->getMethod(), self::SAFE_METHODS, true)
            || !$request->cookies->has(JwtCookie::NAME)
        ) {
            return;
        }

        $origin = $request->headers->get('Origin') ?? $this->originFromReferer($request->headers->get('Referer'));

        if ($origin === null || !in_array(rtrim($origin, '/'), $this->allowedOrigins(), true)) {
            $event->setResponse(new JsonResponse(['message' => 'Origine de la requête non autorisée.'], 403));
        }
    }

    public function clearInvalidCookie(ResponseEvent $event): void
    {
        if ($event->getRequest()->attributes->get(CookieJwtAuthenticator::CLEAR_COOKIE_ATTRIBUTE)) {
            $event->getResponse()->headers->clearCookie(JwtCookie::NAME, '/');
        }
    }

    /** @return string[] */
    private function allowedOrigins(): array
    {
        return array_map(fn (string $url) => rtrim($url, '/'), array_filter([$this->frontendUrl, $this->backendUrl]));
    }

    private function originFromReferer(?string $referer): ?string
    {
        if (!$referer) {
            return null;
        }

        $parts = parse_url($referer);
        if (!isset($parts['scheme'], $parts['host'])) {
            return null;
        }

        return $parts['scheme'] . '://' . $parts['host'] . (isset($parts['port']) ? ':' . $parts['port'] : '');
    }
}
