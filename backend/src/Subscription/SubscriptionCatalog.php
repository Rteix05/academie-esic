<?php

namespace App\Subscription;

use App\Stripe\StripeGateway;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

/**
 * Prix Stripe des formules d'abonnement.
 *
 * Les identifiants de prix (price_…) sont fournis par variables d'environnement : ils diffèrent
 * entre le mode test et la production. Le montant affiché est lu dans Stripe (mis en cache)
 * pour rester identique au montant réellement prélevé.
 */
class SubscriptionCatalog
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
            SubscriptionPlan::InstitutBiblique->value => $institutBibliquePriceId ?: null,
            SubscriptionPlan::EcoleMinistere->value   => $ecoleMinisterePriceId ?: null,
        ];
    }

    public function priceId(SubscriptionPlan $plan): ?string
    {
        return $this->priceIds[$plan->value];
    }

    /**
     * Offre affichée sur le site. Null si la formule n'est pas configurée ou si son prix
     * Stripe est introuvable, inactif ou non mensuel (la souscription est alors indisponible).
     *
     * @return array{plan: string, institut: string, label: string, amount: float, currency: string, interval: string}|null
     */
    public function offer(SubscriptionPlan $plan): ?array
    {
        $priceId = $this->priceId($plan);
        if (!$priceId || !$this->stripe->isConfigured()) {
            return null;
        }

        $price = $this->cache->get('subscription_price_' . md5($priceId), function (ItemInterface $item) use ($priceId) {
            $item->expiresAfter(self::CACHE_TTL);
            try {
                $price = $this->stripe->retrievePrice($priceId);
            } catch (\Throwable $e) {
                $this->logger->error('Stripe : prix d\'abonnement introuvable', ['price' => $priceId, 'error' => $e->getMessage()]);
                $item->expiresAfter(60); // nouvel essai rapide

                return null;
            }

            return [
                'active'   => (bool) $price->active,
                'amount'   => (int) $price->unit_amount,
                'currency' => (string) $price->currency,
                'interval' => (string) ($price->recurring?->interval ?? ''),
            ];
        });

        if (!$price || !$price['active'] || $price['interval'] !== 'month' || $price['amount'] <= 0) {
            return null;
        }

        return [
            'plan'     => $plan->value,
            'institut' => $plan->institut(),
            'label'    => $plan->label(),
            'amount'   => $price['amount'] / 100,
            'currency' => strtoupper($price['currency']),
            'interval' => $price['interval'],
        ];
    }
}
