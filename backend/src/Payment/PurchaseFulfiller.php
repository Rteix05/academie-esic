<?php

namespace App\Payment;

use App\Entity\Event;
use App\Entity\EventRegistration;
use App\Entity\Formation;
use App\Entity\Masterclass;
use App\Entity\MasterclassPurchase;
use App\Entity\Payment;
use App\Entity\ProductType;
use App\Entity\RegistrationStatus;
use App\Entity\User;
use App\Mailer\AppMailer;
use App\Repository\EventRegistrationRepository;
use App\Repository\PaymentRepository;
use App\Repository\UserRepository;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Stripe\Checkout\Session;

/**
 * Attribution d'un achat Stripe payé, point d'entrée unique pour :
 *  - le webhook (source de vérité),
 *  - les endpoints de confirmation appelés par le navigateur au retour de Stripe.
 *
 * Idempotent : le paiement est enregistré une seule fois (unicité de la session
 * Stripe), l'accès n'est accordé qu'une fois et l'email n'est envoyé qu'une fois,
 * quel que soit l'ordre ou le nombre d'appels.
 */
class PurchaseFulfiller
{
    public const MASTERCLASS_OPTIONS = [
        'pdf'   => 'Format PDF',
        'video' => 'Format Vidéo',
        'pack'  => 'Pack Complet (Vidéo + PDF)',
    ];

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserRepository $userRepository,
        private readonly PaymentRepository $paymentRepository,
        private readonly EventRegistrationRepository $registrationRepository,
        private readonly AppMailer $mailer,
        private readonly LoggerInterface $logger,
    ) {}

    /** Utilisateur propriétaire de la session (métadonnée posée à la création) */
    public function sessionOwner(Session $session): ?User
    {
        $email = $session->metadata['user_email'] ?? null;

        return is_string($email) && $email !== '' ? $this->userRepository->findOneBy(['email' => $email]) : null;
    }

    public function fulfill(Session $session): FulfillmentResult
    {
        if (($session->payment_status ?? null) !== 'paid') {
            return FulfillmentResult::notPaid();
        }

        $user = $this->sessionOwner($session);
        if (!$user) {
            // Paiement encaissé pour un compte introuvable : action manuelle requise (remboursement…)
            $this->logger->critical('Paiement Stripe reçu pour un utilisateur introuvable', ['session_id' => $session->id]);

            return FulfillmentResult::invalid('Utilisateur introuvable.');
        }

        $metadata = $session->metadata ? $session->metadata->toArray() : [];

        return match (true) {
            !empty($metadata['event_id'])       => $this->fulfillEvent($session, $user, (int) $metadata['event_id']),
            !empty($metadata['formation_id'])   => $this->fulfillFormation($session, $user, (int) $metadata['formation_id']),
            !empty($metadata['masterclass_id']) => $this->fulfillMasterclass($session, $user, (int) $metadata['masterclass_id'], $metadata['option'] ?? null),
            default                             => FulfillmentResult::invalid('Type d\'achat inconnu.'),
        };
    }

    /**
     * Session Stripe expirée sans paiement : libère la place d'événement réservée.
     */
    public function releaseExpired(Session $session): void
    {
        $registration = $this->registrationRepository->findOneBy(['stripeSessionId' => $session->id]);

        if ($registration && $registration->getStatus() === RegistrationStatus::Pending) {
            $this->em->remove($registration);
            $this->em->flush();
        }
    }

    private function fulfillFormation(Session $session, User $user, int $formationId): FulfillmentResult
    {
        $formation = $this->em->find(Formation::class, $formationId);
        if (!$formation) {
            $this->logger->critical('Paiement Stripe reçu pour une formation introuvable', ['session_id' => $session->id, 'formation_id' => $formationId]);

            return FulfillmentResult::invalid('Formation introuvable.', ProductType::Formation);
        }

        if (!$user->getFormations()->contains($formation)) {
            $user->addFormation($formation);
        }

        $payment = new Payment($user, ProductType::Formation, $formationId, (string) $formation->getTitle(), $this->amount($session), $this->currency($session), $session->id);

        return $this->record($payment)
            ? FulfillmentResult::granted(ProductType::Formation, $formationId)
            : FulfillmentResult::already(ProductType::Formation, $formationId);
    }

    private function fulfillMasterclass(Session $session, User $user, int $masterclassId, ?string $option): FulfillmentResult
    {
        if (!isset(self::MASTERCLASS_OPTIONS[$option])) {
            $this->logger->warning('Paiement Stripe : option de masterclass invalide', ['session_id' => $session->id, 'option' => $option]);

            return FulfillmentResult::invalid('Option d\'achat invalide.', ProductType::Masterclass);
        }

        $masterclass = $this->em->find(Masterclass::class, $masterclassId);
        if (!$masterclass) {
            $this->logger->critical('Paiement Stripe reçu pour une masterclass introuvable', ['session_id' => $session->id, 'masterclass_id' => $masterclassId]);

            return FulfillmentResult::invalid('Masterclass introuvable.', ProductType::Masterclass);
        }

        $alreadyOwned = $this->em->getRepository(MasterclassPurchase::class)->findOneBy([
            'user' => $user, 'masterclass' => $masterclass, 'option' => $option,
        ]);

        if (!$alreadyOwned) {
            $purchase = (new MasterclassPurchase())
                ->setUser($user)
                ->setMasterclass($masterclass)
                ->setOption($option)
                ->setCreatedAt(new \DateTimeImmutable());
            $this->em->persist($purchase);
        }

        if (!$user->getMasterclasses()->contains($masterclass)) {
            $user->addMasterclass($masterclass);
        }

        $label = $masterclass->getTitle() . ' — ' . self::MASTERCLASS_OPTIONS[$option];
        $payment = (new Payment($user, ProductType::Masterclass, $masterclassId, $label, $this->amount($session), $this->currency($session), $session->id))
            ->setOption($option);

        return $this->record($payment)
            ? FulfillmentResult::granted(ProductType::Masterclass, $masterclassId)
            : FulfillmentResult::already(ProductType::Masterclass, $masterclassId);
    }

    private function fulfillEvent(Session $session, User $user, int $eventId): FulfillmentResult
    {
        $event = $this->em->find(Event::class, $eventId);
        if (!$event) {
            $this->logger->critical('Paiement Stripe reçu pour un événement introuvable', ['session_id' => $session->id, 'event_id' => $eventId]);

            return FulfillmentResult::invalid('Événement introuvable.', ProductType::Event);
        }

        $registration = $this->registrationRepository->findOneBy(['event' => $event, 'user' => $user])
            ?? (new EventRegistration())->setEvent($event)->setUser($user);
        $registration->setStatus(RegistrationStatus::Paid);
        $registration->setStripeSessionId($session->id);
        $this->em->persist($registration);

        $payment = new Payment($user, ProductType::Event, $eventId, (string) $event->getTitle(), $this->amount($session), $this->currency($session), $session->id);

        if (!$this->record($payment, sendReceipt: false)) {
            return FulfillmentResult::already(ProductType::Event, $eventId);
        }

        $this->mailer->sendEventConfirmation($user, $event, true);

        return FulfillmentResult::granted(ProductType::Event, $eventId);
    }

    /**
     * Enregistre le paiement (et les accès en attente dans l'unité de travail).
     *
     * @return bool true si enregistré maintenant, false s'il l'était déjà
     */
    private function record(Payment $payment, bool $sendReceipt = true): bool
    {
        if ($this->paymentRepository->findOneBy(['stripeSessionId' => $payment->getStripeSessionId()])) {
            // Accès déjà accordé lors du premier passage : on enregistre d'éventuelles corrections sans doublon
            $this->em->flush();

            return false;
        }

        $this->em->persist($payment);

        try {
            $this->em->flush();
        } catch (UniqueConstraintViolationException) {
            // Webhook et confirmation simultanés : l'autre requête a enregistré le paiement
            return false;
        }

        if ($sendReceipt) {
            $this->mailer->sendPurchaseConfirmation($payment);
        }

        return true;
    }

    private function amount(Session $session): int
    {
        return (int) ($session->amount_total ?? 0);
    }

    private function currency(Session $session): string
    {
        return (string) ($session->currency ?? 'eur');
    }
}
