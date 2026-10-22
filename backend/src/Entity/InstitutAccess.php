<?php

namespace App\Entity;

use App\Institut\InstitutPack;
use App\Repository\InstitutAccessRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Accès complet à un institut acheté par un élève (paiement unique, accès à vie).
 * Le paiement correspondant, avec la preuve des consentements, est dans Payment.
 */
#[ORM\Entity(repositoryClass: InstitutAccessRepository::class)]
#[ORM\Table(name: 'institut_access')]
#[ORM\UniqueConstraint(name: 'uniq_institut_access_user_pack', columns: ['user_id', 'pack'])]
class InstitutAccess
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\Column(length: 30, enumType: InstitutPack::class)]
    private InstitutPack $pack;

    /** Session Stripe Checkout de l'achat (référence du paiement) */
    #[ORM\Column(length: 255)]
    private string $stripeSessionId;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    public function __construct(User $user, InstitutPack $pack, string $stripeSessionId)
    {
        $this->user = $user;
        $this->pack = $pack;
        $this->stripeSessionId = $stripeSessionId;
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getUser(): User { return $this->user; }
    public function getPack(): InstitutPack { return $this->pack; }
    public function getStripeSessionId(): string { return $this->stripeSessionId; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
}
