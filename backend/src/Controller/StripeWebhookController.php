<?php

namespace App\Controller;

use App\Payment\FulfillmentResult;
use App\Payment\PurchaseFulfiller;
use App\Stripe\StripeGateway;
use App\Subscription\SubscriptionManager;
use Psr\Log\LoggerInterface;
use Stripe\Checkout\Session;
use Stripe\Exception\ApiErrorException;
use Stripe\Invoice;
use Stripe\Subscription;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Webhook Stripe : source de vérité des paiements.
 *
 * Stripe réessaie pendant 3 jours toute réponse non-2xx : on ne renvoie une erreur
 * que si un nouvel essai peut réussir (signature, configuration). Les cas définitifs
 * (métadonnées absentes, produit supprimé…) sont journalisés par le fulfiller et acquittés.
 */
class StripeWebhookController extends AbstractController
{
    public function __construct(
        private readonly StripeGateway $stripe,
        private readonly PurchaseFulfiller $fulfiller,
        private readonly SubscriptionManager $subscriptions,
        private readonly LoggerInterface $logger,
    ) {}

    #[Route('/api/stripe/webhook', name: 'api_stripe_webhook', methods: ['POST'])]
    public function handleWebhook(Request $request): Response
    {
        try {
            $event = $this->stripe->constructWebhookEvent(
                $request->getContent(),
                (string) $request->headers->get('Stripe-Signature')
            );
        } catch (\LogicException $e) {
            $this->logger->critical('Webhook Stripe reçu mais non configuré', ['error' => $e->getMessage()]);

            return new Response('Webhook non configuré.', 500);
        } catch (\Throwable) {
            return new Response('Webhook signature invalide.', 400);
        }

        $object = $event->data->object;

        try {
            if ($object instanceof Session) {
                $this->handleSession($event->type, $object);
            } elseif ($object instanceof Subscription) {
                // customer.subscription.created / updated / deleted : état relu dans Stripe
                $this->subscriptions->refresh($object->id);
            } elseif ($object instanceof Invoice && $event->type === 'invoice.paid') {
                $this->subscriptions->recordInvoice($object);
            }
        } catch (ApiErrorException $e) {
            // Stripe injoignable pour relire l'abonnement : Stripe réessaiera l'envoi
            $this->logger->error('Webhook Stripe : lecture de l\'abonnement impossible', ['event' => $event->id, 'error' => $e->getMessage()]);

            return new Response('Stripe indisponible, réessayer.', 503);
        }

        return new Response('OK', 200);
    }

    private function handleSession(string $type, Session $session): void
    {
        switch ($type) {
            case 'checkout.session.completed':
            case 'checkout.session.async_payment_succeeded':
                $result = ($session->mode ?? null) === 'subscription'
                    ? $this->subscriptions->fulfillCheckout($session)
                    : $this->fulfiller->fulfill($session);
                if ($result->status === FulfillmentResult::INVALID) {
                    $this->logger->warning('Webhook Stripe : achat non attribué', ['session_id' => $session->id, 'reason' => $result->reason]);
                }
                break;

            case 'checkout.session.expired':
                $this->fulfiller->releaseExpired($session);
                break;
        }
    }
}
