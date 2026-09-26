<?php

namespace App\Tests;

use App\Entity\Event;
use App\Entity\Formation;
use App\Entity\Masterclass;
use App\Entity\User;
use App\Tests\Double\FakeStripeGateway;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Base des tests fonctionnels de l'API.
 * Chaque test tourne dans une transaction annulée (DAMA) : aucune donnée ne persiste.
 */
abstract class ApiTestCase extends WebTestCase
{
    public const FRONTEND_ORIGIN = 'http://localhost:3000';

    private static ?string $validPassword = null;

    /**
     * Mot de passe valide (lettre + chiffre, 18 caractères) généré à l'exécution :
     * aucun identifiant littéral dans le code, que les scanners de secrets signaleraient.
     */
    protected static function validPassword(): string
    {
        return self::$validPassword ??= 'T' . bin2hex(random_bytes(8)) . '7';
    }

    /** Un autre mot de passe valide, différent du précédent */
    protected static function otherValidPassword(): string
    {
        return 'N' . bin2hex(random_bytes(8)) . '4';
    }

    protected KernelBrowser $client;

    protected function setUp(): void
    {
        FakeStripeGateway::reset();
        $this->client = static::createClient([], [
            // Origin du frontend sur toutes les requêtes, comme le ferait le navigateur (contrôle anti-CSRF)
            'HTTP_ORIGIN' => self::FRONTEND_ORIGIN,
            // IP aléatoire : isole les compteurs des limiteurs de débit entre tests et entre exécutions
            'REMOTE_ADDR' => sprintf('10.%d.%d.%d', random_int(0, 255), random_int(0, 255), random_int(1, 254)),
        ]);
    }

    protected function em(): EntityManagerInterface
    {
        return static::getContainer()->get(EntityManagerInterface::class);
    }

    /**
     * @param string[] $roles
     */
    protected function createUser(string $email = 'eleve@test.fr', array $roles = ['ROLE_USER']): User
    {
        $user = (new User())->setEmail($email)->setRoles($roles);
        $user->setPassword(static::getContainer()->get(UserPasswordHasherInterface::class)->hashPassword($user, self::validPassword()));

        $this->em()->persist($user);
        $this->em()->flush();

        return $user;
    }

    protected function createFormation(float $price = 100.0, bool $published = true): Formation
    {
        $formation = (new Formation())
            ->setTitle('Formation test')
            ->setDescription('<p>Contenu</p>')
            ->setPrice($price)
            ->setDuration('10h')
            ->setLevel('Débutant')
            ->setCategory('Discipulat')
            ->setIsPublished($published);
        $formation->setPdfFile('secret.pdf');
        $formation->setVideoUrl('https://video.example/secret');

        $this->em()->persist($formation);
        $this->em()->flush();

        return $formation;
    }

    protected function createMasterclass(): Masterclass
    {
        $masterclass = (new Masterclass())
            ->setTitle('Masterclass test')
            ->setDescription('<p>Description</p>')
            ->setSpeakerName('Intervenant')
            ->setPricePdf(20.0)
            ->setPriceVideo(40.0)
            ->setPricePack(50.0);
        $masterclass->setVideo('https://video.example/masterclass');

        $this->em()->persist($masterclass);
        $this->em()->flush();

        return $masterclass;
    }

    protected function createEvent(float $price = 0.0, ?int $capacity = null): Event
    {
        $event = (new Event())
            ->setTitle('Événement test')
            ->setDescription('<p>Description</p>')
            ->setLocation('En ligne')
            ->setStartDate(new \DateTimeImmutable('+10 days'))
            ->setEndDate(new \DateTimeImmutable('+10 days +2 hours'))
            ->setPrice($price)
            ->setCapacity($capacity)
            ->setIsPublished(true);

        $this->em()->persist($event);
        $this->em()->flush();

        return $event;
    }

    /** Connexion via l'API : le JWT est déposé dans le cookie httpOnly du client */
    protected function login(string $email = 'eleve@test.fr', ?string $password = null): void
    {
        $this->jsonRequest('POST', '/api/login_check', ['username' => $email, 'password' => $password ?? self::validPassword()]);
        self::assertResponseStatusCodeSame(204, 'La connexion aurait dû réussir.');
    }

    /**
     * @param array<string, mixed>|null $body
     * @param array<string, string>     $server
     */
    protected function jsonRequest(string $method, string $uri, ?array $body = null, array $server = []): void
    {
        $this->client->request($method, $uri, [], [], $server + [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT'  => 'application/json',
        ], $body === null ? null : json_encode($body, JSON_THROW_ON_ERROR));
    }

    /** @return array<mixed> */
    protected function responseJson(): array
    {
        return json_decode((string) $this->client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
    }

    /**
     * Envoie un événement de webhook signé comme le ferait Stripe.
     *
     * @param array<string, mixed> $object
     */
    protected function postWebhook(string $type, array $object, ?string $secret = FakeStripeGateway::WEBHOOK_SECRET): void
    {
        $payload = json_encode([
            'id'     => 'evt_test_' . bin2hex(random_bytes(6)),
            'object' => 'event',
            'type'   => $type,
            'data'   => ['object' => $object],
        ], JSON_THROW_ON_ERROR);

        $timestamp = time();
        $signature = 't=' . $timestamp . ',v1=' . hash_hmac('sha256', $timestamp . '.' . $payload, (string) $secret);

        // Stripe n'envoie ni cookie ni Origin
        $this->client->getCookieJar()->clear();
        $this->client->request('POST', '/api/stripe/webhook', [], [], [
            'CONTENT_TYPE'          => 'application/json',
            'HTTP_STRIPE_SIGNATURE' => $signature,
        ], $payload);
    }
}
