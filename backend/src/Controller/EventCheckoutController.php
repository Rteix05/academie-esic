<?php

namespace App\Controller;

use App\Entity\Event;
use App\Entity\EventRegistration;
use App\Entity\RegistrationStatus;
use App\Entity\User;
use App\Mailer\AppMailer;
use App\Repository\EventRegistrationRepository;
use App\Stripe\StripeGateway;
use Doctrine\DBAL\LockMode;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class EventCheckoutController extends AbstractController
{
    public function __construct(
        private readonly StripeGateway $stripe,
        private readonly AppMailer $mailer,
        private readonly LoggerInterface $logger,
        #[Autowire('%env(FRONTEND_URL)%')] private readonly string $frontendUrl,
    ) {}

    /**
     * Inscription gratuite ou redirection Stripe pour événement payant.
     * La confirmation du paiement est gérée par StripeConfirmController / le webhook.
     */
    #[Route('/api/events/{id}/register', name: 'api_event_register', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function register(
        Event $event,
        EventRegistrationRepository $registrationRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Connexion requise.'], 401);
        }

        if (!$event->isPublished()) {
            return $this->json(['message' => 'Événement non disponible.'], 404);
        }

        $isPaid = $event->getPrice() > 0;
        if ($isPaid && !$this->stripe->isConfigured()) {
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
            $registration->setStatus($isPaid ? RegistrationStatus::Pending : RegistrationStatus::Free);
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

        // 2. Événement gratuit → inscription confirmée + email
        if (!$isPaid) {
            $this->mailer->sendEventConfirmation($user, $event, false);

            return $this->json(['success' => true, 'message' => 'Inscription confirmée !']);
        }

        // 3. Événement payant → session Stripe (la place reste réservée pendant le paiement)
        try {
            $session = $this->stripe->createCheckoutSession([
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
                'success_url' => $this->frontendUrl . '/dashboard?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url'  => $this->frontendUrl . '/evenements/' . $event->getId(),
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
}
