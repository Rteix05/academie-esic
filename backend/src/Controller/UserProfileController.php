<?php

namespace App\Controller;

use App\Entity\User;
use App\Learning\LearningPreferences;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Security\Http\Cookie\JWTCookieProvider;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class UserProfileController extends AbstractController
{
    #[Route('/api/me', name: 'api_me_get', methods: ['GET'])]
    public function getProfile(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        return $this->json([
            'id'        => $user->getId(),
            'email'     => $user->getEmail(),
            'firstName' => $user->getFirstName(),
            'lastName'  => $user->getLastName(),
            'roles'     => $user->getRoles(),
            'onboarded' => $user->getOnboardedAt() !== null,
            'preferences' => $this->preferences($user),
        ]);
    }

    /**
     * Parcours guidé après l'inscription : domaines d'intérêt, niveau et objectif de l'élève.
     * Un envoi sans aucun choix (« Passer cette étape ») marque simplement le parcours comme vu.
     */
    #[Route('/api/me/preferences', name: 'api_me_preferences', methods: ['PUT'])]
    public function updatePreferences(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Requête invalide.'], 400);
        }

        $interests = $data['interests'] ?? [];
        $level     = $data['level'] ?? null;
        $goal      = $data['goal'] ?? null;

        if (!is_array($interests) || array_diff($interests, LearningPreferences::INTERESTS) !== []) {
            return $this->json(['message' => 'Domaine inconnu.'], 422);
        }
        if ($level !== null && !in_array($level, LearningPreferences::LEVELS, true)) {
            return $this->json(['message' => 'Niveau inconnu.'], 422);
        }
        if ($goal !== null && !array_key_exists($goal, LearningPreferences::GOALS)) {
            return $this->json(['message' => 'Objectif inconnu.'], 422);
        }

        // Ordre de référence, sans doublon
        $user->setInterests(array_values(array_intersect(LearningPreferences::INTERESTS, $interests)))
            ->setLearningLevel($level)
            ->setLearningGoal($goal)
            ->setOnboardedAt(new \DateTimeImmutable());
        $em->flush();

        return $this->json(['success' => true, 'onboarded' => true, 'preferences' => $this->preferences($user)]);
    }

    /** @return array{interests: list<string>, level: ?string, goal: ?string} */
    private function preferences(User $user): array
    {
        return [
            'interests' => $user->getInterests(),
            'level'     => $user->getLearningLevel(),
            'goal'      => $user->getLearningGoal(),
        ];
    }

    #[Route('/api/me', name: 'api_me_update', methods: ['PUT', 'PATCH'])]
    public function updateProfile(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher,
        JWTTokenManagerInterface $jwtManager,
        #[Autowire(service: 'lexik_jwt_authentication.cookie_provider.BEARER')] JWTCookieProvider $cookieProvider
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Requête invalide.'], 400);
        }

        foreach (['firstName' => 'Le prénom', 'lastName' => 'Le nom'] as $field => $label) {
            if (isset($data[$field]) && mb_strlen(trim((string) $data[$field])) > 100) {
                return $this->json(['message' => $label . ' ne doit pas dépasser 100 caractères.'], 422);
            }
        }

        if (isset($data['firstName'])) {
            $user->setFirstName(trim((string) $data['firstName']));
        }
        if (isset($data['lastName'])) {
            $user->setLastName(trim((string) $data['lastName']));
        }

        $passwordChanged = false;
        if (!empty($data['newPassword'])) {
            $newPassword = (string) $data['newPassword'];

            if (empty($data['currentPassword'])) {
                return $this->json(['message' => 'Le mot de passe actuel est requis pour en changer.'], 400);
            }
            if (!$passwordHasher->isPasswordValid($user, (string) $data['currentPassword'])) {
                return $this->json(['message' => 'Mot de passe actuel incorrect.'], 400);
            }
            if (strlen($newPassword) < 8 || strlen($newPassword) > 4096 || !preg_match('/^(?=.*[A-Za-z])(?=.*\d).+$/', $newPassword)) {
                return $this->json(['message' => 'Le nouveau mot de passe doit contenir au moins 8 caractères, dont une lettre et un chiffre.'], 422);
            }
            $user->setPassword($passwordHasher->hashPassword($user, $newPassword));
            $passwordChanged = true;
        }

        $em->flush();

        $response = $this->json([
            'success'   => true,
            'firstName' => $user->getFirstName(),
            'lastName'  => $user->getLastName(),
            'email'     => $user->getEmail(),
        ]);

        // Le changement de mot de passe invalide tous les JWT existants (cf. JwtPasswordFingerprintListener) :
        // on dépose un nouveau cookie pour que la session courante reste ouverte.
        if ($passwordChanged) {
            $response->headers->setCookie($cookieProvider->createCookie($jwtManager->create($user)));
        }

        return $response;
    }
}
