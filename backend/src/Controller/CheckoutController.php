<?php

namespace App\Controller;

use App\Entity\Formation;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Stripe\StripeClient;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckoutController extends AbstractController
{
    #[Route('/api/checkout/{id}', name: 'api_checkout', methods: ['POST'])]
    public function simulatePurchase(
        Formation $formation, 
        EntityManagerInterface $em, 
        UserRepository $userRepository
    ): JsonResponse {
        
        $securityUser = $this->getUser();
        if (!$securityUser) {
            return $this->json(['message' => 'Veuillez vous connecter.'], 401);
        }

        // 1. On va chercher le VRAI utilisateur suivi par Doctrine
        $realUser = $userRepository->findOneBy(['email' => $securityUser->getUserIdentifier()]);
        
        if (!$realUser) {
            return $this->json(['message' => 'Utilisateur introuvable en base.'], 404);
        }

        // 2. On lie la formation au vrai utilisateur
        $realUser->addFormation($formation);

        // 3. Doctrine voit enfin la modification et l'écrit !
        $em->flush();

        return $this->json([
            'success' => true,
            'message' => 'Achat simulé et formation ajoutée au compte !'
        ]);
    }

    #[Route('/api/stripe/checkout/formation/{id}', name: 'api_stripe_checkout_formation', methods: ['POST'])]
    public function createFormationCheckout(
        Formation $formation,
        Request $request
    ): JsonResponse {
        $securityUser = $this->getUser();
        if (!$securityUser) {
            return $this->json(['message' => 'Veuillez vous connecter.'], 401);
        }

        $stripeSecret = $_ENV['STRIPE_SECRET'] ?? $_ENV['STRIPE_SECRET_KEY'] ?? null;
        if (!$stripeSecret) {
            return $this->json(['message' => 'Stripe non configuré.'], 500);
        }

        $client = new StripeClient($stripeSecret);

        $price = (int) round($formation->getPrice() * 100);

        try {
            $session = $client->checkout->sessions->create([
                'payment_method_types' => ['card'],
                'mode' => $price > 0 ? 'payment' : 'subscription',
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'eur',
                        'product_data' => ['name' => $formation->getTitle()],
                        'unit_amount' => $price,
                    ],
                    'quantity' => 1,
                ]],
                'customer_email' => $securityUser->getUserIdentifier(),
                'metadata' => [
                    'formation_id' => (string) $formation->getId(),
                    'user_email' => $securityUser->getUserIdentifier(),
                ],
                'success_url' => ($_ENV['FRONTEND_URL'] ?? '') . '/dashboard?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => ($_ENV['FRONTEND_URL'] ?? '') . '/formations/' . $formation->getId(),
                'metadata' => [
                    'formation_id' => (string) $formation->getId(),
                    'user_email' => $securityUser->getUserIdentifier(),
                ],
            ]);

            return $this->json(['url' => $session->url]);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Erreur Stripe: ' . $e->getMessage()], 500);
        }
    }
}