<?php

namespace App\Controller;

use App\Entity\InstitutAccess;
use App\Entity\User;
use App\Institut\InstitutCatalog;
use App\Institut\InstitutPack;
use App\Repository\InstitutAccessRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Accès complets aux instituts (achat unique, accès à vie) : offres et accès de l'élève.
 * L'achat passe par CheckoutController::institut, puis PurchaseFulfiller (webhook / confirmation).
 */
class InstitutPackController extends AbstractController
{
    public function __construct(
        private readonly InstitutCatalog $catalog,
        private readonly InstitutAccessRepository $institutAccesses,
    ) {}

    /** Offres disponibles (public) : seuls les accès configurés dans Stripe sont listés */
    #[Route('/api/institut-packs', name: 'api_institut_packs', methods: ['GET'])]
    public function offers(): JsonResponse
    {
        return $this->json(array_values(array_filter(array_map(
            fn (InstitutPack $pack) => $this->catalog->offer($pack),
            InstitutPack::cases(),
        ))));
    }

    #[Route('/api/mes-instituts', name: 'api_mes_instituts', methods: ['GET'])]
    public function mine(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        return $this->json(array_map(fn (InstitutAccess $access) => [
            'id'          => $access->getId(),
            'pack'        => $access->getPack()->value,
            'institut'    => $access->getPack()->institut(),
            'label'       => $access->getPack()->label(),
            'purchasedAt' => $access->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ], $this->institutAccesses->findForUser($user)));
    }
}
