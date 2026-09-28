<?php

namespace App\Mailer;

use App\Entity\Event;
use App\Entity\Payment;
use App\Entity\User;
use App\Legal\SalesTerms;
use Psr\Log\LoggerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;

/**
 * Emails transactionnels (templates Twig dans templates/emails/, échappement automatique).
 * Un échec d'envoi est journalisé mais ne bloque jamais l'action métier.
 */
class AppMailer
{
    public function __construct(
        private readonly MailerInterface $mailer,
        private readonly LoggerInterface $logger,
        #[Autowire('%env(FRONTEND_URL)%')] private readonly string $frontendUrl,
        #[Autowire('%env(default:mailer_from_default:MAILER_FROM)%')] private readonly string $from,
    ) {}

    public function sendEventConfirmation(User $user, Event $event, bool $paid): void
    {
        $this->send(
            $user->getEmail(),
            ($paid ? 'Paiement confirmé — ' : 'Inscription confirmée — ') . $event->getTitle(),
            'emails/event_confirmation.html.twig',
            [
                'display_name' => $this->displayName($user),
                'event'        => $event,
                'paid'         => $paid,
                'cta_url'      => $this->url('/evenements/' . $event->getId()),
                'cta_label'    => 'Voir l\'événement',
            ]
        );
    }

    public function sendPurchaseConfirmation(Payment $payment): void
    {
        $user = $payment->getUser();

        // Confirmation sur support durable (CGV, articles 7 et 10) : récapitulatif, conditions
        // acceptées et, le cas échéant, demande d'accès immédiat avec renonciation à la rétractation
        $this->send(
            $user->getEmail(),
            'Confirmation de votre commande – Académie E.S.I.C.',
            'emails/purchase_confirmation.html.twig',
            [
                'display_name'      => $this->displayName($user),
                'payment'           => $payment,
                'cta_url'           => $this->url('/dashboard'),
                'cta_label'         => 'Accéder à mon espace personnel',
                'cgv_url'           => $this->url('/cgv'),
                'consent_statement' => SalesTerms::IMMEDIATE_ACCESS_CONSENT,
            ]
        );
    }

    public function sendPasswordReset(string $email, string $token): void
    {
        $this->send(
            $email,
            'Réinitialisation de votre mot de passe – Académie E.S.I.C.',
            'emails/reset_password.html.twig',
            [
                'cta_url'   => $this->url('/reset-password?token=' . $token),
                'cta_label' => 'Réinitialiser mon mot de passe',
            ]
        );
    }

    /**
     * @param array<string, mixed> $context
     */
    private function send(string $to, string $subject, string $template, array $context): void
    {
        try {
            $this->mailer->send(
                (new TemplatedEmail())
                    ->from(new Address($this->from, 'Académie E.S.I.C.'))
                    ->to($to)
                    ->subject($subject)
                    ->htmlTemplate($template)
                    ->context($context)
            );
        } catch (\Throwable $e) {
            $this->logger->error('Email non envoyé', ['template' => $template, 'error' => $e->getMessage()]);
        }
    }

    private function url(string $path): string
    {
        return rtrim($this->frontendUrl, '/') . $path;
    }

    private function displayName(User $user): string
    {
        return trim(($user->getFirstName() ?? '') . ' ' . ($user->getLastName() ?? '')) ?: (string) $user->getEmail();
    }
}
