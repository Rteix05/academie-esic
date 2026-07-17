<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class MesFormationsController extends AbstractController
{
    #[Route('/api/mes-formations', name: 'api_mes_formations', methods: ['GET'])]
    public function index(UserRepository $userRepository): JsonResponse
    {
        // 1. On récupère l'utilisateur "virtuel" du token
        $securityUser = $this->getUser();

        if (!$securityUser) {
            return $this->json(['message' => 'Non autorisé. Token invalide ou absent.'], 401);
        }

        // 2. LA MAGIE EST ICI : On va chercher le VRAI utilisateur dans la base de données grâce à son email
        $realUser = $userRepository->findOneBy(['email' => $securityUser->getUserIdentifier()]);

        if (!$realUser) {
            return $this->json(['message' => 'Utilisateur introuvable en base de données.'], 404);
        }

        // 3. Maintenant, Doctrine sait lire ses relations !
        $formations = $realUser->getFormations();

        $data = [];
        foreach ($formations as $formation) {
            $data[] = [
                'id' => $formation->getId(),
                'title' => $formation->getTitle(),
                'category' => $formation->getCategory(),
            ];
        }

        return $this->json($data);
    }
}