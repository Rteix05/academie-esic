<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

class RegistrationController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request, 
        UserPasswordHasherInterface $passwordHasher, 
        EntityManagerInterface $em
    ): JsonResponse {
        // 1. On récupère les données envoyées par Next.js
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (!$email || !$password) {
            return $this->json(['message' => 'L\'email et le mot de passe sont obligatoires.'], 400);
        }

        // 2. On vérifie que l'email n'est pas déjà pris
        $existingUser = $em->getRepository(User::class)->findOneBy(['email' => $email]);
        if ($existingUser) {
            return $this->json(['message' => 'Cet email est déjà utilisé par un autre compte.'], 409);
        }

        // 3. On crée le nouvel élève
        $user = new User();
        $user->setEmail($email);
        
        // Le hachage du mot de passe est primordial pour la sécurité
        $hashedPassword = $passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);
        
        $user->setRoles(['ROLE_USER']);

        // 4. On sauvegarde en base de données
        $em->persist($user);
        $em->flush();

        return $this->json([
            'success' => true,
            'message' => 'Inscription réussie ! Vous pouvez maintenant vous connecter.'
        ], 201);
    }
}