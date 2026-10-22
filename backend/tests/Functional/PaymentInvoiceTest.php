<?php

namespace App\Tests\Functional;

use App\Entity\Payment;
use App\Entity\ProductType;
use App\Entity\User;
use App\Tests\ApiTestCase;
use App\Tests\Double\FakeStripeGateway;

/**
 * Factures Stripe téléchargeables depuis l'historique des paiements.
 */
final class PaymentInvoiceTest extends ApiTestCase
{
    public function testHistoryFlagsPaymentsWithInvoiceAndReturnsItsUrl(): void
    {
        $user = $this->createUser();
        $paid = $this->createPayment($user, 'cs_test_facture');
        $this->createPayment($user, null, 'Événement gratuit');
        FakeStripeGateway::$invoiceUrls['cs_test_facture'] = 'https://pay.stripe.test/invoice/acct/in_1/pdf';

        $this->login();
        $this->client->request('GET', '/api/payment-history');
        self::assertResponseIsSuccessful();
        $hasInvoice = array_column($this->responseJson(), 'hasInvoice', 'label');
        self::assertTrue($hasInvoice['Formation test']);
        self::assertFalse($hasInvoice['Événement gratuit']);

        $this->client->request('GET', '/api/payment-history/' . $paid->getId() . '/invoice');
        self::assertResponseIsSuccessful();
        self::assertSame('https://pay.stripe.test/invoice/acct/in_1/pdf', $this->responseJson()['url']);
    }

    public function testPaymentWithoutStripeInvoiceReturns404(): void
    {
        $user = $this->createUser();
        $withoutSession = $this->createPayment($user, null);
        $withoutInvoice = $this->createPayment($user, 'cs_test_ancien');

        $this->login();
        $this->client->request('GET', '/api/payment-history/' . $withoutSession->getId() . '/invoice');
        self::assertResponseStatusCodeSame(404);
        $this->client->request('GET', '/api/payment-history/' . $withoutInvoice->getId() . '/invoice');
        self::assertResponseStatusCodeSame(404);
    }

    public function testInvoiceOfAnotherUserIsNotDisclosed(): void
    {
        $other = $this->createUser('autre@test.fr');
        $payment = $this->createPayment($other, 'cs_test_autre');
        FakeStripeGateway::$invoiceUrls['cs_test_autre'] = 'https://pay.stripe.test/invoice/acct/in_2/pdf';

        $this->createUser();
        $this->login();
        $this->client->request('GET', '/api/payment-history/' . $payment->getId() . '/invoice');
        self::assertResponseStatusCodeSame(404);
        self::assertArrayNotHasKey('url', $this->responseJson());
    }

    public function testInvoiceRequiresLogin(): void
    {
        $this->client->request('GET', '/api/payment-history/1/invoice');
        self::assertResponseStatusCodeSame(401);
    }

    private function createPayment(User $user, ?string $sessionId, string $label = 'Formation test'): Payment
    {
        $payment = new Payment($user, ProductType::Formation, 1, $label, 10000, 'eur', $sessionId);
        $this->em()->persist($payment);
        $this->em()->flush();

        return $payment;
    }
}
