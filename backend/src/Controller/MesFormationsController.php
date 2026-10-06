<?php

namespace App\Controller;

use App\Entity\User;
use App\Subscription\FormationAccess;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class MesFormationsController extends AbstractController
{
    /**
     * Formations accessibles : acquises (achat, inscription gratuite) ou incluses
     * dans un abonnement actif ('access' indique l'origine du droit).
     */
    #[Route('/api/mes-formations', name: 'api_mes_formations', methods: ['GET'])]
    public function index(FormationAccess $access): JsonResponse
    {
        // Le provider "entity" fournit directement l'entité User gérée par Doctrine
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        $data = [];
        foreach ($access->accessibleFormations($user) as ['formation' => $formation, 'access' => $origin]) {
            $data[] = [
                'id'       => $formation->getId(),
                'title'    => $formation->getTitle(),
                'category' => $formation->getCategory(),
                'access'   => $origin,
            ];
        }

        return $this->json($data);
    }
}
