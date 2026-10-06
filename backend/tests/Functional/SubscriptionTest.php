<?php

namespace App\Tests\Functional;

use App\Entity\Formation;
use App\Entity\Payment;
use App\Entity\ProductType;
use App\Entity\Subscription;
use App\Legal\SalesTerms;
use App\Subscription\SubscriptionManager;
use App\Subscription\SubscriptionPlan;
use App\Tests\ApiTestCase;
use App\Tests\Double\FakeStripeGateway;

/**
 * Abonnements mensuels par institut : offres, souscription, synchronisation par webhook,
 * accès aux formations de l'institut, échéances dans l'historique et résiliation.
 */
final class SubscriptionTest extends ApiTestCase
{
    private const CONSENTS = ['acceptCgv' => true, 'immediateAccess' => true];

    public function testPlansListMonthlyOffersFromStripe(): void
    {
        $this->client->request('GET', '/api/subscription-plans');
        self::assertResponseIsSuccessful();

        $plans = array_column($this->responseJson(), null, 'plan');
        self::assertSame(42.99, $plans['institut-biblique']['amount']);
        self::assertSame(52.99, $plans['ecole-ministere']['amount']);
        self::assertSame('Institut Biblique Théologique', $plans['institut-biblique']['institut']);
        self::assertSame('month', $plans['ecole-ministere']['interval']);
    }

    public function testCheckoutCreatesSubscriptionSession(): void
    {
        $this->createUser();
        $this->login();

        $this->jsonRequest('POST', '/api/stripe/checkout/subscription/institut-biblique', self::CONSENTS);
        self::assertResponseIsSuccessful();
        self::assertStringStartsWith('https://checkout.stripe.test/', $this->responseJson()['url']);

        $params = FakeStripeGateway::$createdSessions[0];
        self::assertSame('subscription', $params['mode']);
        self::assertSame([['price' => 'price_test_institut', 'quantity' => 1]], $params['line_items']);
        self::assertArrayNotHasKey('payment_method_types', $params);
        self::assertSame('eleve@test.fr', $params['customer_email']);

        // Métadonnées recopiées sur l'abonnement : rattachement à l'élève et preuve des consentements
        $metadata = $params['subscription_data']['metadata'];
        self::assertSame('eleve@test.fr', $metadata['user_email']);
        self::assertSame('institut-biblique', $metadata[SubscriptionManager::META_PLAN]);
        self::assertSame(SalesTerms::CGV_VERSION, $metadata[SalesTerms::META_CGV_VERSION]);
        self::assertArrayHasKey(SalesTerms::META_IMMEDIATE_ACCESS_AT, $metadata);
    }

    public function testCheckoutRequiresConsentsAndKnownPlan(): void
    {
        $this->createUser();
        $this->login();

        $this->jsonRequest('POST', '/api/stripe/checkout/subscription/institut-biblique', ['acceptCgv' => true]);
        self::assertResponseStatusCodeSame(422);
        self::assertSame(['immediateAccess'], $this->responseJson()['missing']);

        $this->jsonRequest('POST', '/api/stripe/checkout/subscription/inconnue', self::CONSENTS);
        self::assertResponseStatusCodeSame(404);

        self::assertSame([], FakeStripeGateway::$createdSessions);
    }

    public function testCheckoutRequiresLogin(): void
    {
        $this->jsonRequest('POST', '/api/stripe/checkout/subscription/institut-biblique', self::CONSENTS);
        self::assertResponseStatusCodeSame(401);
    }

    public function testActiveSubscriptionGrantsPublishedFormationsOfItsInstitut(): void
    {
        $this->createUser();
        $biblique = $this->createInstitutFormation(SubscriptionPlan::InstitutBiblique);
        $ecole = $this->createInstitutFormation(SubscriptionPlan::EcoleMinistere);
        $this->createInstitutFormation(SubscriptionPlan::InstitutBiblique, published: false);

        $this->postWebhook('customer.subscription.created', $this->putSubscription('sub_ibt', SubscriptionPlan::InstitutBiblique));
        self::assertResponseIsSuccessful();

        $this->login();
        $this->client->request('GET', '/api/mes-formations');
        self::assertSame([['id' => $biblique->getId(), 'title' => 'Formation test', 'category' => 'Discipulat', 'access' => 'abonnement']], $this->responseJson());

        // Support PDF : accès accordé (le fichier de test n'existe pas : 404, pas 403)
        $this->client->request('GET', '/api/content/formation/' . $biblique->getId() . '/pdf');
        self::assertResponseStatusCodeSame(404);
        $this->client->request('GET', '/api/content/formation/' . $ecole->getId() . '/pdf');
        self::assertResponseStatusCodeSame(403);
    }

