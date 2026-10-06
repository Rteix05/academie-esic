<?php

namespace App\Tests\Functional;

use App\Entity\Formation;
use App\Entity\InstitutAccess;
use App\Entity\Payment;
use App\Entity\ProductType;
use App\Institut\InstitutPack;
use App\Legal\SalesTerms;
use App\Tests\ApiTestCase;
use App\Tests\Double\FakeStripeGateway;

/**
 * Accès complets aux instituts (achat unique, accès à vie) : offres, paiement, attribution
 * par webhook ou confirmation, accès aux formations de l'institut.
 */
final class InstitutPackTest extends ApiTestCase
{
    private const CONSENTS = ['acceptCgv' => true, 'immediateAccess' => true];

    public function testPacksListOneTimeOffersFromStripe(): void
    {
        $this->client->request('GET', '/api/institut-packs');
        self::assertResponseIsSuccessful();

        $packs = array_column($this->responseJson(), null, 'pack');
        self::assertSame(42.99, $packs['institut-biblique']['amount']);
        self::assertSame(52.99, $packs['ecole-ministere']['amount']);
        self::assertSame('Institut Biblique Théologique', $packs['institut-biblique']['institut']);
        self::assertSame('EUR', $packs['ecole-ministere']['currency']);
    }

    public function testCheckoutCreatesOneTimePaymentSession(): void
    {
        $this->createUser();
        $this->login();

        $this->jsonRequest('POST', '/api/stripe/checkout/institut/institut-biblique', self::CONSENTS);
        self::assertResponseIsSuccessful();
        self::assertStringStartsWith('https://checkout.stripe.test/', $this->responseJson()['url']);

        $params = FakeStripeGateway::$createdSessions[0];
        self::assertSame('payment', $params['mode']);
        self::assertSame([['price' => 'price_test_institut', 'quantity' => 1]], $params['line_items']);
        self::assertSame('eleve@test.fr', $params['customer_email']);
        self::assertSame('eleve@test.fr', $params['metadata']['user_email']);
        self::assertSame('institut-biblique', $params['metadata'][InstitutPack::META]);
        self::assertSame(SalesTerms::CGV_VERSION, $params['metadata'][SalesTerms::META_CGV_VERSION]);
        self::assertArrayHasKey(SalesTerms::META_IMMEDIATE_ACCESS_AT, $params['metadata']);
    }

    public function testCheckoutRequiresConsentsAndKnownPack(): void
    {
        $this->createUser();
        $this->login();

        $this->jsonRequest('POST', '/api/stripe/checkout/institut/institut-biblique', ['acceptCgv' => true]);
        self::assertResponseStatusCodeSame(422);
        self::assertSame(['immediateAccess'], $this->responseJson()['missing']);

        $this->jsonRequest('POST', '/api/stripe/checkout/institut/inconnu', self::CONSENTS);
        self::assertResponseStatusCodeSame(404);

        self::assertSame([], FakeStripeGateway::$createdSessions);
    }

    public function testCheckoutRequiresLogin(): void
    {
        $this->jsonRequest('POST', '/api/stripe/checkout/institut/institut-biblique', self::CONSENTS);
        self::assertResponseStatusCodeSame(401);
    }

    public function testPaidPackGrantsPublishedFormationsOfItsInstitut(): void
    {
        $this->createUser();
        $biblique = $this->createInstitutFormation(InstitutPack::InstitutBiblique);
        $ecole = $this->createInstitutFormation(InstitutPack::EcoleMinistere);
        $this->createInstitutFormation(InstitutPack::InstitutBiblique, published: false);

        $this->postWebhook('checkout.session.completed', FakeStripeGateway::sessionData('cs_ibt', $this->metadata(InstitutPack::InstitutBiblique), 4299));
        self::assertResponseIsSuccessful();

        $this->login();
        $this->client->request('GET', '/api/mes-formations');
        self::assertSame([['id' => $biblique->getId(), 'title' => 'Formation test', 'category' => 'Discipulat', 'access' => 'institut']], $this->responseJson());

        // Support PDF : accès accordé (le fichier de test n'existe pas : 404, pas 403)
        $this->client->request('GET', '/api/content/formation/' . $biblique->getId() . '/pdf');
        self::assertResponseStatusCodeSame(404);
        $this->client->request('GET', '/api/content/formation/' . $ecole->getId() . '/pdf');
        self::assertResponseStatusCodeSame(403);

        // Formation publiée après l'achat : incluse elle aussi
        $later = $this->createInstitutFormation(InstitutPack::InstitutBiblique);
        $this->client->request('GET', '/api/mes-formations');
        self::assertSame([$biblique->getId(), $later->getId()], array_column($this->responseJson(), 'id'));

        $this->client->request('GET', '/api/mes-instituts');
        $mine = $this->responseJson();
        self::assertCount(1, $mine);
        self::assertSame('institut-biblique', $mine[0]['pack']);
        self::assertSame('Institut Biblique Théologique', $mine[0]['institut']);
    }

