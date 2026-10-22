<?php

namespace App\Tests\Functional;

use App\Entity\Formation;
use App\Tests\ApiTestCase;

/**
 * Salle de cours : le lien vidéo et le support PDF d'une formation ne sont
 * communiqués qu'aux élèves qui y ont accès.
 */
final class CourseContentTest extends ApiTestCase
{
    private const VIDEO = 'https://vimeo.com/123456789';

    public function testOwnerGetsVideoLinkAndPdfAvailability(): void
    {
        $formation = $this->createCourse();
        $formation->addUser($this->createUser());
        $this->em()->flush();

        $this->login();
        $this->client->request('GET', '/api/content/formation/' . $formation->getId());
        self::assertResponseIsSuccessful();
        $content = $this->responseJson();
        self::assertSame(self::VIDEO, $content['video']);
        // Le fichier PDF de test n'existe pas sur le disque : non proposé au téléchargement
        self::assertFalse($content['pdfAvailable']);
        self::assertSame($formation->getTitle(), $content['formation']['title']);
    }

    public function testFormationWithoutContentReturnsNulls(): void
    {
        $formation = $this->createFormation()->setVideoUrl(null)->setPdfFile(null);
        $formation->addUser($this->createUser());
        $this->em()->flush();

        $this->login();
        $this->client->request('GET', '/api/content/formation/' . $formation->getId());
        $content = $this->responseJson();
        self::assertNull($content['video']);
        self::assertFalse($content['pdfAvailable']);
    }

    public function testOwnerKeepsAccessAfterTheFormationIsUnpublished(): void
    {
        $formation = $this->createCourse();
        $formation->addUser($this->createUser());
        $formation->setIsPublished(false);
        $this->em()->flush();

        $this->login();
        $this->client->request('GET', '/api/content/formation/' . $formation->getId());
        self::assertResponseIsSuccessful();
        $content = $this->responseJson();
        self::assertSame(self::VIDEO, $content['video']);
        self::assertSame($formation->getTitle(), $content['formation']['title']);
        self::assertSame($formation->getDescription(), $content['formation']['description']);

        // La fiche publique, elle, n'existe plus pour les visiteurs
        $this->client->request('GET', '/api/formations/' . $formation->getId());
        self::assertResponseStatusCodeSame(404);
    }

    public function testNonOwnerIsForbidden(): void
    {
        $formation = $this->createCourse();
        $this->createUser();

        $this->login();
        $this->client->request('GET', '/api/content/formation/' . $formation->getId());
        self::assertResponseStatusCodeSame(403);
        self::assertArrayNotHasKey('video', $this->responseJson());
        self::assertArrayNotHasKey('formation', $this->responseJson());
    }

    public function testContentRequiresLogin(): void
    {
        $formation = $this->createCourse();

        $this->client->request('GET', '/api/content/formation/' . $formation->getId());
        self::assertResponseStatusCodeSame(401);
    }

    private function createCourse(): Formation
    {
        $formation = $this->createFormation()->setVideoUrl(self::VIDEO)->setPdfFile('support-absent.pdf');
        $this->em()->flush();

        return $formation;
    }
}
