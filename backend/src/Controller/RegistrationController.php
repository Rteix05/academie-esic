<?php

namespace App\Controller;

use App\Entity\User;
use App\Mailer\AppMailer;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class RegistrationController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $em,
        ValidatorInterface $validator,
        RateLimiterFactoryInterface $registrationLimiter,
        AppMailer $mailer,
    ): JsonResponse {
        $limit = $registrationLimiter->create($request->getClientIp())->consume();
        if (!$limit->isAccepted()) {
            return $this->json(
                ['message' => 'Trop de tentatives d\'inscription. Réessayez plus tard.'],
                429,
                ['Retry-After' => $limit->getRetryAfter()->getTimestamp() - time()]
            );
        }

        // 1. On récupère les données envoyées par Next.js
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Requête invalide.'], 400);
        }

        // Email normalisé : évite les doublons "Jean@x.fr" / "jean@x.fr"
        $email    = mb_strtolower(trim((string) ($data['email'] ?? '')));
        $password = (string) ($data['password'] ?? '');

        $violations = $validator->validate(['email' => $email, 'password' => $password], new Assert\Collection([
            'email' => [
                new Assert\NotBlank(message: 'L\'email est obligatoire.'),
                new Assert\Email(message: 'Adresse email invalide.', mode: Assert\Email::VALIDATION_MODE_HTML5),
                new Assert\Length(max: 180, maxMessage: 'Adresse email trop longue.'),
            ],
            'password' => [
                new Assert\NotBlank(message: 'Le mot de passe est obligatoire.'),
                new Assert\Length(
                    min: 8,
                    max: 4096,
                    minMessage: 'Le mot de passe doit contenir au moins {{ limit }} caractères.',
                ),
                new Assert\Regex(
                    pattern: '/^(?=.*[A-Za-z])(?=.*\d).+$/',
                    message: 'Le mot de passe doit contenir au moins une lettre et un chiffre.',
                ),
            ],
        ]));

        if (count($violations) > 0) {
            return $this->json([
                'message' => $violations[0]->getMessage(),
                'errors'  => array_map(
                    fn ($v) => ['field' => trim($v->getPropertyPath(), '[]'), 'message' => $v->getMessage()],
                    iterator_to_array($violations)
                ),
            ], 422);
        }

        // 2. On vérifie que l'email n'est pas déjà pris
        $existingUser = $em->getRepository(User::class)->findOneBy(['email' => $email]);
        if ($existingUser) {
            return $this->json(['message' => 'Cet email est déjà utilisé par un autre compte.'], 409);
        }

        // 3. On crée le nouvel élève
        $user = new User();
        $user->setEmail($email);
        $user->setPassword($passwordHasher->hashPassword($user, $password));
        $user->setRoles(['ROLE_USER']);

        // 4. On sauvegarde en base de données (la contrainte unique couvre les inscriptions simultanées)
        try {
            $em->persist($user);
            $em->flush();
        } catch (UniqueConstraintViolationException) {
            return $this->json(['message' => 'Cet email est déjà utilisé par un autre compte.'], 409);
        }

        // 5. Email de bienvenue (un échec d'envoi ne bloque pas l'inscription)
        $mailer->sendWelcome($user);

        return $this->json([
            'success' => true,
            'message' => 'Inscription réussie ! Vous pouvez maintenant vous connecter.'
        ], 201);
    }
}
