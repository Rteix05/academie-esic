<?php

namespace App\Controller;

use App\Entity\Formation;
use App\Entity\User;
use App\Mailer\AppMailer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class EnrollmentController extends AbstractController
{
    /**
     * Inscription directe à une formation GRATUITE.
     * Les formations payantes passent obligatoirement par Stripe (/api/stripe/checkout/formation/{id}).
     */
    #[Route('/api/formations/{id}/enroll', name: 'api_formation_enroll', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function enroll(Formation $formation, EntityManagerInterface $entityManager, AppMailer $mailer): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Vous devez être connecté pour rejoindre un cursus.'], 401);
        }

        if (!$formation->isPublished()) {
            return $this->json(['message' => 'Formation non disponible.'], 404);
        }

        // Sans ce contrôle, n'importe quel compte obtiendrait une formation payante gratuitement
        if ((float) $formation->getPrice() > 0) {
            return $this->json([
                'message'         => 'Cette formation est payante : veuillez passer par le paiement.',
                'paymentRequired' => true,
            ], 402);
        }

        if ($user->getFormations()->contains($formation)) {
            return $this->json(['message' => 'Vous possédez déjà cette formation.'], 409);
        }

        $user->addFormation($formation);
        $entityManager->flush();

        // Confirmation par email (un échec d'envoi ne bloque pas l'inscription)
        $mailer->sendEnrollmentConfirmation($user, $formation);

        return $this->json([
            'message' => 'Félicitations, vous avez rejoint la formation !',
            'formation_id' => $formation->getId()
        ], 200);
    }
}
