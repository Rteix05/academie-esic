<?php

namespace App\Controller;

use App\Entity\Event;
use App\Entity\EventRegistration;
use App\Entity\User;
use App\Repository\EventRegistrationRepository;
use Doctrine\DBAL\LockMode;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Stripe\StripeClient;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class EventCheckoutController extends AbstractController
{
    public function __construct(
        private readonly LoggerInterface $logger,
    ) {}

    /**
     * Inscription gratuite ou redirection Stripe pour événement payant.
     */
    #[Route('/api/events/{id}/register', name: 'api_event_register', methods: ['POST'])]
    public function register(
        Event $event,
        EventRegistrationRepository $registrationRepository,
        EntityManagerInterface $em,
        MailerInterface $mailer
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Connexion requise.'], 401);
        }

        if (!$event->isPublished()) {
            return $this->json(['message' => 'Événement non disponible.'], 404);
        }

        $isPaid = $event->getPrice() > 0;

        $stripeSecret = $_ENV['STRIPE_SECRET'] ?? $_ENV['STRIPE_SECRET_KEY'] ?? null;
        if ($isPaid && !$stripeSecret) {
            return $this->json(['message' => 'Le paiement en ligne est momentanément indisponible.'], 503);
        }

        // 1. Réservation atomique de la place : le verrou sur l'événement sérialise les
        //    inscriptions concurrentes, la capacité ne peut donc pas être dépassée.
        $outcome = $em->wrapInTransaction(function () use ($em, $event, $user, $registrationRepository, $isPaid) {
            $em->lock($event, LockMode::PESSIMISTIC_WRITE);

            $existing = $registrationRepository->findOneBy(['event' => $event, 'user' => $user]);
            if ($existing && $existing->isConfirmed()) {
                return 'already';
            }

            if ($event->getCapacity() !== null
                && $registrationRepository->countOccupiedSeats($event, $existing) >= $event->getCapacity()) {
                return 'full';
            }

            $registration = $existing ?? (new EventRegistration())->setEvent($event)->setUser($user);
            $registration->setStatus($isPaid ? EventRegistration::STATUS_PENDING : EventRegistration::STATUS_FREE);
            // Pour une réservation payante, le délai de paiement repart de maintenant
            $registration->setRegisteredAt(new \DateTimeImmutable());
            $em->persist($registration);
            $em->flush();

            return $registration;
        });

        if ($outcome === 'already') {
            return $this->json(['message' => 'Vous êtes déjà inscrit à cet événement.', 'alreadyRegistered' => true], 200);
        }
        if ($outcome === 'full') {
            return $this->json(['message' => 'Cet événement est complet.', 'full' => true], 409);
        }

        /** @var EventRegistration $registration */
        $registration = $outcome;
        $frontendUrl  = $_ENV['FRONTEND_URL'] ?? '';

        // 2. Événement payant → session Stripe (la place reste réservée pendant le paiement)
        if ($isPaid) {
            try {
                $session = (new StripeClient($stripeSecret))->checkout->sessions->create([
                    'payment_method_types' => ['card'],
                    'mode' => 'payment',
                    'line_items' => [[
                        'price_data' => [
                            'currency' => 'eur',
                            'product_data' => ['name' => $event->getTitle()],
                            'unit_amount' => (int) round($event->getPrice() * 100),
                        ],
                        'quantity' => 1,
                    ]],
                    'customer_email' => $user->getUserIdentifier(),
                    'success_url' => $frontendUrl . '/dashboard?session_id={CHECKOUT_SESSION_ID}',
                    'cancel_url'  => $frontendUrl . '/evenements/' . $event->getId(),
                    // Minimum imposé par Stripe : 30 min. Expire avant la fin de la réservation (35 min).
                    'expires_at'  => time() + 31 * 60,
                    'metadata' => [
                        'event_id'   => (string) $event->getId(),
                        'user_email' => $user->getUserIdentifier(),
                    ],
                ]);
            } catch (\Throwable $e) {
                $this->logger->error('Stripe : création de session événement impossible', [
                    'event_id' => $event->getId(),
                    'error'    => $e->getMessage(),
                ]);
                // Libère la place réservée
                $em->remove($registration);
                $em->flush();

                return $this->json(['message' => 'Impossible d\'initialiser le paiement. Réessayez dans quelques instants.'], 502);
            }

            $registration->setStripeSessionId($session->id);
            $em->flush();

            return $this->json(['url' => $session->url]);
        }

        // 3. Événement gratuit → inscription confirmée + email
        $this->sendConfirmationEmail($mailer, $user, $event, false);

        return $this->json(['success' => true, 'message' => 'Inscription confirmée !']);
    }

    /**
     * Confirme un paiement Stripe pour un événement (appelé par PaymentSuccessPopup).
     */
    #[Route('/api/stripe/confirm/event', name: 'api_stripe_confirm_event', methods: ['POST'])]
    public function confirmEventPayment(
        Request $request,
        EventRegistrationRepository $registrationRepository,
        EntityManagerInterface $em,
        MailerInterface $mailer
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Connexion requise.'], 401);
        }

        $data      = json_decode($request->getContent() ?: '{}', true);
        $sessionId = $data['session_id'] ?? null;

        if (!is_string($sessionId) || $sessionId === '') {
            return $this->json(['message' => 'session_id manquant.'], 400);
        }

        $stripeSecret = $_ENV['STRIPE_SECRET'] ?? $_ENV['STRIPE_SECRET_KEY'] ?? null;
        if (!$stripeSecret) {
            return $this->json(['message' => 'Le paiement en ligne est momentanément indisponible.'], 503);
        }

        try {
            $session = (new StripeClient($stripeSecret))->checkout->sessions->retrieve($sessionId);
        } catch (\Throwable $e) {
            $this->logger->warning('Stripe confirm event : session introuvable', ['session_id' => $sessionId, 'error' => $e->getMessage()]);
            return $this->json(['message' => 'Session de paiement invalide.'], 400);
        }

        if (!in_array($session->payment_status, ['paid', 'no_payment_required'], true)) {
            return $this->json(['message' => 'Paiement non confirmé.'], 400);
        }

        $metadata  = $session->metadata;
        $eventId   = (int) ($metadata->event_id ?? 0);
        $userEmail = $metadata->user_email ?? null;

        if (!$eventId || !$userEmail) {
            return $this->json(['message' => 'Métadonnées manquantes.'], 400);
        }

        // La session doit appartenir à l'utilisateur connecté
        if (strcasecmp($userEmail, $user->getUserIdentifier()) !== 0) {
            return $this->json(['message' => 'Cette session de paiement ne vous appartient pas.'], 403);
        }

        $event = $em->find(Event::class, $eventId);
        if (!$event) {
            return $this->json(['message' => 'Événement introuvable.'], 404);
        }

        $registration = $registrationRepository->findOneBy(['event' => $event, 'user' => $user]);
        if (!$registration) {
            $registration = (new EventRegistration())->setEvent($event)->setUser($user);
            $em->persist($registration);
        }

        // Idempotent avec le webhook : l'email n'est envoyé qu'au premier passage à "paid"
        $alreadyPaid = $registration->getStatus() === EventRegistration::STATUS_PAID;

        $registration->setStatus(EventRegistration::STATUS_PAID);
        $registration->setStripeSessionId($sessionId);
        $em->flush();

        if (!$alreadyPaid) {
            $this->sendConfirmationEmail($mailer, $user, $event, true);
        }

        return $this->json(['success' => true]);
    }

    private function sendConfirmationEmail(MailerInterface $mailer, User $user, Event $event, bool $paid): void
    {
        $displayName = trim(($user->getFirstName() ?? '') . ' ' . ($user->getLastName() ?? '')) ?: $user->getEmail();
        $frontendUrl = $_ENV['FRONTEND_URL'] ?? '';
        $eventUrl    = $frontendUrl . '/evenements/' . $event->getId();

        $title = $paid ? 'Paiement confirmé !' : 'Inscription confirmée !';
        $intro = $paid
            ? 'Votre inscription payante à <strong>' . htmlspecialchars($event->getTitle(), ENT_QUOTES, 'UTF-8') . '</strong> est confirmée.'
            : 'Votre inscription à l\'événement <strong>' . htmlspecialchars($event->getTitle(), ENT_QUOTES, 'UTF-8') . '</strong> a bien été enregistrée.';

        try {
            $mail = (new Email())
                ->from('noreply@academie-esic.fr')
                ->to($user->getEmail())
                ->subject(($paid ? 'Paiement confirmé — ' : 'Inscription confirmée — ') . $event->getTitle())
                ->html(
                    '<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;color:#1C2C24;">' .
                    '<h2 style="color:#0F291E;">' . $title . '</h2>' .
                    '<p>Bonjour <strong>' . htmlspecialchars($displayName, ENT_QUOTES, 'UTF-8') . '</strong>,</p>' .
                    '<p>' . $intro . '</p>' .
                    '<p>📅 ' . $event->getStartDate()->format('d/m/Y à H:i') . '</p>' .
                    '<p>📍 ' . htmlspecialchars($event->getLocation(), ENT_QUOTES, 'UTF-8') . '</p>' .
                    '<p><a href="' . htmlspecialchars($eventUrl, ENT_QUOTES, 'UTF-8') . '" style="display:inline-block;background:#0F291E;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Voir l\'événement</a></p>' .
                    '</div>'
                );
            $mailer->send($mail);
        } catch (\Throwable $e) {
            // Ne pas bloquer l'inscription si l'email échoue
            $this->logger->error('Email de confirmation d\'événement non envoyé', ['event_id' => $event->getId(), 'error' => $e->getMessage()]);
        }
    }
}
