<?php

namespace App\Mailer;

use App\Entity\Event;
use App\Entity\Formation;
use App\Entity\Payment;
use App\Entity\User;
use App\Legal\SalesTerms;
use Psr\Log\LoggerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;

/**
 * Emails transactionnels envoyés depuis l'adresse noreply (templates Twig dans templates/emails/,
 * gabarit commun layout.html.twig, échappement automatique).
 *
 * Chaque envoi fournit le bandeau de l'email (étiquette, titre, informations clés) ; le gabarit
 * reçoit en plus l'adresse de contact et l'URL du site.
 * Un échec d'envoi est journalisé mais ne bloque jamais l'action métier.
 */
class AppMailer
{
    /** Sujets du formulaire de contact (valeurs identiques au <select> de la page /contact) */
    public const CONTACT_SUBJECTS = [
        'formation'   => 'Question sur une formation',
        'technique'   => 'Problème technique',
        'partenariat' => 'Partenariat',
        'autre'       => 'Autre',
    ];

    public function __construct(
        private readonly MailerInterface $mailer,
        private readonly LoggerInterface $logger,
        #[Autowire('%env(FRONTEND_URL)%')] private readonly string $frontendUrl,
        #[Autowire('%env(default:mailer_from_default:MAILER_FROM)%')] private readonly string $from,
        #[Autowire('%env(default:contact_email_default:CONTACT_EMAIL)%')] private readonly string $contactEmail,
    ) {}

    public function sendWelcome(User $user): void
    {
        $this->send($user->getEmail(), 'Bienvenue à l\'Académie E.S.I.C.', 'emails/welcome.html.twig', [
            'badge'      => 'Inscription',
            'hero_icon'  => 'sparkles',
            'hero_title' => 'Bienvenue à l\'Académie',
            'hero_text'  => 'Votre compte est créé : vos formations et masterclass vous attendent.',
            'account_email' => $user->getEmail(),
            'cta_url'    => $this->url('/formations'),
            'cta_label'  => 'Découvrir les formations',
        ]);
    }

    public function sendEnrollmentConfirmation(User $user, Formation $formation): void
    {
        $this->send($user->getEmail(), 'Inscription confirmée — ' . $formation->getTitle(), 'emails/enrollment_confirmation.html.twig', [
            'badge'        => 'Formation',
            'hero_icon'    => 'graduation-cap',
            'hero_title'   => 'Votre inscription est confirmée',
            'hero_text'    => 'La formation est disponible dans votre espace personnel.',
            'hero_meta'    => [['label' => 'Formation', 'value' => (string) $formation->getTitle()]],
            'display_name' => $this->displayName($user),
            'formation'    => $formation,
            'cta_url'      => $this->url('/dashboard'),
            'cta_label'    => 'Commencer la formation',
        ]);
    }

    public function sendPurchaseConfirmation(Payment $payment): void
    {
        $user = $payment->getUser();
        $reference = $payment->getStripeSessionId() ? strtoupper(substr($payment->getStripeSessionId(), -10)) : '#' . $payment->getId();

        // Confirmation sur support durable (CGV, articles 7 et 10) : récapitulatif, conditions
        // acceptées et, le cas échéant, demande d'accès immédiat avec renonciation à la rétractation
        $this->send($user->getEmail(), 'Confirmation de votre commande – Académie E.S.I.C.', 'emails/purchase_confirmation.html.twig', [
            'badge'             => 'Commande',
            'hero_icon'         => 'check',
            'hero_title'        => 'Votre commande est confirmée',
            'hero_text'         => 'Merci pour votre achat ! Votre contenu est déjà accessible.',
            'hero_meta'         => [
                ['label' => 'Référence', 'value' => $reference],
                ['label' => 'Total', 'value' => number_format($payment->getAmountCents() / 100, 2, ',', ' ') . ' ' . strtoupper($payment->getCurrency())],
            ],
            'display_name'      => $this->displayName($user),
            'payment'           => $payment,
            'reference'         => $reference,
            'cta_url'           => $this->url('/dashboard'),
            'cta_label'         => 'Accéder à mon espace personnel',
            'cgv_url'           => $this->url('/cgv'),
            'consent_statement' => SalesTerms::IMMEDIATE_ACCESS_CONSENT,
        ]);
    }

