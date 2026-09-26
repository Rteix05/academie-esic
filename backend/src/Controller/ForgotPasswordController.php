<?php

namespace App\Controller;

use App\Mailer\AppMailer;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;
use Symfony\Component\Routing\Attribute\Route;

class ForgotPasswordController extends AbstractController
{
    #[Route('/api/forgot-password', name: 'api_forgot_password', methods: ['POST'])]
    public function forgotPassword(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $em,
        AppMailer $mailer,
        RateLimiterFactoryInterface $forgotPasswordLimiter
    ): JsonResponse {
        $data  = json_decode($request->getContent(), true);
        $email = trim((string) ($data['email'] ?? ''));

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['message' => 'Adresse email invalide.'], 400);
        }

        // Limite par IP + email : empêche le spam d'emails vers une victime
        $limit = $forgotPasswordLimiter->create($request->getClientIp() . '|' . mb_strtolower($email))->consume();
        if (!$limit->isAccepted()) {
            return $this->json(['message' => 'Trop de demandes. Réessayez dans quelques minutes.'], 429);
        }

        // Toujours retourner le même message pour éviter l'énumération d'utilisateurs
        $user = $userRepository->findOneBy(['email' => $email]);
        if ($user) {
            // Seul le hash du token est stocké : une fuite de la base ne permet pas de réinitialiser un compte
            $token = bin2hex(random_bytes(32));
            $user->setResetToken(hash('sha256', $token));
            $user->setResetTokenExpiresAt(new \DateTimeImmutable('+1 hour'));
            $em->flush();

            $mailer->sendPasswordReset($email, $token);
        }

        return $this->json(['message' => 'Si cet email existe dans notre base, un lien de réinitialisation vient d\'être envoyé.']);
    }

    #[Route('/api/reset-password', name: 'api_reset_password', methods: ['POST'])]
    public function resetPassword(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher,
        RateLimiterFactoryInterface $resetPasswordLimiter
    ): JsonResponse {
        $limit = $resetPasswordLimiter->create($request->getClientIp())->consume();
        if (!$limit->isAccepted()) {
            return $this->json(['message' => 'Trop de tentatives. Réessayez dans quelques minutes.'], 429);
        }

        $data     = json_decode($request->getContent(), true);
        $token    = trim((string) ($data['token'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if (!$token || !$password) {
            return $this->json(['message' => 'Token et nouveau mot de passe requis.'], 400);
        }

        if (strlen($password) < 8 || strlen($password) > 4096) {
            return $this->json(['message' => 'Le mot de passe doit contenir au moins 8 caractères.'], 400);
        }

        $user = $userRepository->findOneBy(['resetToken' => hash('sha256', $token)]);

        if (!$user || !$user->getResetTokenExpiresAt() || $user->getResetTokenExpiresAt() < new \DateTimeImmutable()) {
            return $this->json(['message' => 'Token invalide ou expiré. Veuillez refaire une demande.'], 400);
        }

        // Le changement de hash invalide aussi les JWT déjà émis (cf. JwtPasswordFingerprintListener)
        $user->setPassword($passwordHasher->hashPassword($user, $password));
        $user->setResetToken(null);
        $user->setResetTokenExpiresAt(null);
        $em->flush();

        return $this->json(['success' => true, 'message' => 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.']);
    }
}
