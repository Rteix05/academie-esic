<?php

namespace App\Entity;

use App\Repository\EventRegistrationRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EventRegistrationRepository::class)]
#[ORM\Table(name: 'event_registration')]
#[ORM\UniqueConstraint(name: 'uniq_event_registration_event_user', columns: ['event_id', 'user_id'])]
class EventRegistration
{
    /** Durée pendant laquelle une place est réservée en attente de paiement */
    public const PENDING_TTL = '35 minutes';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // Suppression d'un événement ou d'un compte : ses inscriptions suivent
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Event $event = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\Column]
    private \DateTimeImmutable $registeredAt;

    #[ORM\Column(length: 50, enumType: RegistrationStatus::class, options: ['default' => 'free'])]
    private RegistrationStatus $status = RegistrationStatus::Free;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $stripeSessionId = null;

    public function __construct()
    {
        $this->registeredAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getEvent(): ?Event { return $this->event; }
    public function setEvent(?Event $event): static { $this->event = $event; return $this; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }

    public function getRegisteredAt(): \DateTimeImmutable { return $this->registeredAt; }
    public function setRegisteredAt(\DateTimeImmutable $registeredAt): static { $this->registeredAt = $registeredAt; return $this; }

    /** Inscription effective (gratuite ou payée), par opposition à une réservation en attente */
    public function isConfirmed(): bool { return $this->status !== RegistrationStatus::Pending; }

    /** Réservation en attente de paiement dont le délai est dépassé : la place est libérée */
    public function isExpiredPending(): bool
    {
        return $this->status === RegistrationStatus::Pending
            && $this->registeredAt < new \DateTimeImmutable('-' . self::PENDING_TTL);
    }

    public function getStatus(): RegistrationStatus { return $this->status; }
    public function setStatus(RegistrationStatus $status): static { $this->status = $status; return $this; }

    public function getStripeSessionId(): ?string { return $this->stripeSessionId; }
    public function setStripeSessionId(?string $id): static { $this->stripeSessionId = $id; return $this; }
}
