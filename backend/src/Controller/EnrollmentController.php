<?php

namespace App\Controller;

use App\Entity\Formation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class EnrollmentController extends AbstractController
{
    #[Route('/api/formations/{id}/enroll', name: 'api_formation_enroll', methods: ['POST'])]
    public function enroll(Formation $formation, EntityManagerInterface $entityManager): JsonResponse
    {
        // 1. On récupère l'élève grâce à son Token JWT
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['message' => 'Vous devez être connecté pour rejoindre un cursus.'], 401);
        }

        // 2. On vérifie si l'utilisateur possède déjà la formation pour éviter les doublons
        if ($user->getFormations()->contains($formation)) {
            return $this->json(['message' => 'Vous possédez déjà cette formation.'], 400);
        }

        // 3. On ajoute la formation à l'utilisateur (assure-toi d'avoir la méthode addFormation dans l'entité User)
        $user->addFormation($formation);

        // 4. On sauvegarde en base de données
        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json([
            'message' => 'Félicitations, vous avez rejoint la formation !',
            'formation_id' => $formation->getId()
        ], 200);
    }
}