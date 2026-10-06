<?php

namespace App\Tests\Double;

use App\Stripe\StripeGateway;
use Stripe\BillingPortal\Session as PortalSession;
use Stripe\Checkout\Session;
use Stripe\Price;
use Stripe\Subscription;

/**
 * Double de StripeGateway pour les tests : sessions Checkout, abonnements et prix simulés en mémoire,
 * vérification de signature des webhooks réelle (secret de test, cf. .env.test).
 */
class FakeStripeGateway extends StripeGateway
{
    public const WEBHOOK_SECRET = 'whsec_test_secret';

    /** @var array<string, Session> */
    private static array $sessions = [];

    /** @var array<int, array<string, mixed>> paramètres reçus par createCheckoutSession */
    public static array $createdSessions = [];

    /** Prix récurrents configurés dans .env.test (montants en centimes) */
    public const PRICES = ['price_test_institut' => 4299, 'price_test_ecole' => 5299];

    /** @var array<string, Subscription> */
    private static array $subscriptions = [];

    /** @var list<string> clients pour lesquels le portail a été ouvert */
    public static array $portalCustomers = [];

    public function __construct()
    {
        parent::__construct('sk_test_fake', self::WEBHOOK_SECRET);
    }

    /** À appeler entre deux tests (état statique : survit au reboot du kernel entre requêtes) */
    public static function reset(): void
    {
        self::$sessions = [];
        self::$createdSessions = [];
        self::$subscriptions = [];
        self::$portalCustomers = [];
    }

    public function createCheckoutSession(array $params): Session
    {
        self::$createdSessions[] = $params;
        $id = 'cs_test_' . bin2hex(random_bytes(8));

        return Session::constructFrom([
            'id'  => $id,
            'url' => 'https://checkout.stripe.test/' . $id,
        ]);
    }

    public function retrieveCheckoutSession(string $sessionId): Session
    {
        return self::$sessions[$sessionId]
            ?? throw new \RuntimeException('No such checkout.session: ' . $sessionId);
    }

    public function retrieveSubscription(string $subscriptionId): Subscription
    {
        return self::$subscriptions[$subscriptionId]
            ?? throw new \Stripe\Exception\InvalidRequestException('No such subscription: ' . $subscriptionId);
    }

    public function retrievePrice(string $priceId): Price
    {
        if (!isset(self::PRICES[$priceId])) {
            throw new \Stripe\Exception\InvalidRequestException('No such price: ' . $priceId);
        }

        return Price::constructFrom([
            'id' => $priceId, 'object' => 'price', 'active' => true, 'currency' => 'eur',
            'unit_amount' => self::PRICES[$priceId], 'recurring' => ['interval' => 'month'],
        ]);
    }

    public function createBillingPortalSession(string $customerId, string $returnUrl): PortalSession
    {
        self::$portalCustomers[] = $customerId;

        return PortalSession::constructFrom(['id' => 'bps_test', 'url' => 'https://billing.stripe.test/' . $customerId]);
    }

    /**
     * Enregistre (ou met à jour) l'abonnement que retrieveSubscription() renverra ensuite.
     *
     * @param array<string, string> $metadata
     * @return array<string, mixed> données de l'abonnement, utilisables comme objet de webhook
     */
    public static function putSubscription(string $id, array $metadata, string $status = 'active', ?int $periodEnd = null, bool $cancelAtPeriodEnd = false, string $customer = 'cus_test'): array
    {
        $data = [
            'id'                   => $id,
            'object'               => 'subscription',
            'customer'             => $customer,
            'status'               => $status,
            'cancel_at_period_end' => $cancelAtPeriodEnd,
            'cancel_at'            => null,
            'ended_at'             => $status === 'canceled' ? time() : null,
            'metadata'             => $metadata,
            'items'                => ['object' => 'list', 'data' => [[
                'id' => 'si_' . $id, 'object' => 'subscription_item', 'current_period_end' => $periodEnd ?? strtotime('+1 month'),
            ]]],
        ];
        self::$subscriptions[$id] = Subscription::constructFrom($data);

        return $data;
    }

    /**
     * Enregistre une session que retrieveCheckoutSession() renverra ensuite.
     *
     * @param array<string, string> $metadata
     */
    public static function addSession(string $id, array $metadata, int $amountTotal, string $paymentStatus = 'paid'): Session
    {
        return self::$sessions[$id] = self::session($id, $metadata, $amountTotal, $paymentStatus);
    }

    /**
     * Session Checkout en mode abonnement (payée), enregistrée pour retrieveCheckoutSession().
     *
     * @param array<string, string> $metadata
     * @return array<string, mixed> données de la session, utilisables comme objet de webhook
     */
    public static function addSubscriptionSession(string $id, string $subscriptionId, array $metadata, int $amountTotal): array
    {
        $data = ['mode' => 'subscription', 'subscription' => $subscriptionId, 'customer' => 'cus_test']
            + self::sessionData($id, $metadata, $amountTotal);
        self::$sessions[$id] = Session::constructFrom($data);

        return $data;
    }

    /**
     * @param array<string, string> $metadata
     */
    public static function session(string $id, array $metadata, int $amountTotal, string $paymentStatus = 'paid'): Session
    {
        return Session::constructFrom(self::sessionData($id, $metadata, $amountTotal, $paymentStatus));
    }

    /**
     * @param array<string, string> $metadata
     * @return array<string, mixed>
     */
    public static function sessionData(string $id, array $metadata, int $amountTotal, string $paymentStatus = 'paid'): array
    {
        return [
            'id'             => $id,
            'object'         => 'checkout.session',
            'payment_status' => $paymentStatus,
            'status'         => $paymentStatus === 'paid' ? 'complete' : 'open',
            'amount_total'   => $amountTotal,
            'currency'       => 'eur',
            'metadata'       => $metadata,
        ];
    }
}
