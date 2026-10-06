<?php

namespace App\Institut;

use App\Stripe\StripeGateway;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

/**
 * Prix Stripe des accès complets aux instituts.
 *
 * Les identifiants de prix (price_…) sont fournis par variables d'environnement : ils diffèrent
 * entre le mode test et la production. Le montant affiché est lu dans Stripe (mis en cache)
 * pour rester identique au montant réellement payé.
 */
class InstitutCatalog
{
    private const CACHE_TTL = 3600;

    /** @var array<string, string|null> */
    private readonly array $priceIds;

    public function __construct(
        private readonly StripeGateway $stripe,
        private readonly CacheInterface $cache,
        private readonly LoggerInterface $logger,
        #[Autowire('%env(default::STRIPE_PRICE_INSTITUT_BIBLIQUE)%')] ?string $institutBibliquePriceId,
        #[Autowire('%env(default::STRIPE_PRICE_ECOLE_MINISTERE)%')] ?string $ecoleMinisterePriceId,
    ) {
        $this->priceIds = [
            InstitutPack::InstitutBiblique->value => $institutBibliquePriceId ?: null,
            InstitutPack::EcoleMinistere->value   => $ecoleMinisterePriceId ?: null,
        ];
    }

    public function priceId(InstitutPack $pack): ?string
    {
        return $this->priceIds[$pack->value];
    }

    /**
     * Offre affichée sur le site. Null si l'accès n'est pas configuré ou si son prix
     * Stripe est introuvable, inactif ou récurrent (l'achat est alors indisponible).
     *
     * @return array{pack: string, institut: string, label: string, amount: float, currency: string}|null
     */
    public function offer(InstitutPack $pack): ?array
    {
        $priceId = $this->priceId($pack);
        if (!$priceId || !$this->stripe->isConfigured()) {
            return null;
        }

        $price = $this->cache->get('institut_price_' . md5($priceId), function (ItemInterface $item) use ($priceId) {
            $item->expiresAfter(self::CACHE_TTL);
            try {
                $price = $this->stripe->retrievePrice($priceId);
            } catch (\Throwable $e) {
                $this->logger->error('Stripe : prix d\'accès institut introuvable', ['price' => $priceId, 'error' => $e->getMessage()]);
                $item->expiresAfter(60); // nouvel essai rapide

                return null;
            }

            return [
                'active'   => (bool) $price->active,
                'type'     => (string) $price->type,
                'amount'   => (int) $price->unit_amount,
                'currency' => (string) $price->currency,
            ];
        });

        if (!$price || !$price['active'] || $price['type'] !== 'one_time' || $price['amount'] <= 0) {
            return null;
        }

        return [
            'pack'     => $pack->value,
            'institut' => $pack->institut(),
            'label'    => $pack->label(),
            'amount'   => $price['amount'] / 100,
            'currency' => strtoupper($price['currency']),
        ];
    }
}