    public function testCheckoutWebhookAndInvoicesRecordEachPaymentOnce(): void
    {
        $user = $this->createUser();
        $metadata = $this->metadata(SubscriptionPlan::EcoleMinistere);
        $this->putSubscription('sub_ecole', SubscriptionPlan::EcoleMinistere);

        $this->postWebhook('checkout.session.completed', FakeStripeGateway::addSubscriptionSession('cs_sub', 'sub_ecole', $metadata, 5299));
        self::assertResponseIsSuccessful();

        $first = $this->invoice('in_first', 'sub_ecole', 'subscription_create', 5299);
        $this->postWebhook('invoice.paid', $first);
        self::assertResponseIsSuccessful();

        // Confirmation de souscription (support durable : formule, montant, CGV acceptées)
        self::assertEmailCount(1);
        self::assertEmailHtmlBodyContains(self::getMailerMessage(), SubscriptionPlan::EcoleMinistere->label());

        // Webhook rejoué : ni doublon ni nouvel email
        $this->postWebhook('invoice.paid', $first);
        self::assertResponseIsSuccessful();
        self::assertEmailCount(0);

        $subscription = $this->em()->getRepository(Subscription::class)->findOneBy(['stripeSubscriptionId' => 'sub_ecole']);
        self::assertSame(SubscriptionPlan::EcoleMinistere, $subscription?->getPlan());
        self::assertSame(SalesTerms::CGV_VERSION, $subscription->getCgvVersion());

        $payments = $this->em()->getRepository(Payment::class)->findBy(['user' => $user->getId()]);
        self::assertCount(1, $payments);
        self::assertSame(ProductType::Subscription, $payments[0]->getProductType());
        self::assertSame(5299, $payments[0]->getAmountCents());
        self::assertSame(SalesTerms::CGV_VERSION, $payments[0]->getCgvVersion());

        // Renouvellement : nouvelle ligne d'historique, sans nouvel email (reçu envoyé par Stripe)
        $this->postWebhook('invoice.paid', $this->invoice('in_renewal', 'sub_ecole', 'subscription_cycle', 5299));
        self::assertCount(2, $this->em()->getRepository(Payment::class)->findBy(['user' => $user->getId()]));
        self::assertEmailCount(0);
    }

    public function testConfirmThenWebhookCreatesSubscriptionOnce(): void
    {
        $this->createUser();
        $this->putSubscription('sub_confirm', SubscriptionPlan::InstitutBiblique);
        $session = FakeStripeGateway::addSubscriptionSession('cs_confirm_sub', 'sub_confirm', $this->metadata(SubscriptionPlan::InstitutBiblique), 4299);

        $this->login();
        $this->jsonRequest('POST', '/api/stripe/confirm', ['session_id' => 'cs_confirm_sub']);
        self::assertResponseIsSuccessful();
        self::assertSame('subscription', $this->responseJson()['productType']);

        $this->postWebhook('checkout.session.completed', $session);
        self::assertResponseIsSuccessful();

        self::assertCount(1, $this->em()->getRepository(Subscription::class)->findBy(['stripeSubscriptionId' => 'sub_confirm']));
    }

