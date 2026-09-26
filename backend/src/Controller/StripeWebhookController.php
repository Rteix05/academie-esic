<?php

namespace App\Controller;

use App\Entity\Event;
use App\Entity\EventRegistration;
use App\Entity\Formation;
use App\Entity\MasterclassPurchase;
use App\Entity\User;
use App\Repository\EventRegistrationRepository;
use App\Repository\MasterclassRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Stripe\Webhook;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Webhook Stripe : source de vérité des paiements.
 *
 * Règle de réponse : Stripe réessaie pendant 3 jours toute réponse non-2xx.
 * On ne renvoie donc une erreur que si un nouvel essai peut réussir (signature,
 * erreur serveur). Les cas définitifs (métadonnées absentes, utilisateur supprimé…)
 * sont journalisés et acquittés en 200.
 */
class StripeWebhookController extends AbstractController
{
    private const MASTERCLASS_OPTIONS = ['pdf' => 'Format PDF', 'video' => 'Format Vidéo', 'pack' => 'Pack Complet (Vidéo + PDF)'];

    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly UserRepository $userRepository,
        private readonly MasterclassRepository $masterclassRepository,
        private readonly EventRegistrationRepository $eventRegRepository,
        private readonly EntityManagerInterface $em,
        private readonly MailerInterface $mailer,
    ) {}

    #[Route('/api/stripe/webhook', name: 'api_stripe_webhook', methods: ['POST'])]
    public function handleWebhook(Request $request): Response
    {
        $webhookSecret = $_ENV['STRIPE_WEBHOOK_SECRET'] ?? null;
        if (!$webhookSecret) {
            $this->logger->critical('Webhook Stripe reçu mais STRIPE_WEBHOOK_SECRET n\'est pas configuré.');
            return new Response('Webhook non configuré.', 500);
        }

        try {
            $event = Webhook::constructEvent(
                $request->getContent(),
                (string) $request->headers->get('Stripe-Signature'),
                $webhookSecret
            );
        } catch (\Throwable) {
            return new Response('Webhook signature invalide.', 400);
        }

        $session = $event->data->object;

        return match ($event->type) {
            'checkout.session.completed',
            'checkout.session.async_payment_succeeded' => $this->handleCompleted($session),
            'checkout.session.expired'                 => $this->handleExpired($session),
            default                                    => new Response('Ignoré', 200),
        };
    }

    private function handleCompleted(object $session): Response
    {
        // Moyens de paiement différés : on attend "async_payment_succeeded"
        if (($session->payment_status ?? null) !== 'paid') {
            return new Response('Paiement en attente', 200);
        }

        $metadata  = $session->metadata;
        $userEmail = $metadata->user_email ?? null;

        if (!$userEmail) {
            $this->logger->warning('Webhook Stripe : user_email absent des métadonnées', ['session_id' => $session->id]);
            return new Response('Ignoré (métadonnées)', 200);
        }

        $user = $this->userRepository->findOneBy(['email' => $userEmail]);
        if (!$user) {
            // Paiement encaissé pour un compte introuvable : nécessite une action manuelle (remboursement…)
            $this->logger->critical('Webhook Stripe : paiement reçu pour un utilisateur introuvable', [
                'session_id' => $session->id,
                'user_email' => $userEmail,
            ]);
            return new Response('Ignoré (utilisateur)', 200);
        }

        if (!empty($metadata->event_id)) {
            return $this->grantEvent($session, $user, (int) $metadata->event_id);
        }

        if (!empty($metadata->formation_id)) {
            return $this->grantFormation($session, $user, (int) $metadata->formation_id);
        }

        if (!empty($metadata->masterclass_id)) {
            return $this->grantMasterclass($session, $user, (int) $metadata->masterclass_id, $metadata->option ?? null);
        }

        $this->logger->warning('Webhook Stripe : type d\'achat inconnu', ['session_id' => $session->id]);
        return new Response('Ignoré (type)', 200);
    }

    /**
     * Session abandonnée : libère la place réservée si l'inscription est toujours en attente.
     */
    private function handleExpired(object $session): Response
    {
        $registration = $this->eventRegRepository->findOneBy(['stripeSessionId' => $session->id]);

        if ($registration && $registration->getStatus() === EventRegistration::STATUS_PENDING) {
            $this->em->remove($registration);
            $this->em->flush();
        }

        return new Response('OK', 200);
    }

    private function grantEvent(object $session, User $user, int $eventId): Response
    {
        $eventEntity = $this->em->find(Event::class, $eventId);
        if (!$eventEntity) {
            $this->logger->critical('Webhook Stripe : paiement reçu pour un événement introuvable', ['session_id' => $session->id, 'event_id' => $eventId]);
            return new Response('Ignoré (événement)', 200);
        }

        $reg = $this->eventRegRepository->findOneBy(['event' => $eventEntity, 'user' => $user]);
        if (!$reg) {
            $reg = (new EventRegistration())->setEvent($eventEntity)->setUser($user);
            $this->em->persist($reg);
        }

        // Idempotent avec /api/stripe/confirm/event : un seul email
        $alreadyPaid = $reg->getStatus() === EventRegistration::STATUS_PAID;

        $reg->setStatus(EventRegistration::STATUS_PAID);
        $reg->setStripeSessionId($session->id);
        $this->em->flush();

        if (!$alreadyPaid) {
            $this->sendMail(
                $user,
                'Paiement confirmé — ' . $eventEntity->getTitle(),
                '<h2 style="color:#0F291E;">Inscription confirmée !</h2>' .
                '<p>Bonjour <strong>' . $this->e($this->displayName($user)) . '</strong>,</p>' .
                '<p>Votre inscription payante à <strong>' . $this->e($eventEntity->getTitle()) . '</strong> a été confirmée.</p>' .
                '<p>📅 ' . $eventEntity->getStartDate()->format('d/m/Y à H:i') . '</p>' .
                '<p>📍 ' . $this->e($eventEntity->getLocation()) . '</p>' .
                $this->button('/evenements/' . $eventEntity->getId(), 'Voir l\'événement')
            );
        }

        return new Response('OK', 200);
    }

    private function grantFormation(object $session, User $user, int $formationId): Response
    {
        $formation = $this->em->find(Formation::class, $formationId);
        if (!$formation) {
            $this->logger->critical('Webhook Stripe : paiement reçu pour une formation introuvable', ['session_id' => $session->id, 'formation_id' => $formationId]);
            return new Response('Ignoré (formation)', 200);
        }

        if (!$user->getFormations()->contains($formation)) {
            $user->addFormation($formation);
            $this->em->flush();
        }

        return new Response('OK', 200);
    }

    private function grantMasterclass(object $session, User $user, int $masterclassId, ?string $option): Response
    {
        if (!isset(self::MASTERCLASS_OPTIONS[$option])) {
            $this->logger->warning('Webhook Stripe : option de masterclass invalide', ['session_id' => $session->id, 'option' => $option]);
            return new Response('Ignoré (option)', 200);
        }

        $masterclass = $this->masterclassRepository->find($masterclassId);
        if (!$masterclass) {
            $this->logger->critical('Webhook Stripe : paiement reçu pour une masterclass introuvable', ['session_id' => $session->id, 'masterclass_id' => $masterclassId]);
            return new Response('Ignoré (masterclass)', 200);
        }

        $existing = $this->em->getRepository(MasterclassPurchase::class)->findOneBy([
            'user' => $user, 'masterclass' => $masterclass, 'option' => $option,
        ]);

        if ($existing) {
            return new Response('OK', 200);
        }

        $purchase = new MasterclassPurchase();
        $purchase->setUser($user);
        $purchase->setMasterclass($masterclass);
        $purchase->setOption($option);
        $purchase->setCreatedAt(new \DateTimeImmutable());
        $this->em->persist($purchase);

        if (!$user->getMasterclasses()->contains($masterclass)) {
            $user->addMasterclass($masterclass);
        }

        $this->em->flush();

        $this->sendMail(
            $user,
            'Confirmation d\'achat — ' . $masterclass->getTitle(),
            '<h2 style="color:#0F291E;">Merci pour votre achat !</h2>' .
            '<p>Bonjour <strong>' . $this->e($this->displayName($user)) . '</strong>,</p>' .
            '<p>Votre achat de <strong>' . $this->e($masterclass->getTitle()) . '</strong> (' . $this->e(self::MASTERCLASS_OPTIONS[$option]) . ') a bien été enregistré.</p>' .
            $this->button('/dashboard', 'Accéder à ma masterclass') .
            '<p style="color:#aaa;font-size:12px;margin-top:24px;">Cet email est un justificatif d\'achat. Conservez-le pour vos archives.</p>'
        );

        return new Response('OK', 200);
    }

    private function sendMail(User $user, string $subject, string $body): void
    {
        try {
            $this->mailer->send((new Email())
                ->from('noreply@academie-esic.fr')
                ->to($user->getEmail())
                ->subject($subject)
                ->html('<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;color:#1C2C24;">' . $body . '</div>'));
        } catch (\Throwable $e) {
            $this->logger->error('Webhook Stripe : email de confirmation non envoyé', ['error' => $e->getMessage()]);
        }
    }

    private function button(string $path, string $label): string
    {
        $url = ($_ENV['FRONTEND_URL'] ?? '') . $path;

        return '<p><a href="' . $this->e($url) . '" style="display:inline-block;background:#0F291E;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">' . $this->e($label) . '</a></p>';
    }

    private function displayName(User $user): string
    {
        return trim(($user->getFirstName() ?? '') . ' ' . ($user->getLastName() ?? '')) ?: $user->getEmail();
    }

    private function e(?string $value): string
    {
        return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
    }
}
