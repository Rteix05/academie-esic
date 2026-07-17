<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

class ForgotPasswordController extends AbstractController
{
    #[Route('/api/forgot-password', name: 'api_forgot_password', methods: ['POST'])]
    public function forgotPassword(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $em,
        MailerInterface $mailer
    ): JsonResponse {
        $data  = json_decode($request->getContent(), true);
        $email = trim((string) ($data['email'] ?? ''));

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['message' => 'Adresse email invalide.'], 400);
        }

        // Toujours retourner le même message pour éviter l'énumération d'utilisateurs
        $user = $userRepository->findOneBy(['email' => $email]);
        if ($user) {
            $token = bin2hex(random_bytes(32));
            $user->setResetToken($token);
            $user->setResetTokenExpiresAt(new \DateTimeImmutable('+1 hour'));
            $em->flush();

            $frontendUrl = $_ENV['FRONTEND_URL'] ?? '';
            $resetUrl    = $frontendUrl . '/reset-password?token=' . $token;

            $mail = (new Email())
                ->from('noreply@academie-esic.fr')
                ->to($email)
                ->subject('Réinitialisation de votre mot de passe – Académie E.S.I.C.')
                ->html(
                    '<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;">' .
                    '<h2 style="color:#0F291E;">Réinitialisation de mot de passe</h2>' .
                    '<p>Vous avez demandé la réinitialisation de votre mot de passe sur l\'Académie E.S.I.C.</p>' .
                    '<p><a href="' . htmlspecialchars($resetUrl, ENT_QUOTES, 'UTF-8') . '" ' .
                    'style="display:inline-block;background:#0F291E;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">' .
                    'Réinitialiser mon mot de passe</a></p>' .
                    '<p style="color:#888;font-size:13px;">Ce lien est valable <strong>1 heure</strong>. Si vous n\'avez pas fait cette demande, ignorez cet email.</p>' .
                    '</div>'
                );

            try {
                $mailer->send($mail);
            } catch (\Exception) {
                // L'email ne peut pas être envoyé (mailer non configuré), on continue silencieusement
            }
        }

        return $this->json(['message' => 'Si cet email existe dans notre base, un lien de réinitialisation vient d\'être envoyé.']);
    }

    #[Route('/api/reset-password', name: 'api_reset_password', methods: ['POST'])]
    public function resetPassword(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $data     = json_decode($request->getContent(), true);
        $token    = trim((string) ($data['token'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if (!$token || !$password) {
            return $this->json(['message' => 'Token et nouveau mot de passe requis.'], 400);
        }

        if (strlen($password) < 8) {
            return $this->json(['message' => 'Le mot de passe doit contenir au moins 8 caractères.'], 400);
        }

        $user = $userRepository->findOneBy(['resetToken' => $token]);

        if (!$user || !$user->getResetTokenExpiresAt() || $user->getResetTokenExpiresAt() < new \DateTimeImmutable()) {
            return $this->json(['message' => 'Token invalide ou expiré. Veuillez refaire une demande.'], 400);
        }

        $user->setPassword($passwordHasher->hashPassword($user, $password));
        $user->setResetToken(null);
        $user->setResetTokenExpiresAt(null);
        $em->flush();

        return $this->json(['success' => true, 'message' => 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.']);
    }
}
