<?php

namespace App\Tests\Double;

use App\Stripe\StripeGateway;
use Stripe\Checkout\Session;

/**
 * Double de StripeGateway pour les tests : sessions Checkout simulées en mémoire,
 * vérification de signature des webhooks réelle (secret de test, cf. .env.test).
 */
class FakeStripeGateway extends StripeGateway
{
    public const WEBHOOK_SECRET = 'whsec_test_secret';

    /** @var array<string, Session> */
    private static array $sessions = [];

    /** @var array<int, array<string, mixed>> paramètres reçus par createCheckoutSession */
    public static array $createdSessions = [];

    public function __construct()
    {
        parent::__construct('sk_test_fake', self::WEBHOOK_SECRET);
    }

    /** À appeler entre deux tests (état statique : survit au reboot du kernel entre requêtes) */
    public static function reset(): void
    {
        self::$sessions = [];
        self::$createdSessions = [];
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
