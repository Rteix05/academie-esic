<?php

namespace App\Controller;

use App\Entity\Event;
use App\Entity\EventRegistration;
use App\Repository\EventRegistrationRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Stripe\StripeClient;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class EventCheckoutController extends AbstractController
{
    /**
     * Inscription gratuite ou redirection Stripe pour événement payant.
     */
    #[Route('/api/events/{id}/register', name: 'api_event_register', methods: ['POST'])]
    public function register(
        Event $event,
        UserRepository $userRepository,
        EventRegistrationRepository $registrationRepository,
        EntityManagerInterface $em,
        MailerInterface $mailer
    ): JsonResponse {
        $securityUser = $this->getUser();
        if (!$securityUser) {
            return $this->json(['message' => 'Connexion requise.'], 401);
        }

        $user = $userRepository->findOneBy(['email' => $securityUser->getUserIdentifier()]);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        if (!$event->isPublished()) {
            return $this->json(['message' => 'Événement non disponible.'], 404);
        }

        // Vérification des places disponibles
        if ($event->getCapacity() !== null) {
            $taken = $registrationRepository->count(['event' => $event]);
            // Ne pas compter la reservation "pending" existante du même user
            $existing = $registrationRepository->findOneBy(['event' => $event, 'user' => $user]);
            if ($existing && $existing->getStatus() === 'pending') $taken--;
            if ($taken >= $event->getCapacity()) {
                return $this->json(['message' => 'Cet événement est complet.', 'full' => true], 409);
            }
        }
        $existing = $registrationRepository->findOneBy(['event' => $event, 'user' => $user]);
        if ($existing && $existing->getStatus() !== 'pending') {
            return $this->json(['message' => 'Vous êtes déjà inscrit à cet événement.', 'alreadyRegistered' => true], 200);
        }

        // Événement payant → Stripe
        if ($event->getPrice() > 0) {
            $stripeSecret = $_ENV['STRIPE_SECRET'] ?? $_ENV['STRIPE_SECRET_KEY'] ?? null;
            if (!$stripeSecret) {
                return $this->json(['message' => 'Stripe non configuré.'], 500);
            }

            $client = new StripeClient($stripeSecret);
            $frontendUrl = $_ENV['FRONTEND_URL'] ?? '';

            try {
                $session = $client->checkout->sessions->create([
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
                    'customer_email' => $securityUser->getUserIdentifier(),
                    'success_url' => $frontendUrl . '/dashboard?session_id={CHECKOUT_SESSION_ID}',
                    'cancel_url'  => $frontendUrl . '/evenements/' . $event->getId(),
                    'metadata' => [
                        'event_id'   => (string) $event->getId(),
                        'user_email' => $securityUser->getUserIdentifier(),
                    ],
                ]);

                // Crée une inscription "pending" le temps du paiement
                if (!$existing) {
                    $registration = new EventRegistration();
                    $registration->setEvent($event);
                    $registration->setUser($user);
                    $registration->setStatus('pending');
                    $registration->setStripeSessionId($session->id);
                    $em->persist($registration);
                    $em->flush();
                } else {
                    $existing->setStatus('pending');
                    $existing->setStripeSessionId($session->id);
                    $em->flush();
                }

                return $this->json(['url' => $session->url]);
            } catch (\Exception $e) {
                return $this->json(['message' => 'Erreur Stripe : ' . $e->getMessage()], 500);
            }
        }

        // Événement gratuit → inscription directe
        $registration = $existing ?? new EventRegistration();
        $registration->setEvent($event);
        $registration->setUser($user);
        $registration->setStatus('free');
        if (!$existing) $em->persist($registration);
        $em->flush();

        // Email de confirmation
        $displayName = trim(($user->getFirstName() ?? '') . ' ' . ($user->getLastName() ?? '')) ?: $user->getEmail();
        $frontendUrl = $_ENV['FRONTEND_URL'] ?? '';

        try {
            $mail = (new Email())
                ->from('noreply@academie-esic.fr')
                ->to($user->getEmail())
                ->subject('Inscription confirmée — ' . $event->getTitle())
                ->html(
                    '<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;color:#1C2C24;">' .
                    '<h2 style="color:#0F291E;">Inscription confirmée !</h2>' .
                    '<p>Bonjour <strong>' . htmlspecialchars($displayName, ENT_QUOTES) . '</strong>,</p>' .
                    '<p>Votre inscription à l\'événement <strong>' . htmlspecialchars($event->getTitle(), ENT_QUOTES) . '</strong> a bien été enregistrée.</p>' .
                    '<p>📅 ' . $event->getStartDate()->format('d/m/Y à H:i') . '</p>' .
                    '<p>📍 ' . htmlspecialchars($event->getLocation(), ENT_QUOTES) . '</p>' .
                    '<p><a href="' . $frontendUrl . '/evenements/' . $event->getId() . '" style="display:inline-block;background:#0F291E;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Voir l\'événement</a></p>' .
                    '</div>'
                );
            $mailer->send($mail);
        } catch (\Exception) {
            // Ne pas bloquer si l'email échoue
        }

        return $this->json(['success' => true, 'message' => 'Inscription confirmée !']);
    }

    /**
     * Confirme un paiement Stripe pour un événement (appelé par PaymentSuccessPopup).
     */
    #[Route('/api/stripe/confirm/event', name: 'api_stripe_confirm_event', methods: ['POST'])]
    public function confirmEventPayment(
        Request $request,
        UserRepository $userRepository,
        EventRegistrationRepository $registrationRepository,
        EntityManagerInterface $em,
        MailerInterface $mailer
    ): JsonResponse {
        $data      = json_decode($request->getContent() ?: '{}', true);
        $sessionId = $data['session_id'] ?? null;

        if (!$sessionId) {
            return $this->json(['message' => 'session_id manquant.'], 400);
        }

        $stripeSecret = $_ENV['STRIPE_SECRET'] ?? $_ENV['STRIPE_SECRET_KEY'] ?? null;
        if (!$stripeSecret) {
            return $this->json(['message' => 'Stripe non configuré.'], 500);
        }

        $client = new StripeClient($stripeSecret);
        try {
            $session = $client->checkout->sessions->retrieve($sessionId);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Session invalide : ' . $e->getMessage()], 400);
        }

        if (!in_array($session->payment_status, ['paid', 'no_payment_required'], true)) {
            return $this->json(['message' => 'Paiement non confirmé.'], 400);
        }

        $metadata  = $session->metadata;
        $eventId   = (int) ($metadata->event_id ?? 0);
        $userEmail = $metadata->user_email ?? $session->customer_details->email ?? null;

        if (!$eventId || !$userEmail) {
            return $this->json(['message' => 'Métadonnées manquantes.'], 400);
        }

        $user  = $userRepository->findOneBy(['email' => $userEmail]);
        $event = $em->find(\App\Entity\Event::class, $eventId);

        if (!$user || !$event) {
            return $this->json(['message' => 'Utilisateur ou événement introuvable.'], 404);
        }

        $registration = $registrationRepository->findOneBy(['event' => $event, 'user' => $user]);
        if (!$registration) {
            $registration = new EventRegistration();
            $registration->setEvent($event);
            $registration->setUser($user);
            $em->persist($registration);
        }

        $registration->setStatus('paid');
        $registration->setStripeSessionId($sessionId);
        $em->flush();

        // Email de confirmation
        $displayName = trim(($user->getFirstName() ?? '') . ' ' . ($user->getLastName() ?? '')) ?: $user->getEmail();
        $frontendUrl = $_ENV['FRONTEND_URL'] ?? 'http://localhost:3000';

        try {
            $mail = (new Email())
                ->from('noreply@academie-esic.fr')
                ->to($user->getEmail())
                ->subject('Paiement confirmé — ' . $event->getTitle())
                ->html(
                    '<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;color:#1C2C24;">' .
                    '<h2 style="color:#0F291E;">Paiement confirmé !</h2>' .
                    '<p>Bonjour <strong>' . htmlspecialchars($displayName, ENT_QUOTES) . '</strong>,</p>' .
                    '<p>Votre inscription payante à <strong>' . htmlspecialchars($event->getTitle(), ENT_QUOTES) . '</strong> est confirmée.</p>' .
                    '<p>📅 ' . $event->getStartDate()->format('d/m/Y à H:i') . '</p>' .
                    '<p>📍 ' . htmlspecialchars($event->getLocation(), ENT_QUOTES) . '</p>' .
                    '<p><a href="' . $frontendUrl . '/evenements/' . $event->getId() . '" style="display:inline-block;background:#0F291E;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Voir l\'événement</a></p>' .
                    '</div>'
                );
            $mailer->send($mail);
        } catch (\Exception) {}

        return $this->json(['success' => true]);
    }
}
