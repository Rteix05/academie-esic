<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

class UserProfileController extends AbstractController
{
    #[Route('/api/me', name: 'api_me_get', methods: ['GET'])]
    public function getProfile(UserRepository $userRepository): JsonResponse
    {
        $securityUser = $this->getUser();
        if (!$securityUser) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        $user = $userRepository->findOneBy(['email' => $securityUser->getUserIdentifier()]);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        return $this->json([
            'id'        => $user->getId(),
            'email'     => $user->getEmail(),
            'firstName' => $user->getFirstName(),
            'lastName'  => $user->getLastName(),
            'roles'     => $user->getRoles(),
        ]);
    }

    #[Route('/api/me', name: 'api_me_update', methods: ['PUT', 'PATCH'])]
    public function updateProfile(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $securityUser = $this->getUser();
        if (!$securityUser) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        $user = $userRepository->findOneBy(['email' => $securityUser->getUserIdentifier()]);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['firstName'])) {
            $user->setFirstName(trim((string) $data['firstName']));
        }
        if (isset($data['lastName'])) {
            $user->setLastName(trim((string) $data['lastName']));
        }
        if (!empty($data['newPassword'])) {
            if (empty($data['currentPassword'])) {
                return $this->json(['message' => 'Le mot de passe actuel est requis pour en changer.'], 400);
            }
            if (!$passwordHasher->isPasswordValid($user, $data['currentPassword'])) {
                return $this->json(['message' => 'Mot de passe actuel incorrect.'], 400);
            }
            if (strlen($data['newPassword']) < 8) {
                return $this->json(['message' => 'Le nouveau mot de passe doit contenir au moins 8 caractères.'], 400);
            }
            $user->setPassword($passwordHasher->hashPassword($user, $data['newPassword']));
        }

        $em->flush();

        return $this->json([
            'success'   => true,
            'firstName' => $user->getFirstName(),
            'lastName'  => $user->getLastName(),
            'email'     => $user->getEmail(),
        ]);
    }
}
