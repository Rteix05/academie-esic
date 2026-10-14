<?php

namespace App\Controller;

use App\Security\JwtCookie;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Event\LogoutEvent;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;

/**
 * Déconnexion côté API : le cookie JWT étant httpOnly, seul le serveur peut l'effacer.
 * L'événement de déconnexion révoque aussi le token (blocklist_token de Lexik).
 */
class LogoutController extends AbstractController
{
    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(Request $request, EventDispatcherInterface $dispatcher): Response
    {
        $dispatcher->dispatch(new LogoutEvent($request, null));

        $response = new Response(null, Response::HTTP_NO_CONTENT);
        $response->headers->clearCookie(JwtCookie::NAME, '/');

        return $response;
    }
}
