<?php

namespace App\Controller;

use App\Analytics\PageViewRecorder;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Mesure d'audience : le site public signale chaque page affichée.
 * Réponse toujours vide (204) : rien n'est renvoyé au navigateur, même en cas de requête ignorée.
 */
class PageViewController extends AbstractController
{
    #[Route('/api/track', name: 'api_track', methods: ['POST'])]
    public function track(Request $request, PageViewRecorder $recorder, RateLimiterFactoryInterface $pageViewLimiter): Response
    {
        if ($pageViewLimiter->create($request->getClientIp())->consume()->isAccepted()) {
            // Envoyé en text/plain par le frontend (requête simple, sans pré-vérification CORS)
            $data = json_decode($request->getContent(), true);

            if (is_array($data) && is_string($data['path'] ?? null)) {
                $recorder->record(
                    $data['path'],
                    is_string($data['referrer'] ?? null) ? $data['referrer'] : null,
                    (bool) ($data['entry'] ?? false),
                    $request->getClientIp(),
                    $request->headers->get('User-Agent'),
                );
            }
        }

        return new Response(null, Response::HTTP_NO_CONTENT);
    }
}
