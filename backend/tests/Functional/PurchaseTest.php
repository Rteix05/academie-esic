<?php

namespace App\Tests\Functional;

use App\Entity\MasterclassPurchase;
use App\Entity\Payment;
use App\Entity\ProductType;
use App\Legal\SalesTerms;
use App\Tests\ApiTestCase;
use App\Tests\Double\FakeStripeGateway;
use PHPUnit\Framework\Attributes\DataProvider;

/**
 * Parcours d'achat : consentements (CGV, accès immédiat), création de session, webhook signé,
 * confirmation par le navigateur, idempotence et historique au montant réellement payé.
 */
final class PurchaseTest extends ApiTestCase
{
    /** Consentements cochés par le client avant le paiement */
    private const CONSENTS = ['acceptCgv' => true, 'immediateAccess' => true];

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

        $this->jsonRequest('POST', '/api/stripe/checkout/formation/' . $formation->getId(), self::CONSENTS);
        self::assertResponseIsSuccessful();
        self::assertStringStartsWith('https://checkout.stripe.test/', $this->responseJson()['url']);

        $params = FakeStripeGateway::$createdSessions[0];
        self::assertSame(14999, $params['line_items'][0]['price_data']['unit_amount'], 'Pas de perte de centime à l\'arrondi');
        self::assertSame('eleve@test.fr', $params['metadata']['user_email']);
        self::assertSame((string) $formation->getId(), $params['metadata']['formation_id']);

        // Consentements transmis à Stripe pour être enregistrés avec le paiement
        self::assertSame(SalesTerms::CGV_VERSION, $params['metadata'][SalesTerms::META_CGV_VERSION]);
        self::assertNotFalse(\DateTimeImmutable::createFromFormat(\DateTimeInterface::ATOM, $params['metadata'][SalesTerms::META_CGV_ACCEPTED_AT]));
        self::assertArrayHasKey(SalesTerms::META_IMMEDIATE_ACCESS_AT, $params['metadata']);
    }

    /**
     * @return iterable<string, array{0: array<string, mixed>|null, 1: list<string>}>
     */
    public static function missingConsents(): iterable
    {
        yield 'aucun consentement' => [null, ['acceptCgv', 'immediateAccess']];
        yield 'CGV seules' => [['acceptCgv' => true], ['immediateAccess']];
        yield 'accès immédiat seul' => [['immediateAccess' => true], ['acceptCgv']];
        yield 'valeurs non booléennes' => [['acceptCgv' => 'oui', 'immediateAccess' => 1], ['acceptCgv', 'immediateAccess']];
    }

    /**
     * @param array<string, mixed>|null $body
     * @param list<string> $missing
     */
    #[DataProvider('missingConsents')]
    public function testCheckoutRequiresBothConsents(?array $body, array $missing): void
    {
        $this->createUser();
        $formation = $this->createFormation(price: 99.0);
        $masterclass = $this->createMasterclass();
        $this->login();

        foreach (['/api/stripe/checkout/formation/' . $formation->getId(), '/api/stripe/checkout/' . $masterclass->getId() . '/pack'] as $uri) {
            $this->jsonRequest('POST', $uri, $body);
            self::assertResponseStatusCodeSame(422);
            self::assertSame($missing, $this->responseJson()['missing']);
        }

        self::assertSame([], FakeStripeGateway::$createdSessions, 'Aucune session de paiement sans consentement');
    }

    public function testFulfillmentRecordsConsentsAndConfirmationEmailQuotesThem(): void
    {
        $user = $this->createUser();
        $masterclass = $this->createMasterclass();
        $consentedAt = '2026-10-01T10:15:00+02:00';
        $session = FakeStripeGateway::sessionData('cs_test_consent', [
            'user_email' => 'eleve@test.fr', 'masterclass_id' => (string) $masterclass->getId(), 'option' => 'video',
            SalesTerms::META_CGV_VERSION         => SalesTerms::CGV_VERSION,
            SalesTerms::META_CGV_ACCEPTED_AT     => $consentedAt,
            SalesTerms::META_IMMEDIATE_ACCESS_AT => $consentedAt,
        ], amountTotal: 2900);

        $this->postWebhook('checkout.session.completed', $session);
        self::assertResponseIsSuccessful();

        $payment = $this->em()->getRepository(Payment::class)->findOneBy(['user' => $user->getId()]);
        self::assertSame(SalesTerms::CGV_VERSION, $payment?->getCgvVersion());
        self::assertEquals(new \DateTimeImmutable($consentedAt), $payment->getCgvAcceptedAt());
        self::assertEquals(new \DateTimeImmutable($consentedAt), $payment->getImmediateAccessConsentAt());

        // Confirmation sur support durable : récapitulatif, CGV acceptées et mention de renonciation
        self::assertEmailCount(1);
        $email = self::getMailerMessage();
        self::assertEmailHeaderSame($email, 'Subject', 'Confirmation de votre commande – Académie E.S.I.C.');
        self::assertEmailHtmlBodyContains($email, '29,00 EUR');
        self::assertEmailHtmlBodyContains($email, 'version du ' . SalesTerms::CGV_VERSION);
        self::assertEmailHtmlBodyContains($email, htmlspecialchars(SalesTerms::IMMEDIATE_ACCESS_CONSENT, ENT_QUOTES));
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
