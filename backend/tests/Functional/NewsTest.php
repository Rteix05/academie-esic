<?php

namespace App\Tests\Functional;

use App\Entity\News;
use App\Tests\ApiTestCase;

/**
 * Actualités publiques saisies depuis l'admin.
 */
final class NewsTest extends ApiTestCase
{
    public function testListsVisibleNewsMostRecentFirst(): void
    {
        $this->createNews('Ancienne', '-10 days');
        $this->createNews('Récente', '-1 day');
        $this->createNews('Brouillon', '-2 days', published: false);
        $this->createNews('Programmée', '+3 days');

        $this->client->request('GET', '/api/actualites');
        self::assertResponseIsSuccessful();

        $news = $this->responseJson();
        self::assertSame(['Récente', 'Ancienne'], array_column($news, 'title'));
        self::assertSame(['id', 'title', 'summary', 'publishedAt'], array_keys($news[0]));
    }

    public function testLimitIsAppliedAndBounded(): void
    {
        foreach (range(1, 3) as $i) {
            $this->createNews('Actualité ' . $i, "-$i days");
        }

        $this->client->request('GET', '/api/actualites?limit=2');
        self::assertSame(['Actualité 1', 'Actualité 2'], array_column($this->responseJson(), 'title'));

        $this->client->request('GET', '/api/actualites?limit=0');
        self::assertCount(1, $this->responseJson());
    }

    public function testListIsPublicAndReadOnly(): void
    {
        $this->client->request('GET', '/api/actualites');
        self::assertResponseIsSuccessful();
        self::assertSame([], $this->responseJson());

        $this->jsonRequest('POST', '/api/actualites', ['title' => 'Intrus']);
        self::assertResponseStatusCodeSame(405);
    }

    private function createNews(string $title, string $when, bool $published = true): News
    {
        $news = (new News())
            ->setTitle($title)
            ->setSummary('Résumé de « ' . $title . ' ».')
            ->setPublishedAt(new \DateTimeImmutable($when))
            ->setIsPublished($published);
        $this->em()->persist($news);
        $this->em()->flush();

        return $news;
    }
}
