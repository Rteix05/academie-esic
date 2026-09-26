<?php

namespace App\Tests\Functional;

use App\Entity\MasterclassPurchase;
use App\Entity\Payment;
use App\Entity\ProductType;
use App\Tests\ApiTestCase;
use App\Tests\Double\FakeStripeGateway;

/**
 * Parcours d'achat : création de session, webhook signé, confirmation par le navigateur,
 * idempotence et historique au montant réellement payé.
 */
final class PurchaseTest extends ApiTestCase
{
    public function testPaidFormationCannotBeEnrolledForFree(): void
    {
        $this->createUser();
        $formation = $this->createFormation(price: 150.0);
        $this->login();

        $this->jsonRequest('POST', '/api/formations/' . $formation->getId() . '/enroll');
        self::assertResponseStatusCodeSame(402);

        $this->client->request('GET', '/api/mes-formations');
        self::assertSame([], $this->responseJson());
    }

    public function testFreeFormationCanBeEnrolledDirectly(): void
    {
        $this->createUser();
        $formation = $this->createFormation(price: 0.0);
        $this->login();

        $this->jsonRequest('POST', '/api/formations/' . $formation->getId() . '/enroll');
        self::assertResponseIsSuccessful();

        $this->client->request('GET', '/api/mes-formations');
        self::assertSame($formation->getId(), $this->responseJson()[0]['id']);
    }

    public function testUnpublishedFormationCannotBeBought(): void
    {
        $this->createUser();
        $formation = $this->createFormation(published: false);
        $this->login();

        $this->jsonRequest('POST', '/api/stripe/checkout/formation/' . $formation->getId());
        self::assertResponseStatusCodeSame(404);
    }

    public function testCheckoutCreatesStripeSessionWithOwnerMetadata(): void
    {
        $this->createUser();
        $formation = $this->createFormation(price: 149.99);
        $this->login();

        $this->jsonRequest('POST', '/api/stripe/checkout/formation/' . $formation->getId());
        self::assertResponseIsSuccessful();
        self::assertStringStartsWith('https://checkout.stripe.test/', $this->responseJson()['url']);

        $params = FakeStripeGateway::$createdSessions[0];
        self::assertSame(14999, $params['line_items'][0]['price_data']['unit_amount'], 'Pas de perte de centime à l\'arrondi');
        self::assertSame('eleve@test.fr', $params['metadata']['user_email']);
        self::assertSame((string) $formation->getId(), $params['metadata']['formation_id']);
    }

    public function testWebhookGrantsMasterclassAndRecordsAmountPaid(): void
    {
        $user = $this->createUser();
        $masterclass = $this->createMasterclass();
        $session = FakeStripeGateway::sessionData('cs_test_mc', [
            'user_email' => 'eleve@test.fr', 'masterclass_id' => (string) $masterclass->getId(), 'option' => 'pack',
        ], amountTotal: 4500); // promo : payé 45 € au lieu de 50 €

        $this->postWebhook('checkout.session.completed', $session);
        self::assertResponseIsSuccessful();

        $purchase = $this->em()->getRepository(MasterclassPurchase::class)->findOneBy(['user' => $user->getId()]);
        self::assertSame('pack', $purchase?->getOption());

        $payments = $this->em()->getRepository(Payment::class)->findBy(['user' => $user->getId()]);
        self::assertCount(1, $payments);
        self::assertSame(4500, $payments[0]->getAmountCents(), 'Montant réellement payé, pas le prix catalogue');
        self::assertSame(ProductType::Masterclass, $payments[0]->getProductType());
    }

    public function testWebhookReplayIsIdempotent(): void
    {
        $user = $this->createUser();
        $formation = $this->createFormation();
        $session = FakeStripeGateway::sessionData('cs_test_replay', [
            'user_email' => 'eleve@test.fr', 'formation_id' => (string) $formation->getId(),
        ], amountTotal: 10000);

        $this->postWebhook('checkout.session.completed', $session);
        $this->postWebhook('checkout.session.completed', $session);
        self::assertResponseIsSuccessful();

        self::assertCount(1, $this->em()->getRepository(Payment::class)->findBy(['user' => $user->getId()]));
    }

    public function testWebhookRejectsInvalidSignature(): void
    {
        $this->postWebhook('checkout.session.completed', FakeStripeGateway::sessionData('cs_x', [], 100), secret: 'whsec_faux');
        self::assertResponseStatusCodeSame(400);
    }

    public function testWebhookIgnoresUnpaidSession(): void
    {
        $user = $this->createUser();
        $formation = $this->createFormation();

        $this->postWebhook('checkout.session.completed', FakeStripeGateway::sessionData('cs_unpaid', [
            'user_email' => 'eleve@test.fr', 'formation_id' => (string) $formation->getId(),
        ], 10000, paymentStatus: 'unpaid'));
        self::assertResponseIsSuccessful();

        self::assertCount(0, $this->em()->getRepository(Payment::class)->findBy(['user' => $user->getId()]));
    }

    public function testConfirmRejectsSessionOfAnotherUser(): void
    {
        $this->createUser('victime@test.fr');
        $this->createUser('attaquant@test.fr');
        $formation = $this->createFormation();
        FakeStripeGateway::addSession('cs_victime', [
            'user_email' => 'victime@test.fr', 'formation_id' => (string) $formation->getId(),
        ], 10000);

        $this->login('attaquant@test.fr');
        $this->jsonRequest('POST', '/api/stripe/confirm', ['session_id' => 'cs_victime']);
        self::assertResponseStatusCodeSame(403);

        $this->client->request('GET', '/api/mes-formations');
        self::assertSame([], $this->responseJson());
    }

    public function testConfirmThenWebhookGrantsOnceAndHistoryShowsAmount(): void
    {
        $this->createUser();
        $formation = $this->createFormation(price: 120.0);
        $metadata = ['user_email' => 'eleve@test.fr', 'formation_id' => (string) $formation->getId()];
        FakeStripeGateway::addSession('cs_confirm', $metadata, 9900);

        $this->login();
        $this->jsonRequest('POST', '/api/stripe/confirm', ['session_id' => 'cs_confirm']);
        self::assertResponseIsSuccessful();
        self::assertSame('formation', $this->responseJson()['productType']);

        // Le webhook arrive ensuite : aucun doublon
        $this->postWebhook('checkout.session.completed', FakeStripeGateway::sessionData('cs_confirm', $metadata, 9900));
        self::assertResponseIsSuccessful();

        $this->login();
        $this->client->request('GET', '/api/payment-history');
        $history = $this->responseJson();
        self::assertCount(1, $history);
        self::assertSame(99, (int) $history[0]['amount']);
        self::assertSame('formation', $history[0]['productType']);
        self::assertSame('EUR', $history[0]['currency']);
    }

    public function testEventConfirmEndpointRefusesFormationSession(): void
    {
        $this->createUser();
        $formation = $this->createFormation();
        FakeStripeGateway::addSession('cs_mauvais_type', ['user_email' => 'eleve@test.fr', 'formation_id' => (string) $formation->getId()], 10000);

        $this->login();
        $this->jsonRequest('POST', '/api/stripe/confirm/event', ['session_id' => 'cs_mauvais_type']);
        self::assertResponseStatusCodeSame(400);
    }
}
