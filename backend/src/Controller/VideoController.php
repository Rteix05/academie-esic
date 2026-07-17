<?php

namespace App\Controller;

use App\Entity\MasterclassPurchase;
use App\Repository\MasterclassRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Routing\Attribute\Route;

class VideoController extends AbstractController
{
    public function __construct(
        private readonly MasterclassRepository $mcRepo,
        private readonly string $projectDir,
    ) {}

    /**
     * Génère une URL signée et temporaire (2h) pour accéder à une vidéo locale.
     * Requiert JWT + achat avec option "video" ou "pack".
     */
    #[Route('/api/video-url/{id}', name: 'api_video_url', methods: ['GET'])]
    public function getVideoUrl(
        int $id,
        UserRepository $userRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $securityUser = $this->getUser();
        if (!$securityUser) {
            return $this->json(['error' => 'Non autorisé'], 401);
        }

        $user = $userRepo->findOneBy(['email' => $securityUser->getUserIdentifier()]);
        $mc   = $this->mcRepo->find($id);

        if (!$user || !$mc) {
            return $this->json(['error' => 'Introuvable'], 404);
        }

        // Vérifier l'achat avec option vidéo ou pack
        $purchase = $em->getRepository(MasterclassPurchase::class)->findOneBy([
            'user'       => $user,
            'masterclass' => $mc,
        ]);

        if (!$purchase || !in_array($purchase->getOption(), ['video', 'pack'], true)) {
            return $this->json(['error' => 'Accès non autorisé — option vidéo requise'], 403);
        }

        // Génération du token : mcId + expiry signés avec HMAC-SHA256
        $expiry  = time() + 7200; // valide 2 heures
        $payload = $id . ':' . $expiry;
        $sig     = hash_hmac('sha256', $payload, $this->getSecret());

        return $this->json([
            'streamUrl' => '/api/video-stream/' . $id . '/' . $expiry . '/' . $sig,
        ]);
    }

    /**
     * Streame le fichier vidéo local après validation du token signé.
     * Route publique (pas de JWT) — le token valide l'accès.
     */
    #[Route('/api/video-stream/{mcId}/{expiry}/{sig}', name: 'api_video_stream', methods: ['GET'])]
    public function streamVideo(int $mcId, int $expiry, string $sig, Request $request): Response
    {
        // 1. Vérifier la signature
        $payload     = $mcId . ':' . $expiry;
        $expectedSig = hash_hmac('sha256', $payload, $this->getSecret());

        if (!hash_equals($expectedSig, $sig)) {
            throw new AccessDeniedHttpException('Signature invalide');
        }

        // 2. Vérifier l'expiration
        if ($expiry < time()) {
            return new Response('Lien expiré — rechargez la page', 403);
        }

        // 3. Récupérer la masterclass et le fichier
        $mc = $this->mcRepo->find($mcId);
        if (!$mc || !$mc->getVideo()) {
            return new Response('Vidéo introuvable', 404);
        }

        $filePath = $this->projectDir . '/public/uploads/videos/' . basename($mc->getVideo());
        if (!file_exists($filePath)) {
            return new Response('Fichier vidéo introuvable sur le serveur', 404);
        }

        // 4. Streamer le fichier avec headers anti-cache et sans Content-Disposition: attachment
        $response = new BinaryFileResponse($filePath);
        $response->headers->set('Content-Type', 'video/mp4');
        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');
        $response->headers->set('Content-Disposition', 'inline');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        // Empêche les navigateurs d'inspecter le contenu via les outils développeur réseau
        $response->headers->set('Referrer-Policy', 'no-referrer');

        return $response;
    }

    private function getSecret(): string
    {
        return $_ENV['VIDEO_TOKEN_SECRET'] ?? 'fallback_secret_change_me';
    }
}