    public function testWebhookRecordsPaymentAndSendsConfirmationOnce(): void
    {
        $user = $this->createUser();
        $session = FakeStripeGateway::sessionData('cs_ecole', $this->metadata(InstitutPack::EcoleMinistere), 5299);

        $this->postWebhook('checkout.session.completed', $session);
        self::assertResponseIsSuccessful();

        // Confirmation de commande (support durable : accès acheté, montant, CGV acceptées)
        self::assertEmailCount(1);
        self::assertEmailHtmlBodyContains(self::getMailerMessage(), InstitutPack::EcoleMinistere->label());

        // Webhook rejoué : ni doublon ni nouvel email
        $this->postWebhook('checkout.session.completed', $session);
        self::assertResponseIsSuccessful();
        self::assertEmailCount(0);

        $payments = $this->em()->getRepository(Payment::class)->findBy(['user' => $user->getId()]);
        self::assertCount(1, $payments);
        self::assertSame(ProductType::Institut, $payments[0]->getProductType());
        self::assertSame(InstitutPack::EcoleMinistere->productId(), $payments[0]->getProductId());
        self::assertSame(5299, $payments[0]->getAmountCents());
        self::assertSame(SalesTerms::CGV_VERSION, $payments[0]->getCgvVersion());

        self::assertCount(1, $this->em()->getRepository(InstitutAccess::class)->findBy(['user' => $user->getId()]));
    }

    public function testConfirmThenWebhookGrantsAccessOnce(): void
    {
        $user = $this->createUser();
        $session = FakeStripeGateway::addSession('cs_confirm_ibt', $this->metadata(InstitutPack::InstitutBiblique), 4299);

        $this->login();
        $this->jsonRequest('POST', '/api/stripe/confirm', ['session_id' => 'cs_confirm_ibt']);
        self::assertResponseIsSuccessful();
        self::assertSame('institut', $this->responseJson()['productType']);

        $this->postWebhook('checkout.session.completed', $session->toArray());
        self::assertResponseIsSuccessful();

        self::assertCount(1, $this->em()->getRepository(InstitutAccess::class)->findBy(['user' => $user->getId()]));
        self::assertCount(1, $this->em()->getRepository(Payment::class)->findBy(['user' => $user->getId()]));
    }

    public function testOwnerCannotBuyTheSamePackTwice(): void
    {
        $this->createUser();
        $this->postWebhook('checkout.session.completed', FakeStripeGateway::sessionData('cs_first', $this->metadata(InstitutPack::InstitutBiblique), 4299));

        $this->login();
        $this->jsonRequest('POST', '/api/stripe/checkout/institut/institut-biblique', self::CONSENTS);
        self::assertResponseStatusCodeSame(409);

        // Autre institut : achat possible
        $this->jsonRequest('POST', '/api/stripe/checkout/institut/ecole-ministere', self::CONSENTS);
        self::assertResponseIsSuccessful();
    }

    public function testUnknownPackInPaidSessionGrantsNothing(): void
    {
        $user = $this->createUser();

        $this->postWebhook('checkout.session.completed', FakeStripeGateway::sessionData('cs_unknown', ['user_email' => 'eleve@test.fr', InstitutPack::META => 'disparu'] + SalesTerms::consentMetadata(), 4299));
        self::assertResponseIsSuccessful();

        self::assertSame([], $this->em()->getRepository(InstitutAccess::class)->findBy(['user' => $user->getId()]));
        self::assertSame([], $this->em()->getRepository(Payment::class)->findBy(['user' => $user->getId()]));
    }

    private function createInstitutFormation(InstitutPack $pack, bool $published = true): Formation
    {
        $formation = $this->createFormation(published: $published)->setInstitut($pack->institut());
        $this->em()->flush();

        return $formation;
    }

    /** @return array<string, string> métadonnées posées par le site sur la session */
    private function metadata(InstitutPack $pack): array
    {
        return ['user_email' => 'eleve@test.fr', InstitutPack::META => $pack->value] + SalesTerms::consentMetadata();
    }
}
