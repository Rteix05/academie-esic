<?php

namespace App\Tests\Functional;

use App\Entity\EventRegistration;
use App\Entity\Formation;
use App\Entity\RegistrationStatus;
use App\Tests\ApiTestCase;

/**
 * Parcours du back-office EasyAdmin (régressions relevées lors des tests UX).
 */
final class BackOfficeTest extends ApiTestCase
{
    private function loginAsAdmin(): void
    {
        $this->client->loginUser($this->createUser('admin@test.fr', ['ROLE_ADMIN']), 'main');
    }

    public function testEmptyFormationShowsValidationErrorsInsteadOfServerError(): void
    {
        $this->loginAsAdmin();
        $crawler = $this->client->request('GET', '/admin/formation/new');
        self::assertResponseIsSuccessful();

        $form = $crawler->filter('form[name="Formation"]')->form();
        $this->client->submit($form, ['Formation[price]' => '', 'Formation[title]' => '']);

        self::assertResponseStatusCodeSame(422);
        self::assertSelectorTextContains('.invalid-feedback', 'ne doit pas être');
        self::assertSame(0, $this->em()->getRepository(Formation::class)->count([]));
    }

    public function testMasterclassWithoutDescriptionShowsAnErrorUnderTheField(): void
    {
        $this->loginAsAdmin();
        $crawler = $this->client->request('GET', '/admin/masterclass/new');

        // Le champ masqué de l'éditeur riche ne doit pas bloquer l'envoi côté navigateur
        self::assertCount(0, $crawler->filter('textarea[name="Masterclass[description]"][required], input[name="Masterclass[description]"][required]'));

        $form = $crawler->filter('form[name="Masterclass"]')->form();
        $this->client->submit($form, ['Masterclass[title]' => 'Sans description', 'Masterclass[speakerName]' => 'Formateur']);

        self::assertResponseStatusCodeSame(422);
        self::assertSelectorTextContains('.invalid-feedback', 'ne doit pas être vide');
    }

    public function testEventRegistrationCanBeEdited(): void
    {
        $this->loginAsAdmin();
        $registration = (new EventRegistration())
            ->setEvent($this->createEvent())
            ->setUser($this->createUser())
            ->setStatus(RegistrationStatus::Free);
        $this->em()->persist($registration);
        $this->em()->flush();

        $this->client->request('GET', '/admin/event-registration/' . $registration->getId() . '/edit');

        self::assertResponseIsSuccessful();
        self::assertSelectorTextContains('body', 'Événement test');
    }

    public function testBackOfficeIsInFrench(): void
    {
        $this->loginAsAdmin();
        $this->client->request('GET', '/admin/formation');

        self::assertResponseIsSuccessful();
        self::assertSelectorTextContains('body', 'Créer Formation');
    }
}
