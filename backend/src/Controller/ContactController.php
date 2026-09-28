<?php

namespace App\Controller;

use App\Mailer\AppMailer;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Formulaire de contact du site : transmet le message à l'Académie (réponse directe au visiteur)
 * et envoie un accusé de réception au visiteur.
 *
 * Anti-spam : limitation de débit par IP et champ piège (« website ») invisible pour les humains,
 * que seuls les robots remplissent.
 */
class ContactController extends AbstractController
{
    #[Route('/api/contact', name: 'api_contact', methods: ['POST'])]
    public function send(
        Request $request,
        ValidatorInterface $validator,
        AppMailer $mailer,
        RateLimiterFactoryInterface $contactLimiter,
        LoggerInterface $logger,
    ): JsonResponse {
        $limit = $contactLimiter->create($request->getClientIp())->consume();
        if (!$limit->isAccepted()) {
            return $this->json(
                ['message' => 'Vous avez envoyé plusieurs messages récemment. Réessayez un peu plus tard.'],
                429,
                ['Retry-After' => $limit->getRetryAfter()->getTimestamp() - time()]
            );
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Requête invalide.'], 400);
        }

        // Champ piège rempli : robot. Réponse identique à un succès pour ne pas le renseigner.
        if (trim((string) ($data['website'] ?? '')) !== '') {
            $logger->info('Formulaire de contact : envoi de robot ignoré', ['ip' => $request->getClientIp()]);

            return $this->json(['message' => 'Votre message a bien été envoyé.']);
        }

        $fields = [
            'name'    => trim((string) ($data['name'] ?? '')),
            'email'   => mb_strtolower(trim((string) ($data['email'] ?? ''))),
            'subject' => (string) ($data['subject'] ?? 'autre'),
            'message' => trim(str_replace("\r\n", "\n", (string) ($data['message'] ?? ''))),
        ];

        $violations = $validator->validate($fields, new Assert\Collection([
            'name' => [
                new Assert\NotBlank(message: 'Veuillez indiquer votre nom.'),
                new Assert\Length(max: 100, maxMessage: 'Le nom est trop long.'),
            ],
            'email' => [
                new Assert\NotBlank(message: 'Veuillez indiquer votre adresse email.'),
                new Assert\Email(message: 'Adresse email invalide.', mode: Assert\Email::VALIDATION_MODE_HTML5),
                new Assert\Length(max: 180, maxMessage: 'Adresse email trop longue.'),
            ],
            'subject' => [
                new Assert\Choice(choices: array_keys(AppMailer::CONTACT_SUBJECTS), message: 'Sujet invalide.'),
            ],
            'message' => [
                new Assert\NotBlank(message: 'Veuillez écrire votre message.'),
                new Assert\Length(min: 10, max: 5000, minMessage: 'Votre message est trop court (10 caractères minimum).', maxMessage: 'Votre message est trop long (5000 caractères maximum).'),
            ],
        ]));

        if (count($violations) > 0) {
            return $this->json([
                'message' => $violations[0]->getMessage(),
                'errors'  => array_map(
                    fn ($v) => ['field' => trim($v->getPropertyPath(), '[]'), 'message' => $v->getMessage()],
                    iterator_to_array($violations)
                ),
            ], 422);
        }

        if (!$mailer->sendContactMessage($fields['name'], $fields['email'], $fields['subject'], $fields['message'])) {
            return $this->json(['message' => 'Votre message n\'a pas pu être envoyé. Réessayez ou écrivez-nous directement par email.'], 502);
        }

        return $this->json(['message' => 'Votre message a bien été envoyé.']);
    }
}
