<?php

namespace App\Entity;

/**
 * Type de produit vendu via Stripe.
 */
enum ProductType: string
{
    case Formation = 'formation';
    case Masterclass = 'masterclass';
    case Event = 'event';
    case Subscription = 'subscription';
}
