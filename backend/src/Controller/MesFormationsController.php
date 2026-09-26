<?php

namespace App\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class MesFormationsController extends AbstractController
{
    #[Route('/api/mes-formations', name: 'api_mes_formations', methods: ['GET'])]
    public function index(): JsonResponse
    {
        // Le provider "entity" fournit directement l'entité User gérée par Doctrine
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        $data = [];
        foreach ($user->getFormations() as $formation) {
            $data[] = [
                'id'       => $formation->getId(),
                'title'    => $formation->getTitle(),
                'category' => $formation->getCategory(),
            ];
        }

        return $this->json($data);
    }
}
