<?php

namespace App\Entity;

use App\Repository\PaymentRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Trace d'un paiement encaissé (reçu) : montant réellement payé tel que retourné
 * par Stripe, figé au moment de l'achat. Sert à l'historique de paiement.
 *
 * L'unicité de stripeSessionId rend l'enregistrement idempotent entre le webhook
 * et les endpoints de confirmation appelés par le navigateur.
 */
#[ORM\Entity(repositoryClass: PaymentRepository::class)]
#[ORM\Table(name: 'payment')]
#[ORM\UniqueConstraint(name: 'uniq_payment_stripe_session', columns: ['stripe_session_id'])]
#[ORM\Index(name: 'idx_payment_user_created', columns: ['user_id', 'created_at'])]
class Payment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\Column(length: 20, enumType: ProductType::class)]
    private ProductType $productType;

    /** Identifiant du produit au moment de l'achat (le produit peut être supprimé ensuite) */
    #[ORM\Column]
    private int $productId;

    /** Libellé figé au moment de l'achat */
    #[ORM\Column(length: 255)]
    private string $label;

    /** Option de masterclass (pdf, video, pack) */
    #[ORM\Column(name: 'purchase_option', length: 20, nullable: true)]
    private ?string $option = null;

    /** Montant payé en centimes (évite les erreurs d'arrondi des flottants) */
    #[ORM\Column]
    private int $amountCents;

    #[ORM\Column(length: 3)]
    private string $currency = 'eur';

    /** Null uniquement pour les achats antérieurs à cet historique (reprise de données) */
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $stripeSessionId = null;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    /*
     * Preuve des consentements recueillis avant le paiement (CGV, article 10).
     * Null pour les achats antérieurs à leur recueil.
     */

    /** Version des CGV acceptée par le client pour cette commande */
    #[ORM\Column(length: 20, nullable: true)]
    private ?string $cgvVersion = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $cgvAcceptedAt = null;

    /** Demande expresse d'accès immédiat et renonciation au droit de rétractation */
    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $immediateAccessConsentAt = null;

    public function __construct(User $user, ProductType $productType, int $productId, string $label, int $amountCents, string $currency, ?string $stripeSessionId)
    {
        $this->user = $user;
        $this->productType = $productType;
        $this->productId = $productId;
        $this->label = mb_substr($label, 0, 255);
        $this->amountCents = $amountCents;
        $this->currency = strtolower($currency);
        $this->stripeSessionId = $stripeSessionId;
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getUser(): User { return $this->user; }
    public function getProductType(): ProductType { return $this->productType; }
    public function getProductId(): int { return $this->productId; }
    public function getLabel(): string { return $this->label; }

    public function getOption(): ?string { return $this->option; }
    public function setOption(?string $option): static { $this->option = $option; return $this; }

    public function getAmountCents(): int { return $this->amountCents; }
    public function getAmount(): float { return $this->amountCents / 100; }
    public function getCurrency(): string { return $this->currency; }
    public function getStripeSessionId(): ?string { return $this->stripeSessionId; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }

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
