<?php

namespace App\Controller;

use App\Entity\Masterclass;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;

class StripeController extends AbstractController
{
    // On passe l'ID et l'option dans l'URL : /api/stripe/checkout/5/pack
    #[Route('/api/stripe/checkout/{id}/{option}', name: 'api_stripe_checkout', methods: ['POST'])]
    public function createCheckoutSession(Masterclass $masterclass, string $option): JsonResponse
    {
        Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);

        // 1. On détermine le prix et le nom du produit selon l'option sélectionnée
        $price = 0;
        $nomOption = "";

        switch ($option) {
            Case 'pdf':
                $price = $masterclass->getPricePdf();
                $nomOption = " [Format PDF]";
                Break;
            Case 'video':
                $price = $masterclass->getPriceVideo();
                $nomOption = " [Format Vidéo]";
                Break;
            Case 'pack':
                $price = $masterclass->getPricePack();
                $nomOption = " [Pack Complet : Vidéo + PDF]";
                Break;
            Default:
                Return new JsonResponse(['error' => 'Option invalide'], 400);
        }

        $priceInCentimes = (int)($price * 100);

        try {
            $session = Session::create([
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
                'metadata' => [
                    'user_email'     => $this->getUser()->getUserIdentifier(),
                    'masterclass_id' => $masterclass->getId(),
                    'option'         => $option,
                ],
                'success_url' => ($_ENV['FRONTEND_URL'] ?? '') . '/masterclass?success=true&session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => ($_ENV['FRONTEND_URL'] ?? '') . '/masterclass?canceled=true',
            ]);

            Return new JsonResponse(['url' => $session->url]);

        } catch (\Exception $e) {
            Return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }
}