<?php

namespace App\Security;

/**
 * Nom du cookie httpOnly portant le JWT (doit correspondre à lexik_jwt_authentication.yaml).
 */
final class JwtCookie
{
    public const NAME = 'BEARER';
}