    public function sendPasswordReset(string $email, string $token): void
    {
        $this->send($email, 'Réinitialisation de votre mot de passe – Académie E.S.I.C.', 'emails/reset_password.html.twig', [
            'badge'      => 'Sécurité',
            'hero_icon'  => 'key-round',
            'hero_title' => 'Réinitialisez votre mot de passe',
            'hero_text'  => 'Une demande de nouveau mot de passe a été faite pour votre compte.',
            'cta_url'    => $this->url('/reset-password?token=' . $token),
            'cta_label'  => 'Choisir un nouveau mot de passe',
        ]);
    }

    public function sendEventConfirmation(User $user, Event $event, bool $paid): void
    {
        $this->send($user->getEmail(), ($paid ? 'Paiement confirmé — ' : 'Inscription confirmée — ') . $event->getTitle(), 'emails/event_confirmation.html.twig', [
            'badge'        => 'Événement',
            'hero_icon'    => 'calendar',
            'hero_title'   => $paid ? 'Votre place est réservée' : 'Votre inscription est confirmée',
            'hero_text'    => (string) $event->getTitle(),
            'hero_meta'    => [['label' => 'Date', 'value' => $event->getStartDate()?->format('d/m/Y à H:i') ?? '—']],
            'display_name' => $this->displayName($user),
            'event'        => $event,
            'paid'         => $paid,
            'cta_url'      => $this->url('/dashboard'),
            'cta_label'    => 'Voir mon espace',
        ]);
    }

    /**
     * Message du formulaire de contact : notification à l'Académie (réponse directe au visiteur)
     * et accusé de réception au visiteur.
     *
     * @param string|null $notificationTo destinataire de la notification (par défaut CONTACT_EMAIL ; prévisualisation uniquement)
     *
     * @return bool false si le message n'a pas pu être transmis à l'Académie
     */
    public function sendContactMessage(string $name, string $email, string $subjectKey, string $message, ?string $notificationTo = null): bool
    {
        $subjectLabel = self::CONTACT_SUBJECTS[$subjectKey] ?? self::CONTACT_SUBJECTS['autre'];
        $context = [
            'name'          => $name,
            'visitor_email' => $email,
            'subject_label' => $subjectLabel,
            'message'       => $message,
            'sent_at'       => new \DateTimeImmutable(),
        ];

        $delivered = $this->send($notificationTo ?? $this->contactEmail, '[Contact] ' . $subjectLabel . ' — ' . $name, 'emails/contact_notification.html.twig', $context + [
            'badge'      => 'Contact',
            'hero_icon'  => 'mail',
            'hero_title' => 'Nouveau message de contact',
            'hero_text'  => $name . ' vous a écrit depuis le site.',
            'hero_meta'  => [['label' => 'Sujet', 'value' => $subjectLabel]],
        ], replyTo: new Address($email, $name));

        $this->send($email, 'Nous avons bien reçu votre message – Académie E.S.I.C.', 'emails/contact_acknowledgement.html.twig', $context + [
            'badge'      => 'Contact',
            'hero_icon'  => 'mail',
            'hero_title' => 'Votre message est bien reçu',
            'hero_text'  => 'Nous vous répondrons dans les meilleurs délais.',
        ]);

        return $delivered;
    }

    /**
     * @param array<string, mixed> $context
     */
    private function send(string $to, string $subject, string $template, array $context, ?Address $replyTo = null): bool
    {
        try {
            $email = (new TemplatedEmail())
                ->from(new Address($this->from, 'Académie E.S.I.C.'))
                ->to($to)
                ->subject($subject)
                ->htmlTemplate($template)
                ->context($context + [
                    'contact_email' => $this->contactEmail,
                    'frontend_url'  => rtrim($this->frontendUrl, '/'),
                ]);
            if ($replyTo) {
                $email->replyTo($replyTo);
            }
            $this->mailer->send($email);

            return true;
        } catch (\Throwable $e) {
            $this->logger->error('Email non envoyé', ['template' => $template, 'error' => $e->getMessage()]);

            return false;
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
