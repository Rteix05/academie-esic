<?php

namespace App\Tests\Functional;

use App\Entity\User;
use App\Tests\ApiTestCase;
use PHPUnit\Framework\Attributes\DataProvider;

final class RegistrationTest extends ApiTestCase
{
    public function testRegistersUserWithNormalizedEmail(): void
    {
        $password = self::validPassword();
        $this->jsonRequest('POST', '/api/register', ['email' => '  Nouvel.Eleve@Test.FR ', 'password' => $password]);
        self::assertResponseStatusCodeSame(201);

        $user = $this->em()->getRepository(User::class)->findOneBy(['email' => 'nouvel.eleve@test.fr']);
        self::assertNotNull($user);
        self::assertSame(['ROLE_USER'], $user->getRoles());
        self::assertNotSame($password, $user->getPassword(), 'Le mot de passe doit être haché');
    }

    /**
     * @param array<string, string> $payload
     */
    #[DataProvider('invalidPayloads')]
    public function testRejectsInvalidPayload(array $payload, string $field): void
    {
        $this->jsonRequest('POST', '/api/register', $payload);
        self::assertResponseStatusCodeSame(422);
        self::assertSame($field, $this->responseJson()['errors'][0]['field']);
    }

    /** @return iterable<string, array{array<string, string>, string}> */
    public static function invalidPayloads(): iterable
    {
        yield 'email invalide' => [['email' => 'pas-un-email', 'password' => self::validPassword()], 'email'];
        yield 'mot de passe court' => [['email' => 'a@test.fr', 'password' => str_repeat('a', 5) . '1'], 'password'];
        yield 'sans chiffre' => [['email' => 'a@test.fr', 'password' => str_repeat('x', 12)], 'password'];
    }

    public function testRejectsDuplicateEmail(): void
    {
        $this->createUser('deja@test.fr');
        $this->jsonRequest('POST', '/api/register', ['email' => 'deja@test.fr', 'password' => self::validPassword()]);
        self::assertResponseStatusCodeSame(409);
    }

    public function testRegistrationIsRateLimited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->jsonRequest('POST', '/api/register', ['email' => 'x', 'password' => '']);
            self::assertResponseStatusCodeSame(422);
        }
        $this->jsonRequest('POST', '/api/register', ['email' => 'x', 'password' => '']);
        self::assertResponseStatusCodeSame(429);
    }
}