    public function testCancellationKeepsAccessUntilPeriodEndThenRevokesIt(): void
    {
        $this->createUser();
        $formation = $this->createInstitutFormation(SubscriptionPlan::InstitutBiblique);
        $periodEnd = strtotime('+20 days');

        // Résiliation depuis le portail : effective à la fin de la période payée
        $this->postWebhook('customer.subscription.updated', $this->putSubscription('sub_cancel', SubscriptionPlan::InstitutBiblique, periodEnd: $periodEnd, cancelAtPeriodEnd: true));

        $this->login();
        $this->client->request('GET', '/api/mes-abonnements');
        $mine = $this->responseJson();
        self::assertTrue($mine[0]['active']);
        self::assertSame((new \DateTimeImmutable())->setTimestamp($periodEnd)->format(\DateTimeInterface::ATOM), $mine[0]['cancelAt']);
        $this->client->request('GET', '/api/mes-formations');
        self::assertSame($formation->getId(), $this->responseJson()[0]['id']);

        // Fin de période : Stripe supprime l'abonnement
        $this->postWebhook('customer.subscription.deleted', $this->putSubscription('sub_cancel', SubscriptionPlan::InstitutBiblique, status: 'canceled'));

        $this->login();
        $this->client->request('GET', '/api/mes-formations');
        self::assertSame([], $this->responseJson());
        $this->client->request('GET', '/api/mes-abonnements');
        self::assertFalse($this->responseJson()[0]['active']);
    }

    public function testActiveSubscriberCannotSubscribeTwiceButCanOpenPortal(): void
    {
        $this->createUser();
        $this->postWebhook('customer.subscription.created', $this->putSubscription('sub_dup', SubscriptionPlan::InstitutBiblique, customer: 'cus_eleve'));

        $this->login();
        $this->jsonRequest('POST', '/api/stripe/checkout/subscription/institut-biblique', self::CONSENTS);
        self::assertResponseStatusCodeSame(409);

        // Autre formule : même client Stripe réutilisé
        $this->jsonRequest('POST', '/api/stripe/checkout/subscription/ecole-ministere', self::CONSENTS);
        self::assertResponseIsSuccessful();
        self::assertSame('cus_eleve', FakeStripeGateway::$createdSessions[0]['customer']);
        self::assertArrayNotHasKey('customer_email', FakeStripeGateway::$createdSessions[0]);

        $this->jsonRequest('POST', '/api/stripe/portal');
        self::assertResponseIsSuccessful();
        self::assertSame(['cus_eleve'], FakeStripeGateway::$portalCustomers);
    }

    public function testPortalRequiresASubscription(): void
    {
        $this->createUser();
        $this->login();

        $this->jsonRequest('POST', '/api/stripe/portal');
        self::assertResponseStatusCodeSame(404);
    }

    public function testSubscriptionCreatedOutsideTheSiteIsIgnored(): void
    {
        $this->createUser();
        $data = FakeStripeGateway::putSubscription('sub_dashboard', []);

        $this->postWebhook('customer.subscription.created', $data);
        self::assertResponseIsSuccessful();

        self::assertNull($this->em()->getRepository(Subscription::class)->findOneBy(['stripeSubscriptionId' => 'sub_dashboard']));
    }

    private function createInstitutFormation(SubscriptionPlan $plan, bool $published = true): Formation
    {
        $formation = $this->createFormation(published: $published)->setInstitut($plan->institut());
        $this->em()->flush();

        return $formation;
    }

    /** @return array<string, string> métadonnées posées par le site sur la session et l'abonnement */
    private function metadata(SubscriptionPlan $plan): array
    {
        return ['user_email' => 'eleve@test.fr', SubscriptionManager::META_PLAN => $plan->value] + SalesTerms::consentMetadata();
    }

    /** @return array<string, mixed> */
    private function putSubscription(string $id, SubscriptionPlan $plan, string $status = 'active', ?int $periodEnd = null, bool $cancelAtPeriodEnd = false, string $customer = 'cus_test'): array
    {
        return FakeStripeGateway::putSubscription($id, $this->metadata($plan), $status, $periodEnd, $cancelAtPeriodEnd, $customer);
    }

    /** @return array<string, mixed> */
    private function invoice(string $id, string $subscriptionId, string $billingReason, int $amountPaid): array
    {
        return [
            'id'             => $id,
            'object'         => 'invoice',
            'amount_paid'    => $amountPaid,
            'currency'       => 'eur',
            'billing_reason' => $billingReason,
            'parent'         => ['type' => 'subscription_details', 'subscription_details' => ['subscription' => $subscriptionId]],
        ];
    }
}
