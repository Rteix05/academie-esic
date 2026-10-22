<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;

/**
 * Limite de débit des endpoints qui appellent l'API Stripe à chaque requête
 * (création de paiement, confirmation, facture) : un compte gratuit ne doit pas
 * pouvoir épuiser le quota Stripe du site en boucle.
 */
final class StripeRateLimitSubscriber implements EventSubscriberInterface
{
    private const ROUTES = [
        'api_stripe_checkout',
        'api_stripe_checkout_formation',
        'api_stripe_checkout_institut',
        'api_stripe_confirm',
        'api_stripe_confirm_event',
        'api_event_register',
        'api_payment_invoice',
    ];

    public function __construct(private readonly RateLimiterFactoryInterface $stripeCallsLimiter) {}

    public static function getSubscribedEvents(): array
    {
        // Après le routeur (32) et le firewall (8) : seules les requêtes authentifiées sont comptées
        return [KernelEvents::REQUEST => ['limit', 0]];
    }

    public function limit(RequestEvent $event): void
    {
        $request = $event->getRequest();
        if (!$event->isMainRequest() || !in_array($request->attributes->get('_route'), self::ROUTES, true)) {
            return;
        }

        if (!$this->stripeCallsLimiter->create($request->getClientIp())->consume()->isAccepted()) {
            $event->setResponse(new JsonResponse(['message' => 'Trop de demandes. Réessayez dans quelques minutes.'], 429));
        }
    }
}
