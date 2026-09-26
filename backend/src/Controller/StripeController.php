<?php

namespace App\Controller;

use App\Entity\Masterclass;
use Psr\Log\LoggerInterface;
use Stripe\StripeClient;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class StripeController extends AbstractController
{
    // On passe l'ID et l'option dans l'URL : /api/stripe/checkout/5/pack
    #[Route('/api/stripe/checkout/{id}/{option}', name: 'api_stripe_checkout', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function createCheckoutSession(Masterclass $masterclass, string $option, LoggerInterface $logger): JsonResponse
    {
        $securityUser = $this->getUser();
        if (!$securityUser) {
            return $this->json(['error' => 'Veuillez vous connecter.'], 401);
        }

        $stripeSecret = $_ENV['STRIPE_SECRET'] ?? $_ENV['STRIPE_SECRET_KEY'] ?? null;
        if (!$stripeSecret) {
            return $this->json(['error' => 'Le paiement en ligne est momentanément indisponible.'], 503);
        }

        // 1. On détermine le prix et le nom du produit selon l'option sélectionnée
        [$price, $nomOption] = match ($option) {
            'pdf'   => [$masterclass->getPricePdf(), ' [Format PDF]'],
            'video' => [$masterclass->getPriceVideo(), ' [Format Vidéo]'],
            'pack'  => [$masterclass->getPricePack(), ' [Pack Complet : Vidéo + PDF]'],
            default => [null, null],
        };

        if ($nomOption === null) {
            return $this->json(['error' => 'Option invalide'], 400);
        }

        // round() : évite la perte d'un centime (19.99 * 100 = 1998.999…)
        $priceInCentimes = (int) round((float) $price * 100);
        if ($priceInCentimes <= 0) {
            return $this->json(['error' => 'Cette option n\'est pas disponible à l\'achat.'], 400);
        }

        try {
            $session = (new StripeClient($stripeSecret))->checkout->sessions->create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'eur',
                        'product_data' => [
                            'name' => $masterclass->getTitle() . $nomOption,
                            'description' => 'Accès exclusif aux ressources de la masterclass.',
                        ],
                        'unit_amount' => $priceInCentimes,
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'customer_email' => $securityUser->getUserIdentifier(),
                'metadata' => [
                    'user_email'     => $securityUser->getUserIdentifier(),
                    'masterclass_id' => $masterclass->getId(),
                    'option'         => $option,
                ],
                'success_url' => ($_ENV['FRONTEND_URL'] ?? '') . '/masterclass?success=true&session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => ($_ENV['FRONTEND_URL'] ?? '') . '/masterclass?canceled=true',
            ]);

            return $this->json(['url' => $session->url]);
        } catch (\Throwable $e) {
            $logger->error('Stripe : création de session masterclass impossible', [
                'masterclass_id' => $masterclass->getId(),
                'option'         => $option,
                'error'          => $e->getMessage(),
            ]);

            return $this->json(['error' => 'Impossible d\'initialiser le paiement. Réessayez dans quelques instants.'], 502);
        }
    }
}
