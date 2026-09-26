<?php

namespace App\Controller;

use App\Entity\MasterclassPurchase;
use App\Entity\User;
use App\Repository\MasterclassRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Routing\Attribute\Route;

class VideoController extends AbstractController
{
    private const TOKEN_TTL = 7200; // 2 heures

    public function __construct(
        private readonly MasterclassRepository $mcRepo,
        private readonly string $projectDir,
    ) {}

    /**
     * Génère une URL signée et temporaire (2h) pour accéder à une vidéo locale.
     * Requiert JWT + achat avec option "video" ou "pack".
     */
    #[Route('/api/video-url/{id}', name: 'api_video_url', methods: ['GET'])]
    public function getVideoUrl(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Non autorisé'], 401);
        }

        $mc = $this->mcRepo->find($id);
        if (!$mc) {
            return $this->json(['error' => 'Introuvable'], 404);
        }

        // Vérifier l'achat avec option vidéo ou pack (l'utilisateur peut aussi avoir acheté le PDF seul)
        $purchase = $em->getRepository(MasterclassPurchase::class)->findOneBy([
            'user'        => $user,
            'masterclass' => $mc,
            'option'      => ['video', 'pack'],
        ]);

        if (!$purchase) {
            return $this->json(['error' => 'Accès non autorisé — option vidéo requise'], 403);
        }

        // Token signé HMAC-SHA256, lié à la masterclass, à l'utilisateur et à l'expiration
        $expiry = time() + self::TOKEN_TTL;
        $sig    = $this->sign($id, $user->getId(), $expiry);

        return $this->json([
            'streamUrl' => '/api/video-stream/' . $id . '/' . $user->getId() . '/' . $expiry . '/' . $sig,
        ]);
    }

    /**
     * Streame le fichier vidéo privé après validation du token signé.
     * Route publique (pas de JWT, une balise <video> ne peut pas envoyer d'en-tête) — le token valide l'accès.
     */
    #[Route('/api/video-stream/{mcId}/{userId}/{expiry}/{sig}', name: 'api_video_stream', methods: ['GET'], requirements: ['mcId' => '\d+', 'userId' => '\d+', 'expiry' => '\d+'])]
    public function streamVideo(int $mcId, int $userId, int $expiry, string $sig): Response
    {
        // 1. Vérifier la signature
        if (!hash_equals($this->sign($mcId, $userId, $expiry), $sig)) {
            throw new AccessDeniedHttpException('Signature invalide');
        }

        // 2. Vérifier l'expiration
        if ($expiry < time()) {
            return new Response('Lien expiré — rechargez la page', 403);
        }

        // 3. Récupérer la masterclass et le fichier (stockage privé, hors de public/)
        $mc = $this->mcRepo->find($mcId);
        if (!$mc || !$mc->getVideo()) {
            return new Response('Vidéo introuvable', 404);
        }

        $filePath = $this->projectDir . '/private/uploads/videos/' . basename($mc->getVideo());
        if (!is_file($filePath)) {
            return new Response('Fichier vidéo introuvable sur le serveur', 404);
        }

        // 4. Streamer le fichier (BinaryFileResponse gère les requêtes Range pour la lecture progressive)
        $response = new BinaryFileResponse($filePath);
        $response->headers->set('Content-Type', 'video/mp4');
        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');
        $response->headers->set('Content-Disposition', 'inline');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'no-referrer');

        return $response;
    }

    private function sign(int $mcId, int $userId, int $expiry): string
    {
        return hash_hmac('sha256', $mcId . ':' . $userId . ':' . $expiry, $this->getSecret());
    }

    private function getSecret(): string
    {
        $secret = $_ENV['VIDEO_TOKEN_SECRET'] ?? '';
        if (strlen($secret) < 32) {
            // Pas de secret par défaut : un secret connu permettrait de forger des liens
            throw new \RuntimeException('VIDEO_TOKEN_SECRET absent ou trop court (32 caractères minimum).');
        }

        return $secret;
    }
}
