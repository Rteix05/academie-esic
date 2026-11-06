<?php

namespace App\Tests\Functional;

use App\Entity\User;
use App\Tests\ApiTestCase;

/**
 * Parcours guidé après l'inscription : centres d'intérêt, niveau et objectif de l'élève.
 */
final class LearningPreferencesTest extends ApiTestCase
{
    private function freshUser(string $email = 'eleve@test.fr'): ?User
    {
        $this->em()->clear();

        return $this->em()->getRepository(User::class)->findOneBy(['email' => $email]);
    }

    public function testNewStudentHasNotCompletedTheGuidedTour(): void
    {
        $this->createUser();
        $this->login();

        $this->jsonRequest('GET', '/api/me');
        self::assertResponseIsSuccessful();
        $me = $this->responseJson();
        self::assertFalse($me['onboarded']);
        self::assertSame(['interests' => [], 'level' => null, 'goal' => null], $me['preferences']);
    }

    public function testStudentSavesPreferences(): void
    {
        $this->createUser();
        $this->login();

        $this->jsonRequest('PUT', '/api/me/preferences', [
            'interests' => ['Ministère', 'Formation biblique', 'Ministère'],
            'level'     => 'Débutant',
            'goal'      => 'ecole-biblique',
        ]);
        self::assertResponseIsSuccessful();

        // Ordre de référence, sans doublon
        self::assertSame(['Formation biblique', 'Ministère'], $this->responseJson()['preferences']['interests']);

        $user = $this->freshUser();
        self::assertSame(['Formation biblique', 'Ministère'], $user->getInterests());
        self::assertSame('Débutant', $user->getLearningLevel());
        self::assertSame('ecole-biblique', $user->getLearningGoal());
        self::assertNotNull($user->getOnboardedAt());

        $this->jsonRequest('GET', '/api/me');
        self::assertTrue($this->responseJson()['onboarded']);
    }

    public function testSkippingTheTourMarksItAsSeen(): void
    {
        $this->createUser();
        $this->login();

        $this->jsonRequest('PUT', '/api/me/preferences', []);
        self::assertResponseIsSuccessful();

        $user = $this->freshUser();
        self::assertNotNull($user->getOnboardedAt());
        self::assertSame([], $user->getInterests());
    }

    /** @return iterable<string, array{array<string, mixed>}> */
    public static function invalidPreferences(): iterable
    {
        yield 'domaine inconnu' => [['interests' => ['Cuisine']]];
        yield 'domaines mal formés' => [['interests' => 'Ministère']];
        yield 'niveau inconnu' => [['level' => 'Expert']];
        yield 'objectif inconnu' => [['goal' => 'astronaute']];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('invalidPreferences')]
    public function testUnknownChoicesAreRejected(array $body): void
    {
        $this->createUser();
        $this->login();

        $this->jsonRequest('PUT', '/api/me/preferences', $body);
        self::assertResponseStatusCodeSame(422);
        self::assertNull($this->freshUser()->getOnboardedAt());
    }

    public function testPreferencesRequireAuthentication(): void
    {
        $this->jsonRequest('PUT', '/api/me/preferences', ['interests' => []]);
        self::assertResponseStatusCodeSame(401);
    }

    public function testAnswersAppearInBackOfficeStatistics(): void
    {
        $this->createUser()->setInterests(['Ministère', 'Discipulat'])->setLearningGoal('ecole-biblique')->setOnboardedAt(new \DateTimeImmutable());
        $this->createUser('autre@test.fr')->setInterests(['Ministère'])->setOnboardedAt(new \DateTimeImmutable());
        $this->createUser('passe@test.fr')->setOnboardedAt(new \DateTimeImmutable());
        $this->em()->flush();

        $this->client->loginUser($this->createUser('admin@test.fr', ['ROLE_ADMIN']), 'main');
        $this->client->request('GET', '/admin');
        self::assertResponseIsSuccessful();

        $panel = $this->client->getCrawler()->filter('section[aria-labelledby="stats-learners-title"]');
        self::assertStringContainsString('2 élèves ont répondu', $panel->text());
        self::assertStringContainsString('Ministère 2 élèves · 100 %', preg_replace('/\s+/u', ' ', $panel->text()));
        self::assertStringContainsString('École biblique', $panel->text());
    }

    public function testBackOfficeShowsStudentPreferences(): void
    {
        $student = $this->createUser()->setInterests(['Discipulat'])->setLearningLevel('Avancé')->setLearningGoal('indecis');
        $this->em()->flush();

        $this->client->loginUser($this->createUser('admin@test.fr', ['ROLE_ADMIN']), 'main');
        $this->client->request('GET', '/admin/user/' . $student->getId());
        self::assertResponseIsSuccessful();

        $text = $this->client->getCrawler()->filter('body')->text();
        self::assertStringContainsString('Discipulat', $text);
        self::assertStringContainsString('Avancé', $text);
        self::assertStringContainsString('Je ne sais pas encore', $text);
    }
}
