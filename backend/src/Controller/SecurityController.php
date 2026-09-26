<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

/**
 * Connexion au back-office EasyAdmin (firewall "main", session).
 * L'API utilise quant à elle /api/login_check (JWT).
 */
class SecurityController extends AbstractController
{
    #[Route('/login', name: 'app_login', methods: ['GET', 'POST'])]
    public function login(AuthenticationUtils $authenticationUtils): Response
    {
        if ($this->isGranted('ROLE_ADMIN')) {
            return $this->redirectToRoute('admin');
        }

        return $this->render('@EasyAdmin/page/login.html.twig', [
            'error'               => $authenticationUtils->getLastAuthenticationError(),
            'last_username'       => $authenticationUtils->getLastUsername(),
            'page_title'          => 'Académie E.S.I.C. — Administration',
            'csrf_token_intention' => 'authenticate',
            'target_path'         => $this->generateUrl('admin'),
            'username_label'      => 'Email',
            'password_label'      => 'Mot de passe',
            'sign_in_label'       => 'Se connecter',
            'username_parameter'  => '_username',
            'password_parameter'  => '_password',
        ]);
    }

    #[Route('/logout', name: 'app_logout', methods: ['GET'])]
    public function logout(): never
    {
        throw new \LogicException('Intercepté par le firewall.');
    }
}
