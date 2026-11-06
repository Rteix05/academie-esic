<?php

namespace App\Tests\Functional;

use App\Entity\PageView;
use App\Entity\Payment;
use App\Entity\ProductType;
use App\Tests\ApiTestCase;

/**
 * Mesure d'audience interne et tableau de bord « Statistiques » du back-office.
 */
final class SiteStatisticsTest extends ApiTestCase
{
    private const BROWSER = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
    private const PHONE   = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

    private function track(array $body, string $userAgent = self::BROWSER): void
    {
        // Le frontend envoie du texte brut (requête simple, sans cookie)
        $this->client->getCookieJar()->clear();
        $this->client->request('POST', '/api/track', [], [], [
            'CONTENT_TYPE'    => 'text/plain;charset=UTF-8',
            'HTTP_USER_AGENT' => $userAgent,
        ], json_encode($body, JSON_THROW_ON_ERROR));
        self::assertResponseStatusCodeSame(204);
    }

    /** @return PageView[] */
    private function pageViews(): array
    {
        $this->em()->clear();

        return $this->em()->getRepository(PageView::class)->findBy([], ['id' => 'ASC']);
    }

    public function testPageViewIsRecordedWithoutPersonalData(): void
    {
        $this->track(['path' => '/formations/12?utm_source=newsletter#programme', 'referrer' => 'https://www.google.com/search?q=esic', 'entry' => true]);
        $this->track(['path' => '/formations/', 'referrer' => 'https://www.google.com/', 'entry' => false], self::PHONE);

        $views = $this->pageViews();
        self::assertCount(2, $views);

        // Chemin seul, sans paramètres ; provenance réduite au nom de domaine
        self::assertSame('/formations/12', $views[0]->getPath());
        self::assertSame('google.com', $views[0]->getReferrerHost());
        self::assertSame(PageView::DEVICE_DESKTOP, $views[0]->getDevice());
        self::assertTrue($views[0]->isEntry());
        self::assertMatchesRegularExpression('/^[0-9a-f]{16}$/', $views[0]->getVisitorHash());

        // Navigation interne : la provenance n'est pas répétée
        self::assertSame('/formations', $views[1]->getPath());
        self::assertNull($views[1]->getReferrerHost());
        self::assertSame(PageView::DEVICE_MOBILE, $views[1]->getDevice());
        self::assertNotSame($views[0]->getVisitorHash(), $views[1]->getVisitorHash());
    }

    public function testSameVisitorKeepsTheSameFingerprintDuringTheDay(): void
    {
        $this->track(['path' => '/', 'entry' => true]);
        $this->track(['path' => '/masterclass', 'entry' => false]);

        [$first, $second] = $this->pageViews();
        self::assertSame($first->getVisitorHash(), $second->getVisitorHash());
    }

    public function testRobotsAndInvalidPathsAreIgnored(): void
    {
        $this->track(['path' => '/'], 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
        $this->track(['path' => 'https://evil.example/<script>']);
        $this->track(['path' => '/<script>alert(1)</script>']);
        $this->track(['referrer' => 'https://google.com']);
        $this->client->request('POST', '/api/track', [], [], ['CONTENT_TYPE' => 'text/plain', 'HTTP_USER_AGENT' => self::BROWSER], 'pas du json');
        self::assertResponseStatusCodeSame(204);

        self::assertCount(0, $this->pageViews());
    }

    public function testOwnSiteIsNotCountedAsASource(): void
    {
        $this->track(['path' => '/contact', 'referrer' => self::FRONTEND_ORIGIN . '/formations', 'entry' => true]);

        self::assertNull($this->pageViews()[0]->getReferrerHost());
    }

    public function testDashboardShowsTrafficSignupsAndSales(): void
    {
        $student = $this->createUser('eleve@test.fr');
        $this->em()->persist(new PageView('/', 'aaaaaaaaaaaaaaaa', 'google.com', PageView::DEVICE_DESKTOP));
        $this->em()->persist(new PageView('/formations', 'aaaaaaaaaaaaaaaa', null, PageView::DEVICE_DESKTOP, false));
        $formation = $this->createFormation();
        $this->em()->persist(new PageView('/formations/' . $formation->getId(), 'bbbbbbbbbbbbbbbb', null, PageView::DEVICE_MOBILE));
        $this->em()->persist(new PageView('/', 'cccccccccccccccc', null, PageView::DEVICE_MOBILE, true, new \DateTimeImmutable('-100 days')));
        $this->em()->persist((new Payment($student, ProductType::Formation, 1, 'Introduction à la Bible', 4900, 'eur', null)));
        $this->em()->flush();

        $this->client->loginUser($this->createUser('admin@test.fr', ['ROLE_ADMIN']), 'main');
        $crawler = $this->client->request('GET', '/admin?periode=7');
        self::assertResponseIsSuccessful();

        $values = $crawler->filter('.stats-card-value')->each(fn ($n) => trim(preg_replace('/\s+/u', ' ', $n->text())));
        // Visiteurs, pages vues, nouveaux inscrits (élève + admin), achats, chiffre d'affaires
        self::assertSame(['2', '3', '2', '1', '49,00 €'], $values);

        $pages = $crawler->filter('.stats-path')->each(fn ($n) => trim($n->text()));
        self::assertContains('Formations (catalogue)', $pages);
        self::assertContains('Formation : Formation test', $pages);
        self::assertSelectorTextContains('.stats-bars-list', 'google.com');
        self::assertSelectorTextContains('#stats-products-title + table', 'Introduction à la Bible');
        self::assertSelectorExists('a[aria-current="page"][href="?periode=7"]');
    }

    public function testUnknownPeriodFallsBackToThirtyDays(): void
    {
        $this->client->loginUser($this->createUser('admin@test.fr', ['ROLE_ADMIN']), 'main');
        $this->client->request('GET', '/admin?periode=12345');

        self::assertResponseIsSuccessful();
        self::assertSelectorExists('a[aria-current="page"][href="?periode=30"]');
        self::assertSelectorTextContains('.stats-empty', 'Aucune visite');
    }

    public function testNewAccountsGetARegistrationDate(): void
    {
        $this->jsonRequest('POST', '/api/register', ['email' => 'nouveau@test.fr', 'password' => self::validPassword()]);
        self::assertResponseStatusCodeSame(201);

        $user = $this->em()->getRepository(\App\Entity\User::class)->findOneBy(['email' => 'nouveau@test.fr']);
        self::assertNotNull($user?->getCreatedAt());
    }
}
