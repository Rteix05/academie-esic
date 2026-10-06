<?php

namespace App\Stripe;

use Stripe\BillingPortal\Session as PortalSession;
use Stripe\Checkout\Session;
use Stripe\Event;
use Stripe\Price;
use Stripe\StripeClient;
use Stripe\Subscription;
use Stripe\Webhook;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Point d'accès unique à l'API Stripe (clé secrète, sessions Checkout, abonnements, webhooks).
 * Remplacé par un double en test : aucun appel réseau dans la suite PHPUnit.
 */
class StripeGateway
{
    private ?StripeClient $client = null;

    public function __construct(
        #[Autowire('%env(default::STRIPE_SECRET_KEY)%')] private readonly ?string $secretKey,
        #[Autowire('%env(default::STRIPE_WEBHOOK_SECRET)%')] private readonly ?string $webhookSecret,
    ) {}

    public function isConfigured(): bool
    {
        return (bool) $this->secretKey;
    }

    /**
     * @param array<string, mixed> $params paramètres de l'API Checkout Session
     */
    public function createCheckoutSession(array $params): Session
    {
        // Facturation automatique : Stripe génère une facture PDF (numérotée) pour chaque paiement
        // et l'envoie au client par email (Dashboard Stripe → Paramètres → Emails clients)
        if (($params['mode'] ?? null) === 'payment') {
            $params['invoice_creation'] ??= ['enabled' => true];
        }

        return $this->client()->checkout->sessions->create($params);
    }

    public function retrieveCheckoutSession(string $sessionId): Session
    {
        return $this->client()->checkout->sessions->retrieve($sessionId);
    }

    public function retrieveSubscription(string $subscriptionId): Subscription
    {
        return $this->client()->subscriptions->retrieve($subscriptionId);
    }

    public function retrievePrice(string $priceId): Price
    {
        return $this->client()->prices->retrieve($priceId);
    }

    /** Portail client Stripe : moyen de paiement, factures, résiliation de l'abonnement */
    public function createBillingPortalSession(string $customerId, string $returnUrl): PortalSession
    {
        return $this->client()->billingPortal->sessions->create(['customer' => $customerId, 'return_url' => $returnUrl]);
    }

    /**
     * Vérifie la signature Stripe et décode l'événement.
     *
     * @throws \UnexpectedValueException           payload invalide
     * @throws \Stripe\Exception\SignatureVerificationException signature invalide
     * @throws \LogicException                     secret de webhook non configuré
     */
    public function constructWebhookEvent(string $payload, string $signature): Event
    {
        if (!$this->webhookSecret) {
            throw new \LogicException('STRIPE_WEBHOOK_SECRET n\'est pas configuré.');
        }

        return Webhook::constructEvent($payload, $signature, $this->webhookSecret);
    }

    private function client(): StripeClient
    {
        if (!$this->secretKey) {
            throw new \LogicException('STRIPE_SECRET_KEY n\'est pas configuré.');
        }

        return $this->client ??= new StripeClient($this->secretKey);
    }
}
