<?php

namespace App\Controller;

use App\Security\JwtCookie;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Déconnexion côté API : le cookie JWT étant httpOnly, seul le serveur peut l'effacer.
 */
class LogoutController extends AbstractController
{
    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(): Response
    {
        $response = new Response(null, Response::HTTP_NO_CONTENT);
        $response->headers->clearCookie(JwtCookie::NAME, '/');

        return $response;
    }
}
