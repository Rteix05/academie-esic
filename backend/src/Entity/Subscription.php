<?php

namespace App\Entity;

use App\Repository\SubscriptionRepository;
use App\Subscription\SubscriptionPlan;
use Doctrine\ORM\Mapping as ORM;

/**
 * Abonnement mensuel d'un élève, copie locale de l'abonnement Stripe.
 *
 * Stripe reste la source de vérité : l'état (statut, fin de période, résiliation)
 * est mis à jour par les webhooks customer.subscription.* (cf. SubscriptionManager).
 */
#[ORM\Entity(repositoryClass: SubscriptionRepository::class)]
#[ORM\Table(name: 'subscription')]
#[ORM\UniqueConstraint(name: 'uniq_subscription_stripe_id', columns: ['stripe_subscription_id'])]
#[ORM\Index(name: 'idx_subscription_user', columns: ['user_id'])]
class Subscription
{
    /**
     * Statuts Stripe donnant accès au contenu. past_due : échec de prélèvement,
     * Stripe réessaie pendant quelques jours avant de résilier ; l'accès est maintenu en attendant.
     */
    public const ACCESS_STATUSES = ['active', 'trialing', 'past_due'];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\Column(length: 30, enumType: SubscriptionPlan::class)]
    private SubscriptionPlan $plan;

    #[ORM\Column(length: 255)]
    private string $stripeSubscriptionId;

    /** Client Stripe : nécessaire pour ouvrir le portail de gestion de l'abonnement */
    #[ORM\Column(length: 255)]
    private string $stripeCustomerId;

    /** Statut Stripe : incomplete, active, past_due, canceled, unpaid… */
    #[ORM\Column(length: 30)]
    private string $status;

    /** Fin de la période payée (prochain renouvellement) */
    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $currentPeriodEnd = null;

    /** Date de fin programmée après une résiliation (l'accès reste ouvert jusque-là) */
    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $cancelAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $endedAt = null;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    private \DateTimeImmutable $updatedAt;

    /*
     * Preuve des consentements recueillis avant la souscription (CGV, article 10),
     * comme pour Payment.
     */

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $cgvVersion = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $cgvAcceptedAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $immediateAccessConsentAt = null;

    public function __construct(User $user, SubscriptionPlan $plan, string $stripeSubscriptionId, string $stripeCustomerId, string $status)
    {
        $this->user = $user;
        $this->plan = $plan;
        $this->stripeSubscriptionId = $stripeSubscriptionId;
        $this->stripeCustomerId = $stripeCustomerId;
        $this->status = $status;
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = $this->createdAt;
    }

    public function getId(): ?int { return $this->id; }
    public function getUser(): User { return $this->user; }
    public function getPlan(): SubscriptionPlan { return $this->plan; }
    public function getStripeSubscriptionId(): string { return $this->stripeSubscriptionId; }
    public function getStripeCustomerId(): string { return $this->stripeCustomerId; }
    public function getStatus(): string { return $this->status; }
    public function getCurrentPeriodEnd(): ?\DateTimeImmutable { return $this->currentPeriodEnd; }
    public function getCancelAt(): ?\DateTimeImmutable { return $this->cancelAt; }
    public function getEndedAt(): ?\DateTimeImmutable { return $this->endedAt; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updatedAt; }

    public function grantsAccess(): bool
    {
        return in_array($this->status, self::ACCESS_STATUSES, true);
    }

    /** Recopie l'état de l'abonnement Stripe */
    public function updateState(string $status, ?\DateTimeImmutable $currentPeriodEnd, ?\DateTimeImmutable $cancelAt, ?\DateTimeImmutable $endedAt): static
    {
        $this->status = $status;
        $this->currentPeriodEnd = $currentPeriodEnd;
        $this->cancelAt = $cancelAt;
        $this->endedAt = $endedAt;
        $this->updatedAt = new \DateTimeImmutable();

        return $this;
    }

    public function recordConsents(string $cgvVersion, \DateTimeImmutable $cgvAcceptedAt, ?\DateTimeImmutable $immediateAccessConsentAt): static
    {
        $this->cgvVersion = mb_substr($cgvVersion, 0, 20);
        $this->cgvAcceptedAt = $cgvAcceptedAt;
        $this->immediateAccessConsentAt = $immediateAccessConsentAt;

        return $this;
    }

    public function getCgvVersion(): ?string { return $this->cgvVersion; }
    public function getCgvAcceptedAt(): ?\DateTimeImmutable { return $this->cgvAcceptedAt; }
    public function getImmediateAccessConsentAt(): ?\DateTimeImmutable { return $this->immediateAccessConsentAt; }
}
