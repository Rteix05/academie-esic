<?php

namespace App\Tests\Functional;

use App\Tests\ApiTestCase;
use PHPUnit\Framework\Attributes\DataProvider;

/**
 * Formulaire de contact : notification à l'Académie (réponse au visiteur), accusé de réception,
 * validation et protections anti-spam (champ piège, limitation de débit).
 */
final class ContactTest extends ApiTestCase
{
    private const MESSAGE = [
        'name'    => 'Marie Test',
        'email'   => 'Marie.Test@Example.fr',
        'subject' => 'formation',
        'message' => "Bonjour,\nj'aimerais des informations sur la prochaine session.",
    ];

    public function testSendsNotificationToAcademyAndAcknowledgementToVisitor(): void
    {
        $this->jsonRequest('POST', '/api/contact', self::MESSAGE);
        self::assertResponseIsSuccessful();

        self::assertEmailCount(2);
        [$notification, $acknowledgement] = self::getMailerMessages();

        // Notification interne : adressée à l'Académie, réponse directe au visiteur
        self::assertEmailAddressContains($notification, 'To', 'panzusamuelpanzu@gmail.com');
        self::assertEmailAddressContains($notification, 'Reply-To', 'marie.test@example.fr');
        self::assertEmailHeaderSame($notification, 'Subject', '[Contact] Question sur une formation — Marie Test');
        self::assertEmailHtmlBodyContains($notification, 'la prochaine session');

        // Accusé de réception au visiteur, avec une copie de son message
        self::assertEmailAddressContains($acknowledgement, 'To', 'marie.test@example.fr');
        self::assertEmailHeaderSame($acknowledgement, 'Subject', 'Nous avons bien reçu votre message – Académie E.S.I.C.');
        self::assertEmailHtmlBodyContains($acknowledgement, 'la prochaine session');
    }

    public function testMessageIsEscapedInEmails(): void
    {
        $this->jsonRequest('POST', '/api/contact', ['message' => 'Test <script>alert(1)</script> <b>gras</b>'] + self::MESSAGE);
        self::assertResponseIsSuccessful();

        foreach (self::getMailerMessages() as $email) {
            self::assertEmailHtmlBodyNotContains($email, '<script>');
            self::assertEmailHtmlBodyContains($email, '&lt;script&gt;');
        }
    }

    /**
     * @param array<string, string> $override
     */
    #[DataProvider('invalidMessages')]
    public function testRejectsInvalidMessage(array $override, string $field): void
    {
        $this->jsonRequest('POST', '/api/contact', $override + self::MESSAGE);
        self::assertResponseStatusCodeSame(422);
        self::assertSame($field, $this->responseJson()['errors'][0]['field']);
        self::assertEmailCount(0);
    }

    /** @return iterable<string, array{array<string, string>, string}> */
    public static function invalidMessages(): iterable
    {
        yield 'nom vide' => [['name' => '  '], 'name'];
        yield 'email invalide' => [['email' => 'pas-un-email'], 'email'];
        yield 'sujet inconnu' => [['subject' => 'spam'], 'subject'];
        yield 'message trop court' => [['message' => 'Salut'], 'message'];
        yield 'message trop long' => [['message' => str_repeat('a', 5001)], 'message'];
    }

    public function testHoneypotSilentlyDropsBotMessages(): void
    {
        $this->jsonRequest('POST', '/api/contact', ['website' => 'https://spam.example'] + self::MESSAGE);
        self::assertResponseIsSuccessful(); // le robot ne doit pas savoir qu'il a été détecté
        self::assertEmailCount(0);
    }

    public function testContactIsRateLimited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->jsonRequest('POST', '/api/contact', ['message' => 'court'] + self::MESSAGE);
            self::assertResponseStatusCodeSame(422);
        }
        $this->jsonRequest('POST', '/api/contact', self::MESSAGE);
        self::assertResponseStatusCodeSame(429);
    }
}
