<?php

namespace App\Security;

use Lexik\Bundle\JWTAuthenticationBundle\Security\Authenticator\JWTAuthenticator;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AuthenticationException;

/**
 * Authentificateur JWT tolérant pour le cookie httpOnly.
 *
 * Le navigateur envoie le cookie sur toutes les requêtes, y compris celles du
 * catalogue public. Un token expiré ou invalidé (changement de mot de passe) ne
 * doit donc pas faire échouer ces pages : la requête continue en anonyme et
 * access_control décide (401 sur les routes protégées). Le cookie obsolète est
 * effacé par ApiCookieSecuritySubscriber.
 *
 * Un token envoyé explicitement dans l'en-tête Authorization garde le comportement
 * strict de Lexik (401 immédiat), attendu par les clients API.
 */
final class CookieJwtAuthenticator extends JWTAuthenticator
{
    public const CLEAR_COOKIE_ATTRIBUTE = '_clear_jwt_cookie';

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        if (!$request->headers->has('Authorization') && $request->cookies->has(JwtCookie::NAME)) {
            $request->attributes->set(self::CLEAR_COOKIE_ATTRIBUTE, true);

            return null;
        }

        return parent::onAuthenticationFailure($request, $exception);
    }
}
