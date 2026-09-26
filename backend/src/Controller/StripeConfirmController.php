<?php

namespace App\Controller;

use App\Entity\MasterclassPurchase;
use App\Entity\User;
use App\Repository\FormationRepository;
use App\Repository\MasterclassRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Stripe\StripeClient;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Confirmation côté client d'un paiement Stripe (formation ou masterclass),
 * appelée par PaymentSuccessPopup au retour de Stripe. Le webhook reste la
 * source de vérité ; cet endpoint est idempotent avec lui.
 */
class StripeConfirmController extends AbstractController
{
    private const MASTERCLASS_OPTIONS = ['pdf', 'video', 'pack'];

    #[Route('/api/stripe/confirm', name: 'api_stripe_confirm', methods: ['POST'])]
    public function confirm(
        Request $request,
        MasterclassRepository $masterclassRepository,
        FormationRepository $formationRepository,
        EntityManagerInterface $em,
        LoggerInterface $logger
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        $body      = json_decode($request->getContent() ?: '{}', true);
        $sessionId = is_array($body) ? ($body['session_id'] ?? null) : null;

        if (!is_string($sessionId) || $sessionId === '') {
            return $this->json(['message' => 'session_id manquant.'], 400);
        }

        $stripeSecret = $_ENV['STRIPE_SECRET'] ?? $_ENV['STRIPE_SECRET_KEY'] ?? null;
        if (!$stripeSecret) {
            return $this->json(['message' => 'Stripe non configuré.'], 500);
        }

        try {
            $session = (new StripeClient($stripeSecret))->checkout->sessions->retrieve($sessionId);
        } catch (\Throwable $e) {
            $logger->warning('Stripe confirm: session introuvable', ['session_id' => $sessionId, 'error' => $e->getMessage()]);
            return $this->json(['message' => 'Session de paiement invalide.'], 400);
        }

        if ($session->payment_status !== 'paid') {
            return $this->json(['message' => 'Paiement non complété.'], 402);
        }

        $metadata = $session->metadata ? $session->metadata->toArray() : [];

        // La session doit appartenir à l'utilisateur connecté : empêche de
        // rejouer le session_id d'un autre compte pour débloquer du contenu.
        $ownerEmail = $metadata['user_email'] ?? null;
        if (!$ownerEmail || strcasecmp($ownerEmail, $user->getUserIdentifier()) !== 0) {
            return $this->json(['message' => 'Cette session de paiement ne vous appartient pas.'], 403);
        }

        // ── Formation ─────────────────────────────────────────────────────
        if (!empty($metadata['formation_id'])) {
            $formation = $formationRepository->find((int) $metadata['formation_id']);
            if (!$formation) {
                return $this->json(['message' => 'Formation introuvable.'], 404);
            }

            if (!$user->getFormations()->contains($formation)) {
                $user->addFormation($formation);
                $em->flush();
            }

            return $this->json(['success' => true, 'formationId' => $formation->getId()]);
        }

        // ── Masterclass ───────────────────────────────────────────────────
        if (!empty($metadata['masterclass_id'])) {
            $option = $metadata['option'] ?? null;
            if (!in_array($option, self::MASTERCLASS_OPTIONS, true)) {
                return $this->json(['message' => 'Option d\'achat invalide.'], 400);
            }

            $masterclass = $masterclassRepository->find((int) $metadata['masterclass_id']);
            if (!$masterclass) {
                return $this->json(['message' => 'Masterclass introuvable.'], 404);
            }

            $existing = $em->getRepository(MasterclassPurchase::class)->findOneBy([
                'user'        => $user,
                'masterclass' => $masterclass,
                'option'      => $option,
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
            }

            return $this->json([
                'success'       => true,
                'masterclassId' => $masterclass->getId(),
                'option'        => $option,
            ]);
        }

        // Ni formation ni masterclass (ex. événement) : le front bascule sur /api/stripe/confirm/event
        return $this->json(['message' => 'Type d\'achat non géré par cet endpoint.'], 400);
    }
}
