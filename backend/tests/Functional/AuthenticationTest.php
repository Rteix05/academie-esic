<?php

namespace App\Tests\Functional;

use App\Tests\ApiTestCase;

/**
 * Authentification par cookie httpOnly, protection CSRF, invalidation des sessions.
 */
final class AuthenticationTest extends ApiTestCase
{
    public function testLoginSetsHttpOnlyCookieWithoutTokenInBody(): void
    {
        $this->createUser();
        $this->login();

        $response = $this->client->getResponse();
        self::assertSame('', (string) $response->getContent(), 'Le JWT ne doit pas être renvoyé dans le corps');

        $cookie = null;
        foreach ($response->headers->getCookies() as $c) {
            if ($c->getName() === 'BEARER') {
                $cookie = $c;
            }
        }
        self::assertNotNull($cookie, 'Cookie BEARER attendu');
        self::assertTrue($cookie->isHttpOnly());
        self::assertSame('lax', $cookie->getSameSite());

        $this->client->request('GET', '/api/me');
        self::assertResponseIsSuccessful();
        self::assertSame('eleve@test.fr', $this->responseJson()['email']);
    }

    public function testWrongPasswordIsRejected(): void
    {
        $this->createUser();
        $this->jsonRequest('POST', '/api/login_check', ['username' => 'eleve@test.fr', 'password' => self::validPassword() . 'x']);
        self::assertResponseStatusCodeSame(401);
    }

    public function testCrossSiteRequestWithCookieIsBlocked(): void
    {
        $this->createUser();
        $this->login();

        $this->jsonRequest('PATCH', '/api/me', ['firstName' => 'Pirate'], ['HTTP_ORIGIN' => 'https://evil.example']);
        self::assertResponseStatusCodeSame(403);
    }

    public function testInvalidCookieDoesNotBreakPublicCatalog(): void
    {
        $this->client->getCookieJar()->set(new \Symfony\Component\BrowserKit\Cookie('BEARER', 'jeton.invalide.xyz'));

        $this->client->request('GET', '/api/formations', server: ['HTTP_ACCEPT' => 'application/ld+json']);
        self::assertResponseIsSuccessful();

        // Le cookie obsolète est effacé du navigateur
        $cleared = array_filter(
            $this->client->getResponse()->headers->getCookies(),
            fn ($c) => $c->getName() === 'BEARER' && $c->isCleared()
        );
        self::assertCount(1, $cleared);
    }

    public function testLogoutClearsSession(): void
    {
        $this->createUser();
        $this->login();

        $this->jsonRequest('POST', '/api/logout');
        self::assertResponseStatusCodeSame(204);

        $this->client->request('GET', '/api/me');
        self::assertResponseStatusCodeSame(401);
    }

    public function testPasswordChangeInvalidatesOtherSessionsAndRenewsCurrentOne(): void
    {
        $this->createUser();
        $this->login();
        $oldCookie = $this->client->getCookieJar()->get('BEARER')->getValue();

        $this->jsonRequest('PATCH', '/api/me', ['currentPassword' => self::validPassword(), 'newPassword' => self::otherValidPassword()]);
        self::assertResponseIsSuccessful();

        // La session courante reste ouverte grâce au nouveau cookie
        $this->client->request('GET', '/api/me');
        self::assertResponseIsSuccessful();

        // L'ancien token (ex. volé) est refusé
        $this->client->getCookieJar()->clear();
        $this->client->request('GET', '/api/me', server: ['HTTP_AUTHORIZATION' => 'Bearer ' . $oldCookie]);
        self::assertResponseStatusCodeSame(401);
    }

    public function testLoginIsThrottledAfterRepeatedFailures(): void
    {
        $this->createUser();

        for ($i = 0; $i < 5; $i++) {
            $this->jsonRequest('POST', '/api/login_check', ['username' => 'eleve@test.fr', 'password' => self::validPassword() . 'x']);
            self::assertStringContainsString('Invalid credentials', (string) $this->client->getResponse()->getContent());
        }

        // 6e tentative bloquée, même avec le bon mot de passe (Lexik répond 401 avec un message dédié)
        $this->jsonRequest('POST', '/api/login_check', ['username' => 'eleve@test.fr', 'password' => self::validPassword()]);
        self::assertResponseStatusCodeSame(401);
        self::assertStringContainsStringIgnoringCase('too many', (string) $this->client->getResponse()->getContent());
    }
}
