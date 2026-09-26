<?php

namespace App\Controller;

use App\Entity\Formation;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Stripe\StripeClient;
use Symfony\Component\HttpFoundation\Request;

class CheckoutController extends AbstractController
{
    #[Route('/api/stripe/checkout/formation/{id}', name: 'api_stripe_checkout_formation', methods: ['POST'])]
    public function createFormationCheckout(
        Formation $formation,
        Request $request,
        LoggerInterface $logger
    ): JsonResponse {
        $securityUser = $this->getUser();
        if (!$securityUser) {
            return $this->json(['message' => 'Veuillez vous connecter.'], 401);
        }

        $stripeSecret = $_ENV['STRIPE_SECRET'] ?? $_ENV['STRIPE_SECRET_KEY'] ?? null;
        if (!$stripeSecret) {
            return $this->json(['message' => 'Stripe non configuré.'], 500);
        }

        if (!$formation->isPublished()) {
            return $this->json(['message' => 'Formation non disponible.'], 404);
        }

        $client = new StripeClient($stripeSecret);

        $price = (int) round($formation->getPrice() * 100);

        // Formation gratuite : pas de paiement, inscription directe via /api/formations/{id}/enroll
        if ($price <= 0) {
            return $this->json([
                'message'  => 'Cette formation est gratuite : inscrivez-vous directement.',
                'enrollUrl' => '/api/formations/' . $formation->getId() . '/enroll',
            ], 400);
        }

        try {
            $session = $client->checkout->sessions->create([
                'payment_method_types' => ['card'],
                'mode' => 'payment',
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'eur',
                        'product_data' => ['name' => $formation->getTitle()],
                        'unit_amount' => $price,
                    ],
                    'quantity' => 1,
                ]],
                'customer_email' => $securityUser->getUserIdentifier(),
                'success_url' => ($_ENV['FRONTEND_URL'] ?? '') . '/dashboard?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => ($_ENV['FRONTEND_URL'] ?? '') . '/formations/' . $formation->getId(),
                'metadata' => [
                    'formation_id' => (string) $formation->getId(),
                    'user_email' => $securityUser->getUserIdentifier(),
                ],
            ]);

            return $this->json(['url' => $session->url]);
        } catch (\Throwable $e) {
            $logger->error('Stripe : création de session formation impossible', [
                'formation_id' => $formation->getId(),
                'error'        => $e->getMessage(),
            ]);

            return $this->json(['message' => 'Impossible d\'initialiser le paiement. Réessayez dans quelques instants.'], 502);
        }
    }
}
