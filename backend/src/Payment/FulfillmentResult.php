<?php

namespace App\Payment;

use App\Entity\ProductType;

/**
 * Résultat de l'attribution d'un achat, traduit en réponse HTTP par les contrôleurs.
 */
final class FulfillmentResult
{
    public const GRANTED   = 'granted';   // achat attribué à l'instant
    public const ALREADY   = 'already';   // déjà attribué (webhook et confirmation se croisent)
    public const NOT_PAID  = 'not_paid';  // paiement pas (encore) encaissé
    public const INVALID   = 'invalid';   // métadonnées inexploitables ou produit introuvable

    private function __construct(
        public readonly string $status,
        public readonly ?ProductType $productType = null,
        public readonly ?int $productId = null,
        public readonly ?string $reason = null,
    ) {}

    public static function granted(ProductType $type, int $id): self { return new self(self::GRANTED, $type, $id); }
    public static function already(ProductType $type, int $id): self { return new self(self::ALREADY, $type, $id); }
    public static function notPaid(): self { return new self(self::NOT_PAID, reason: 'Paiement non confirmé.'); }
    public static function invalid(string $reason, ?ProductType $type = null): self { return new self(self::INVALID, $type, reason: $reason); }

    public function isSuccessful(): bool
    {
        return $this->status === self::GRANTED || $this->status === self::ALREADY;
    }
}
