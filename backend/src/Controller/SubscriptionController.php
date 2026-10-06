<?php

namespace App\Controller;

use App\Entity\Subscription;
use App\Entity\User;
use App\Legal\SalesTerms;
use App\Repository\SubscriptionRepository;
use App\Stripe\StripeGateway;
use App\Subscription\SubscriptionCatalog;
use App\Subscription\SubscriptionManager;
use App\Subscription\SubscriptionPlan;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Abonnements mensuels par institut : offres, souscription (Stripe Checkout en mode abonnement),
 * abonnements de l'élève et portail Stripe de gestion (moyen de paiement, factures, résiliation).
 *
 * L'abonnement est enregistré ensuite par SubscriptionManager (webhook / confirmation).
 */
class SubscriptionController extends AbstractController
{
    public function __construct(
        private readonly StripeGateway $stripe,
        private readonly SubscriptionCatalog $catalog,
        private readonly SubscriptionRepository $subscriptions,
        private readonly LoggerInterface $logger,
        #[Autowire('%env(FRONTEND_URL)%')] private readonly string $frontendUrl,
    ) {}

    /** Offres disponibles (public) : seules les formules configurées dans Stripe sont listées */
    #[Route('/api/subscription-plans', name: 'api_subscription_plans', methods: ['GET'])]
    public function plans(): JsonResponse
    {
        return $this->json(array_values(array_filter(array_map(
            fn (SubscriptionPlan $plan) => $this->catalog->offer($plan),
            SubscriptionPlan::cases(),
        ))));
    }

    #[Route('/api/stripe/checkout/subscription/{plan}', name: 'api_stripe_checkout_subscription', methods: ['POST'])]
    public function checkout(string $plan, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Veuillez vous connecter.'], 401);
        }

        $subscriptionPlan = SubscriptionPlan::tryFrom($plan);
        if (!$subscriptionPlan) {
            return $this->json(['message' => 'Formule d\'abonnement inconnue.'], 404);
        }

        if ($this->subscriptions->findActive($user, $subscriptionPlan)) {
            return $this->json(['message' => 'Vous êtes déjà abonné à cette formule.'], 409);
        }

        $missing = SalesTerms::missingConsents($request);
        if ($missing) {
            return $this->json(SalesTerms::missingConsentsResponse($missing), 422);
        }

        $priceId = $this->catalog->priceId($subscriptionPlan);
        if (!$priceId || !$this->catalog->offer($subscriptionPlan)) {
            return $this->json(['message' => 'L\'abonnement en ligne est momentanément indisponible.'], 503);
        }

        // Recopiées sur l'abonnement : SubscriptionManager le rattache à l'élève, même si
        // les webhooks d'abonnement arrivent avant celui de la session
        $metadata = [
            'user_email'                     => $user->getUserIdentifier(),
            SubscriptionManager::META_PLAN   => $subscriptionPlan->value,
        ] + SalesTerms::consentMetadata();

        // Client Stripe existant réutilisé : un seul espace de gestion pour tous ses abonnements
        $customerId = $this->subscriptions->findCustomerId($user);

        try {
            $session = $this->stripe->createCheckoutSession([
                'mode'              => 'subscription',
                'line_items'        => [['price' => $priceId, 'quantity' => 1]],
                ...($customerId ? ['customer' => $customerId] : ['customer_email' => $user->getUserIdentifier()]),
                'metadata'          => $metadata,
                'subscription_data' => ['metadata' => $metadata],
                'success_url'       => $this->frontendUrl . '/dashboard?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url'        => $this->frontendUrl . '/formations?canceled=true',
            ]);
        } catch (\Throwable $e) {
            $this->logger->error('Stripe : création de session d\'abonnement impossible', ['plan' => $plan, 'error' => $e->getMessage()]);

            return $this->json(['message' => 'Impossible d\'initialiser le paiement. Réessayez dans quelques instants.'], 502);
        }

        return $this->json(['url' => $session->url]);
    }

    #[Route('/api/mes-abonnements', name: 'api_mes_abonnements', methods: ['GET'])]
    public function mine(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        // Abonnements jamais activés (paiement initial abandonné) : sans intérêt pour l'élève
        $visible = array_filter(
            $this->subscriptions->findForUser($user),
            fn (Subscription $s) => !in_array($s->getStatus(), ['incomplete', 'incomplete_expired'], true),
        );

        return $this->json(array_values(array_map(fn (Subscription $s) => [
            'id'               => $s->getId(),
            'plan'             => $s->getPlan()->value,
            'institut'         => $s->getPlan()->institut(),
            'label'            => $s->getPlan()->label(),
            'status'           => $s->getStatus(),
            'active'           => $s->grantsAccess(),
            'currentPeriodEnd' => $s->getCurrentPeriodEnd()?->format(\DateTimeInterface::ATOM),
            'cancelAt'         => $s->getCancelAt()?->format(\DateTimeInterface::ATOM),
            'endedAt'          => $s->getEndedAt()?->format(\DateTimeInterface::ATOM),
        ], $visible)));
    }

    /** Ouvre le portail client Stripe (gestion du moyen de paiement, factures, résiliation) */
    #[Route('/api/stripe/portal', name: 'api_stripe_portal', methods: ['POST'])]
    public function portal(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        $customerId = $this->subscriptions->findCustomerId($user);
        if (!$customerId) {
            return $this->json(['message' => 'Aucun abonnement associé à votre compte.'], 404);
        }

        if (!$this->stripe->isConfigured()) {
            return $this->json(['message' => 'La gestion de l\'abonnement est momentanément indisponible.'], 503);
        }

        try {
            $session = $this->stripe->createBillingPortalSession($customerId, $this->frontendUrl . '/dashboard');
        } catch (\Throwable $e) {
            $this->logger->error('Stripe : ouverture du portail client impossible', ['customer' => $customerId, 'error' => $e->getMessage()]);

            return $this->json(['message' => 'Impossible d\'ouvrir la gestion de l\'abonnement. Réessayez dans quelques instants.'], 502);
        }

        return $this->json(['url' => $session->url]);
    }
}
