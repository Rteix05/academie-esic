<?php

namespace App\Controller;

use App\Entity\MasterclassPurchase;
use App\Entity\EventRegistration;
use App\Repository\EventRegistrationRepository;
use App\Repository\MasterclassRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Stripe\Stripe;
use Stripe\Webhook;
use Stripe\StripeClient;
use App\Repository\FormationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Annotation\Route;

class StripeWebhookController extends AbstractController
{
    #[Route('/api/stripe/webhook', name: 'api_stripe_webhook', methods: ['POST'])]
    public function handleWebhook(
        Request $request,
        UserRepository $userRepository,
        MasterclassRepository $masterclassRepository,
        EventRegistrationRepository $eventRegRepository,
        EntityManagerInterface $em,
        MailerInterface $mailer
    ): Response {
        $payload   = $request->getContent();
        $sigHeader = $request->headers->get('Stripe-Signature');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $_ENV['STRIPE_WEBHOOK_SECRET']);
        } catch (\Exception $e) {
            return new Response('Webhook signature invalide.', 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session   = $event->data->object;
            $metadata  = $session->metadata;
            $userEmail = $metadata->user_email ?? null;
            $frontendUrl = $_ENV['FRONTEND_URL'] ?? '';

            if (!$userEmail) {
                return new Response('Métadonnées manquantes.', 400);
            }

            $user = $userRepository->findOneBy(['email' => $userEmail]);
            if (!$user) {
                return new Response('Utilisateur introuvable.', 404);
            }

            $displayName = trim(($user->getFirstName() ?? '') . ' ' . ($user->getLastName() ?? '')) ?: $user->getEmail();

            // ── Événement payant ────────────────────────────────────────────
            if (!empty($metadata->event_id)) {
                $eventId = (int) $metadata->event_id;
                $eventEntity = $em->find(\App\Entity\Event::class, $eventId);

                if ($eventEntity) {
                    $reg = $eventRegRepository->findOneBy(['event' => $eventEntity, 'user' => $user]);
                    if (!$reg) {
                        $reg = new EventRegistration();
                        $reg->setEvent($eventEntity);
                        $reg->setUser($user);
                        $em->persist($reg);
                    }
                    $reg->setStatus('paid');
                    $reg->setStripeSessionId($session->id);
                    $em->flush();

                    try {
                        $mail = (new Email())
                            ->from('noreply@academie-esic.fr')
                            ->to($user->getEmail())
                            ->subject('Paiement confirmé — ' . $eventEntity->getTitle())
                            ->html(
                                '<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;color:#1C2C24;">' .
                                '<h2 style="color:#0F291E;">Inscription confirmée !</h2>' .
                                '<p>Bonjour <strong>' . htmlspecialchars($displayName, ENT_QUOTES, 'UTF-8') . '</strong>,</p>' .
                                '<p>Votre inscription payante à <strong>' . htmlspecialchars($eventEntity->getTitle(), ENT_QUOTES, 'UTF-8') . '</strong> a été confirmée.</p>' .
                                '<p>📅 ' . $eventEntity->getStartDate()->format('d/m/Y à H:i') . '</p>' .
                                '<p>📍 ' . htmlspecialchars($eventEntity->getLocation(), ENT_QUOTES, 'UTF-8') . '</p>' .
                                '<p><a href="' . $frontendUrl . '/evenements/' . $eventEntity->getId() . '" style="display:inline-block;background:#0F291E;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Voir l\'événement</a></p>' .
                                '</div>'
                            );
                        $mailer->send($mail);
                    } catch (\Exception) {}
                }

                return new Response('OK', 200);
            }

            // ── Formation ───────────────────────────────────────────────────
            if (!empty($metadata->formation_id)) {
                $formationId = (int) $metadata->formation_id;
                $formation = $em->find(\App\Entity\Formation::class, $formationId);

                if ($formation && !$user->getFormations()->contains($formation)) {
                    $user->addFormation($formation);
                    $em->flush();
                }

                return new Response('OK', 200);
            }

            // ── Masterclass ─────────────────────────────────────────────────
            $masterclassId = $metadata->masterclass_id ?? null;
            $option        = $metadata->option         ?? null;

            if (!$masterclassId || !$option) {
                return new Response('Métadonnées manquantes.', 400);
            }

            $masterclass = $masterclassRepository->find($masterclassId);
            if (!$masterclass) {
                return new Response('Masterclass introuvable.', 404);
            }

            $existing = $em->getRepository(MasterclassPurchase::class)->findOneBy([
                'user' => $user, 'masterclass' => $masterclass, 'option' => $option,
            ]);

            if (!$existing) {
                $purchase = new MasterclassPurchase();
                $purchase->setUser($user);
                $purchase->setMasterclass($masterclass);
                $purchase->setOption($option);
                $purchase->setCreatedAt(new \DateTimeImmutable());
                $em->persist($purchase);

                if (!$user->getMasterclasses()->contains($masterclass)) {
                    $user->addMasterclass($masterclass);
                }

                $em->flush();

                $optionLabels = ['pdf' => 'Format PDF', 'video' => 'Format Vidéo', 'pack' => 'Pack Complet (Vidéo + PDF)'];
                $optionLabel  = $optionLabels[$option] ?? $option;

                try {
                    $mail = (new Email())
                        ->from('noreply@academie-esic.fr')
                        ->to($user->getEmail())
                        ->subject('Confirmation d\'achat — ' . $masterclass->getTitle())
                        ->html(
                            '<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;color:#1C2C24;">' .
                            '<h2 style="color:#0F291E;">Merci pour votre achat !</h2>' .
                            '<p>Bonjour <strong>' . htmlspecialchars($displayName, ENT_QUOTES, 'UTF-8') . '</strong>,</p>' .
                            '<p>Votre achat de <strong>' . htmlspecialchars($masterclass->getTitle(), ENT_QUOTES, 'UTF-8') . '</strong> (' . htmlspecialchars($optionLabel, ENT_QUOTES, 'UTF-8') . ') a bien été enregistré.</p>' .
                            '<p><a href="' . $frontendUrl . '/dashboard" style="display:inline-block;background:#0F291E;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Accéder à ma masterclass</a></p>' .
                            '<p style="color:#aaa;font-size:12px;margin-top:24px;">Cet email est un justificatif d\'achat. Conservez-le pour vos archives.</p>' .
                            '</div>'
                        );
                    $mailer->send($mail);
                } catch (\Exception) {}
            }
        }

        return new Response('OK', 200);
    }

    #[Route('/api/stripe/confirm', name: 'api_stripe_confirm', methods: ['POST'])]
    public function confirmSession(
        Request $request,
        UserRepository $userRepository,
        MasterclassRepository $masterclassRepository,
        FormationRepository $formationRepository,
        EntityManagerInterface $em
    ): Response {
        $data = json_decode($request->getContent() ?: '{}', true);
        $sessionId = $data['session_id'] ?? null;

        if (!$sessionId) {
            return new Response('session_id manquant.', 400);
        }

        $stripeSecret = $_ENV['STRIPE_SECRET'] ?? $_ENV['STRIPE_SECRET_KEY'] ?? null;
        if (!$stripeSecret) {
            return new Response('Stripe non configuré.', 500);
        }

        $client = new StripeClient($stripeSecret);

        try {
            $session = $client->checkout->sessions->retrieve($sessionId, []);
        } catch (\Exception $e) {
            return new Response('Impossible de récupérer la session Stripe: ' . $e->getMessage(), 400);
        }

        if (($session->payment_status ?? null) !== 'paid' && ($session->status ?? null) !== 'complete') {
            return new Response('Paiement non confirmé.', 400);
        }

        $metadata = $session->metadata ?? [];
        $user = $this->getUser();

        if (!$user) {
            // fallback to customer_email metadata
            $email = $metadata->user_email ?? $session->customer_details->email ?? null;
            if ($email) {
                $user = $userRepository->findOneBy(['email' => $email]);
            }
        }

        if (!$user) {
            return new Response('Utilisateur introuvable.', 404);
        }

        // Handle formation purchase
        if (!empty($metadata->formation_id ?? $metadata['formation_id'] ?? null)) {
            $formationId = (int) ($metadata->formation_id ?? $metadata['formation_id']);
            $formation = $formationRepository->find($formationId);
            if ($formation) {
                if (!$user->getFormations()->contains($formation)) {
                    $user->addFormation($formation);
                    $em->flush();
                }
                return new Response('Formation ajoutée.', 200);
            }
            return new Response('Formation introuvable.', 404);
        }

        // Handle masterclass as before if present
        if (!empty($metadata->masterclass_id ?? $metadata['masterclass_id'] ?? null)) {
            $masterclassId = (int) ($metadata->masterclass_id ?? $metadata['masterclass_id']);
            $masterclass = $masterclassRepository->find($masterclassId);
            if ($masterclass) {
                if (!$user->getMasterclasses()->contains($masterclass)) {
                    $user->addMasterclass($masterclass);
                    $em->flush();
                }
                return new Response('Masterclass ajoutée.', 200);
            }
            return new Response('Masterclass introuvable.', 404);
        }

        return new Response('Métadonnées inconnues.', 400);
    }
}
