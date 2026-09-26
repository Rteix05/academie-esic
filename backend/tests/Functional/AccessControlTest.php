<?php

namespace App\Tests\Functional;

use App\Tests\ApiTestCase;
use PHPUnit\Framework\Attributes\DataProvider;

/**
 * Contrôle d'accès et exposition des données (régressions des failles critiques corrigées).
 */
final class AccessControlTest extends ApiTestCase
{
    public function testCatalogIsReadOnly(): void
    {
        $formation = $this->createFormation();

        foreach ([['POST', '/api/formations'], ['PUT', '/api/formations/' . $formation->getId()], ['DELETE', '/api/formations/' . $formation->getId()], ['POST', '/api/masterclasses']] as [$method, $uri]) {
            $this->jsonRequest($method, $uri, []);
            self::assertResponseStatusCodeSame(405, "$method $uri doit être refusé");
        }
    }

    public function testCatalogDoesNotLeakSensitiveFields(): void
    {
        $formation = $this->createFormation();
        $formation->addUser($this->createUser());
        $this->em()->flush();
        $this->createMasterclass();

        foreach (['/api/formations', '/api/masterclasses'] as $uri) {
            $this->client->request('GET', $uri, server: ['HTTP_ACCEPT' => 'application/ld+json']);
            self::assertResponseIsSuccessful();
            $content = (string) $this->client->getResponse()->getContent();

            foreach (['"users"', '"password"', '"resetToken"', '"pdfFile"', '"videoUrl"', '"video"', 'secret.pdf', 'video.example'] as $leak) {
                self::assertStringNotContainsString($leak, $content, "$uri ne doit pas exposer $leak");
            }
        }
    }

    public function testCatalogExposesAvailabilityFlags(): void
    {
        $this->createMasterclass();

        $this->client->request('GET', '/api/masterclasses', server: ['HTTP_ACCEPT' => 'application/ld+json']);
        $member = $this->responseJson()['member'][0];

        self::assertTrue($member['videoAvailable']);
        self::assertSame(50, (int) $member['pricePack']);
    }

    public function testAdminRequiresLogin(): void
    {
        $this->client->request('GET', '/admin');
        self::assertResponseRedirects('/login');
    }

    public function testAdminIsForbiddenToStudents(): void
    {
        $this->createUser('eleve@test.fr');
        $this->client->loginUser($this->em()->getRepository(\App\Entity\User::class)->findOneBy(['email' => 'eleve@test.fr']), 'main');

        $this->client->request('GET', '/admin');
        self::assertResponseStatusCodeSame(403);
    }

    #[DataProvider('protectedEndpoints')]
    public function testProtectedEndpointsRequireAuthentication(string $method, string $uri): void
    {
        $this->jsonRequest($method, $uri, $method === 'GET' ? null : []);
        self::assertResponseStatusCodeSame(401);
    }

    /** @return iterable<array{string, string}> */
    public static function protectedEndpoints(): iterable
    {
        yield ['GET', '/api/me'];
        yield ['GET', '/api/mes-formations'];
        yield ['GET', '/api/mes-masterclasses'];
        yield ['GET', '/api/mes-evenements'];
        yield ['GET', '/api/payment-history'];
        yield ['POST', '/api/stripe/confirm'];
        yield ['POST', '/api/stripe/confirm/event'];
        yield ['POST', '/api/stripe/checkout/formation/1'];
        yield ['GET', '/api/content/masterclass/1/pdf'];
        yield ['GET', '/api/video-url/1'];
    }

    public function testSimulatedPurchaseEndpointNoLongerExists(): void
    {
        $this->jsonRequest('POST', '/api/checkout/1', []);
        self::assertResponseStatusCodeSame(404);
    }
}
