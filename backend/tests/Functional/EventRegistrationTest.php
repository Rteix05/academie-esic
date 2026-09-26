<?php

namespace App\Tests\Functional;

use App\Entity\EventRegistration;
use App\Entity\Payment;
use App\Entity\RegistrationStatus;
use App\Tests\ApiTestCase;
use App\Tests\Double\FakeStripeGateway;

final class EventRegistrationTest extends ApiTestCase
{
    public function testFreeEventRegistrationIsConfirmed(): void
    {
        $this->createUser();
        $event = $this->createEvent(price: 0.0);
        $this->login();

        $this->jsonRequest('POST', '/api/events/' . $event->getId() . '/register');
        self::assertResponseIsSuccessful();

        $this->client->request('GET', '/api/events/' . $event->getId() . '/status');
        self::assertTrue($this->responseJson()['isRegistered']);
        self::assertSame('free', $this->responseJson()['registrationStatus']);
    }

    public function testFullEventRefusesRegistration(): void
    {
        $event = $this->createEvent(price: 0.0, capacity: 1);
        $this->createUser('premier@test.fr');
        $this->createUser('second@test.fr');

        $this->login('premier@test.fr');
        $this->jsonRequest('POST', '/api/events/' . $event->getId() . '/register');
        self::assertResponseIsSuccessful();

        $this->login('second@test.fr');
        $this->jsonRequest('POST', '/api/events/' . $event->getId() . '/register');
        self::assertResponseStatusCodeSame(409);
    }

    public function testPaidEventReservesSeatUntilPaymentThenWebhookConfirms(): void
    {
        $user = $this->createUser();
        $event = $this->createEvent(price: 25.0, capacity: 10);
        $this->login();

        $this->jsonRequest('POST', '/api/events/' . $event->getId() . '/register');
        self::assertResponseIsSuccessful();
        self::assertArrayHasKey('url', $this->responseJson());

        $registration = $this->em()->getRepository(EventRegistration::class)->findOneBy(['user' => $user->getId()]);
        self::assertSame(RegistrationStatus::Pending, $registration->getStatus());

        // Une réservation en attente occupe une place
        $this->client->request('GET', '/api/events/' . $event->getId() . '/status');
        self::assertSame(9, $this->responseJson()['spotsLeft']);
        self::assertFalse($this->responseJson()['isRegistered']);

        $this->postWebhook('checkout.session.completed', FakeStripeGateway::sessionData($registration->getStripeSessionId(), [
            'user_email' => 'eleve@test.fr', 'event_id' => (string) $event->getId(),
        ], 2500));
        self::assertResponseIsSuccessful();

        $this->em()->clear();
        $registration = $this->em()->getRepository(EventRegistration::class)->findOneBy(['user' => $user->getId()]);
        self::assertSame(RegistrationStatus::Paid, $registration->getStatus());
        self::assertSame(2500, $this->em()->getRepository(Payment::class)->findOneBy(['user' => $user->getId()])?->getAmountCents());
    }

    public function testExpiredCheckoutReleasesSeat(): void
    {
        $user = $this->createUser();
        $event = $this->createEvent(price: 25.0, capacity: 1);
        $this->login();

        $this->jsonRequest('POST', '/api/events/' . $event->getId() . '/register');
        $sessionId = $this->em()->getRepository(EventRegistration::class)->findOneBy(['user' => $user->getId()])->getStripeSessionId();

        $this->postWebhook('checkout.session.expired', FakeStripeGateway::sessionData($sessionId, [], 2500, paymentStatus: 'unpaid'));
        self::assertResponseIsSuccessful();

        $this->em()->clear();
        self::assertNull($this->em()->getRepository(EventRegistration::class)->findOneBy(['user' => $user->getId()]));
    }
}
