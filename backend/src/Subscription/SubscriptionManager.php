<?php

namespace App\Subscription;

use App\Entity\Payment;
use App\Entity\ProductType;
use App\Entity\Subscription;
use App\Entity\User;
use App\Legal\SalesTerms;
use App\Mailer\AppMailer;
use App\Payment\FulfillmentResult;
use App\Repository\PaymentRepository;
use App\Repository\SubscriptionRepository;
use App\Repository\UserRepository;
use App\Stripe\StripeGateway;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Stripe\Checkout\Session;
use Stripe\Invoice;
use Stripe\Subscription as StripeSubscription;

/**
 * Synchronisation des abonnements Stripe, point d'entrée unique pour :
 *  - le webhook (checkout.session.completed, customer.subscription.*, invoice.paid),
 *  - la confirmation appelée par le navigateur au retour de Stripe.
 *
 * L'état est toujours relu dans Stripe : les webhooks pouvant arriver dans le désordre,
 * on ne se fie pas au contenu de l'événement reçu. Chaque échéance payée est enregistrée
 * une seule fois dans l'historique des paiements (unicité de l'identifiant de facture).
 */
class SubscriptionManager
{
    /** Métadonnée (session et abonnement Stripe) portant la formule souscrite */
    public const META_PLAN = 'subscription_plan';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly StripeGateway $stripe,
        private readonly SubscriptionRepository $subscriptions,
        private readonly UserRepository $userRepository,
        private readonly PaymentRepository $paymentRepository,
        private readonly AppMailer $mailer,
        private readonly LoggerInterface $logger,
    ) {}

    /** Session Checkout en mode abonnement, payée */
    public function fulfillCheckout(Session $session): FulfillmentResult
    {
        if (($session->payment_status ?? null) !== 'paid' || !$session->subscription) {
            return FulfillmentResult::notPaid();
        }

        $subscriptionId = is_string($session->subscription) ? $session->subscription : $session->subscription->id;
        $known = $this->subscriptions->findOneBy(['stripeSubscriptionId' => $subscriptionId]);

        $subscription = $this->refresh($subscriptionId);
        if (!$subscription) {
            return FulfillmentResult::invalid('Abonnement introuvable.', ProductType::Subscription);
        }

        return $known
            ? FulfillmentResult::already(ProductType::Subscription, (int) $subscription->getId())
            : FulfillmentResult::granted(ProductType::Subscription, (int) $subscription->getId());
    }

    /**
     * Relit l'abonnement dans Stripe et met à jour (ou crée) sa copie locale.
     *
     * @throws \Stripe\Exception\ApiErrorException Stripe injoignable : le webhook doit être réessayé
     */
    public function refresh(string $stripeSubscriptionId): ?Subscription
    {
        return $this->sync($this->stripe->retrieveSubscription($stripeSubscriptionId));
    }

    private function sync(StripeSubscription $remote): ?Subscription
    {
        $subscription = $this->subscriptions->findOneBy(['stripeSubscriptionId' => $remote->id])
            ?? $this->create($remote);

        if (!$subscription) {
            return null;
        }

        $item = $remote->items->data[0] ?? null;
        $periodEnd = $this->date($item?->current_period_end);
        $cancelAt = $this->date($remote->cancel_at) ?? ($remote->cancel_at_period_end ? $periodEnd : null);

        $subscription->updateState((string) $remote->status, $periodEnd, $cancelAt, $this->date($remote->ended_at));

        try {
            $this->em->flush();
        } catch (UniqueConstraintViolationException) {
            // Webhook et confirmation simultanés : l'autre requête a créé l'abonnement
            return $this->subscriptions->findOneBy(['stripeSubscriptionId' => $remote->id]);
        }

        return $subscription;
    }

    private function create(StripeSubscription $remote): ?Subscription
    {
        $metadata = $remote->metadata ? $remote->metadata->toArray() : [];
        $plan = SubscriptionPlan::tryFrom((string) ($metadata[self::META_PLAN] ?? ''));
        $user = $this->owner($metadata);

        if (!$plan || !$user) {
            // Abonnement créé hors du site (Dashboard…) ou compte supprimé : action manuelle requise
            $this->logger->critical('Abonnement Stripe non rattachable à un élève', ['subscription_id' => $remote->id, 'plan' => $metadata[self::META_PLAN] ?? null]);

            return null;
        }

        $customer = is_string($remote->customer) ? $remote->customer : $remote->customer->id;
        $subscription = new Subscription($user, $plan, $remote->id, $customer, (string) $remote->status);

        $consents = SalesTerms::consentsFromMetadata($metadata);
        if ($consents) {
            $subscription->recordConsents($consents['version'], $consents['acceptedAt'], $consents['immediateAccessAt']);
        } else {
            $this->logger->warning('Abonnement Stripe sans consentement CGV enregistré', ['subscription_id' => $remote->id]);
        }

        $this->em->persist($subscription);

        return $subscription;
    }

    /**
     * Échéance payée (première ou renouvellement) : enregistrée dans l'historique des paiements.
     * Confirmation de commande envoyée pour la souscription uniquement ; Stripe envoie
     * lui-même les reçus des renouvellements (Dashboard → Paramètres → Emails clients).
     *
     * @throws \Stripe\Exception\ApiErrorException
     */
    public function recordInvoice(Invoice $invoice): void
    {
        $remote = $invoice->parent?->subscription_details?->subscription ?? null;
        if (!$remote) {
            return; // facture hors abonnement
        }

        $subscriptionId = is_string($remote) ? $remote : $remote->id;
        $subscription = $this->subscriptions->findOneBy(['stripeSubscriptionId' => $subscriptionId])
            ?? $this->refresh($subscriptionId);

        if (!$subscription || $this->paymentRepository->findOneBy(['stripeSessionId' => $invoice->id])) {
            return;
        }

        // L'identifiant de facture (in_…) tient lieu de référence de paiement pour les échéances
        $payment = new Payment($subscription->getUser(), ProductType::Subscription, (int) $subscription->getId(), $subscription->getPlan()->label(), (int) $invoice->amount_paid, (string) $invoice->currency, $invoice->id);

        $isFirst = $invoice->billing_reason === 'subscription_create';
        if ($isFirst && $subscription->getCgvVersion() && $subscription->getCgvAcceptedAt()) {
            $payment->recordConsents($subscription->getCgvVersion(), $subscription->getCgvAcceptedAt(), $subscription->getImmediateAccessConsentAt());
        }

        $this->em->persist($payment);

        try {
            $this->em->flush();
        } catch (UniqueConstraintViolationException) {
            return; // déjà enregistrée par un webhook simultané
        }

        if ($isFirst) {
            $this->mailer->sendPurchaseConfirmation($payment);
        }
    }

    /** @param array<string, mixed> $metadata */
    private function owner(array $metadata): ?User
    {
        $email = $metadata['user_email'] ?? null;

        return is_string($email) && $email !== '' ? $this->userRepository->findOneBy(['email' => $email]) : null;
    }

    private function date(mixed $timestamp): ?\DateTimeImmutable
    {
        return is_int($timestamp) && $timestamp > 0 ? (new \DateTimeImmutable())->setTimestamp($timestamp) : null;
    }
}
