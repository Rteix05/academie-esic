<?php

namespace App\EventListener;

use App\Entity\User;
use App\Repository\UserRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTDecodedEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

/**
 * Lie chaque JWT à l'état du mot de passe : une empreinte du hash est ajoutée
 * au token et revérifiée à chaque requête. Changer ou réinitialiser le mot de
 * passe invalide donc immédiatement tous les tokens déjà émis (ex. token volé).
 */
final class JwtPasswordFingerprintListener
{
    private const CLAIM = 'pwd';

    public function __construct(
        private readonly UserRepository $userRepository,
        #[Autowire('%kernel.secret%')] private readonly string $secret,
    ) {}

    #[AsEventListener(event: Events::JWT_CREATED)]
    public function onJwtCreated(JWTCreatedEvent $event): void
    {
        $user = $event->getUser();
        if (!$user instanceof User) {
            return;
        }

        $data = $event->getData();
        $data[self::CLAIM] = $this->fingerprint($user);
        $event->setData($data);
    }

    #[AsEventListener(event: Events::JWT_DECODED)]
    public function onJwtDecoded(JWTDecodedEvent $event): void
    {
        $payload = $event->getPayload();
        $identifier = $payload['username'] ?? null;
        $claim = $payload[self::CLAIM] ?? null;

        // Tokens émis avant ce mécanisme (sans empreinte) : reconnexion requise
        if (!is_string($identifier) || !is_string($claim)) {
            $event->markAsInvalid();
            return;
        }

        $user = $this->userRepository->findOneBy(['email' => $identifier]);
        if (!$user || !hash_equals($this->fingerprint($user), $claim)) {
            $event->markAsInvalid();
        }
    }

    private function fingerprint(User $user): string
    {
        // HMAC tronqué : ne révèle rien du hash du mot de passe
        return substr(hash_hmac('sha256', (string) $user->getPassword(), $this->secret), 0, 16);
    }
}
