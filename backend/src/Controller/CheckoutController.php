<?php

namespace App\Controller;

use App\Entity\Formation;
use App\Entity\Masterclass;
use App\Entity\MasterclassPurchase;
use App\Entity\User;
use App\Legal\SalesTerms;
use App\Payment\PurchaseFulfiller;
use App\Stripe\StripeGateway;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Création des sessions de paiement Stripe Checkout (formations et masterclasses).
 * L'attribution de l'achat est faite ensuite par PurchaseFulfiller (webhook / confirmation).
 *
 * Aucun paiement sans les deux consentements du client (CGV, articles 5 et 10) :
 * acceptation des CGV et demande expresse d'accès immédiat au contenu numérique.
 * Ils sont transmis dans les métadonnées de la session, puis enregistrés avec le paiement.
 */
class CheckoutController extends AbstractController
{
    public function __construct(
        private readonly StripeGateway $stripe,
        private readonly LoggerInterface $logger,
        #[Autowire('%env(FRONTEND_URL)%')] private readonly string $frontendUrl,
    ) {}

    #[Route('/api/stripe/checkout/formation/{id}', name: 'api_stripe_checkout_formation', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function formation(Formation $formation, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Veuillez vous connecter.'], 401);
        }

        if (!$formation->isPublished()) {
            return $this->json(['message' => 'Formation non disponible.'], 404);
        }

        if ($user->getFormations()->contains($formation)) {
            return $this->json(['message' => 'Vous possédez déjà cette formation.'], 409);
        }

        $price = (int) round((float) $formation->getPrice() * 100);

        // Formation gratuite : pas de paiement, inscription directe via /api/formations/{id}/enroll
        if ($price <= 0) {
            return $this->json([
                'message'   => 'Cette formation est gratuite : inscrivez-vous directement.',
                'enrollUrl' => '/api/formations/' . $formation->getId() . '/enroll',
            ], 400);
        }

        return $this->createSession(
            $request,
            $user,
            (string) $formation->getTitle(),
            null,
            $price,
            ['formation_id' => (string) $formation->getId()],
            '/dashboard?session_id={CHECKOUT_SESSION_ID}',
            '/formations/' . $formation->getId(),
        );
    }

    // L'option dans l'URL : /api/stripe/checkout/5/pack
    #[Route('/api/stripe/checkout/{id}/{option}', name: 'api_stripe_checkout', methods: ['POST'], requirements: ['id' => '\d+', 'option' => 'pdf|video|pack'])]
    public function masterclass(Masterclass $masterclass, string $option, EntityManagerInterface $em, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Veuillez vous connecter.'], 401);
        }

        $alreadyOwned = $em->getRepository(MasterclassPurchase::class)->findOneBy([
            'user' => $user, 'masterclass' => $masterclass, 'option' => $option,
        ]);
        if ($alreadyOwned) {
            return $this->json(['message' => 'Vous possédez déjà cette option.'], 409);
        }

        $price = match ($option) {
            'pdf'   => $masterclass->getPricePdf(),
            'video' => $masterclass->getPriceVideo(),
            'pack'  => $masterclass->getPricePack(),
        };

        // round() : évite la perte d'un centime (19.99 * 100 = 1998.999…)
        $priceInCentimes = (int) round((float) $price * 100);
        if ($priceInCentimes <= 0) {
            return $this->json(['message' => 'Cette option n\'est pas disponible à l\'achat.'], 400);
        }

        return $this->createSession(
            $request,
            $user,
            $masterclass->getTitle() . ' [' . PurchaseFulfiller::MASTERCLASS_OPTIONS[$option] . ']',
            'Accès exclusif aux ressources de la masterclass.',
            $priceInCentimes,
            ['masterclass_id' => (string) $masterclass->getId(), 'option' => $option],
            '/masterclass?success=true&session_id={CHECKOUT_SESSION_ID}',
            '/masterclass?canceled=true',
        );
    }

    /**
     * @param array<string, string> $metadata
     */
    private function createSession(Request $request, User $user, string $name, ?string $description, int $amountCents, array $metadata, string $successPath, string $cancelPath): JsonResponse
    {
        $missing = SalesTerms::missingConsents($request);
        if ($missing) {
            return $this->json(SalesTerms::missingConsentsResponse($missing), 422);
        }

        $metadata += SalesTerms::consentMetadata();

        if (!$this->stripe->isConfigured()) {
            return $this->json(['message' => 'Le paiement en ligne est momentanément indisponible.'], 503);
        }

        try {
            $session = $this->stripe->createCheckoutSession([
                'payment_method_types' => ['card'],
                'mode'                 => 'payment',
                'line_items'           => [[
                    'price_data' => [
                        'currency'     => 'eur',
                        'product_data' => array_filter(['name' => $name, 'description' => $description]),
                        'unit_amount'  => $amountCents,
                    ],
                    'quantity' => 1,
                ]],
                'customer_email' => $user->getUserIdentifier(),
                'metadata'       => $metadata + ['user_email' => $user->getUserIdentifier()],
                'success_url'    => $this->frontendUrl . $successPath,
                'cancel_url'     => $this->frontendUrl . $cancelPath,
            ]);
        } catch (\Throwable $e) {
            $this->logger->error('Stripe : création de session impossible', ['metadata' => $metadata, 'error' => $e->getMessage()]);

            return $this->json(['message' => 'Impossible d\'initialiser le paiement. Réessayez dans quelques instants.'], 502);
        }

        return $this->json(['url' => $session->url]);
    }
}
