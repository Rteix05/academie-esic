<?php

namespace App\Controller;

use App\Entity\ProductType;
use App\Entity\User;
use App\Payment\FulfillmentResult;
use App\Payment\PurchaseFulfiller;
use App\Stripe\StripeGateway;
use App\Subscription\SubscriptionManager;
use Psr\Log\LoggerInterface;
use Stripe\Checkout\Session;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Confirmation d'un paiement au retour de Stripe (appelée par PaymentSuccessPopup).
 * Le webhook reste la source de vérité ; ces endpoints permettent un affichage
 * immédiat et sont idempotents avec lui (cf. PurchaseFulfiller).
 */
class StripeConfirmController extends AbstractController
{
    public function __construct(
        private readonly StripeGateway $stripe,
        private readonly PurchaseFulfiller $fulfiller,
        private readonly SubscriptionManager $subscriptions,
        private readonly LoggerInterface $logger,
    ) {}

    /** Formations, masterclasses et abonnements */
    #[Route('/api/stripe/confirm', name: 'api_stripe_confirm', methods: ['POST'])]
    public function confirm(Request $request): JsonResponse
    {
        return $this->handle($request, [ProductType::Formation, ProductType::Masterclass, ProductType::Subscription]);
    }

    /** Événements payants */
    #[Route('/api/stripe/confirm/event', name: 'api_stripe_confirm_event', methods: ['POST'])]
    public function confirmEvent(Request $request): JsonResponse
    {
        return $this->handle($request, [ProductType::Event]);
    }

    /**
     * @param ProductType[] $acceptedTypes
     */
    private function handle(Request $request, array $acceptedTypes): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        $body      = json_decode($request->getContent() ?: '{}', true);
        $sessionId = is_array($body) ? ($body['session_id'] ?? null) : null;
        if (!is_string($sessionId) || $sessionId === '') {
            return $this->json(['message' => 'session_id manquant.'], 400);
        }

        if (!$this->stripe->isConfigured()) {
            return $this->json(['message' => 'Le paiement en ligne est momentanément indisponible.'], 503);
        }

        try {
            $session = $this->stripe->retrieveCheckoutSession($sessionId);
        } catch (\Throwable $e) {
            $this->logger->warning('Stripe confirm : session introuvable', ['session_id' => $sessionId, 'error' => $e->getMessage()]);

            return $this->json(['message' => 'Session de paiement invalide.'], 400);
        }

        // La session doit appartenir à l'utilisateur connecté : empêche de rejouer
        // le session_id d'un autre compte pour débloquer du contenu.
        $owner = $session->metadata['user_email'] ?? null;
        if (!is_string($owner) || strcasecmp($owner, $user->getUserIdentifier()) !== 0) {
            return $this->json(['message' => 'Cette session de paiement ne vous appartient pas.'], 403);
        }

        // Le front essaie /confirm puis /confirm/event : on refuse les types non gérés ici
        if (!in_array($this->typeOf($session), $acceptedTypes, true)) {
            return $this->json(['message' => 'Type d\'achat non géré par cet endpoint.'], 400);
        }

        try {
            $result = ($session->mode ?? null) === 'subscription'
                ? $this->subscriptions->fulfillCheckout($session)
                : $this->fulfiller->fulfill($session);
        } catch (\Throwable $e) {
            $this->logger->error('Stripe confirm : abonnement illisible', ['session_id' => $sessionId, 'error' => $e->getMessage()]);

            return $this->json(['message' => 'Confirmation momentanément impossible : votre accès sera activé sous peu.'], 503);
        }

        return match ($result->status) {
            FulfillmentResult::GRANTED, FulfillmentResult::ALREADY => $this->json([
                'success'     => true,
                'productType' => $result->productType?->value,
                'productId'   => $result->productId,
            ]),
            FulfillmentResult::NOT_PAID => $this->json(['message' => 'Paiement non complété.'], 402),
            default                     => $this->json(['message' => $result->reason ?? 'Achat introuvable.'], 404),
        };
    }

    private function typeOf(Session $session): ?ProductType
    {
        $metadata = $session->metadata ? $session->metadata->toArray() : [];

        return match (true) {
            !empty($metadata['event_id'])       => ProductType::Event,
            !empty($metadata['formation_id'])   => ProductType::Formation,
            !empty($metadata['masterclass_id']) => ProductType::Masterclass,
            !empty($metadata[SubscriptionManager::META_PLAN]) => ProductType::Subscription,
            default                             => null,
        };
    }
}
