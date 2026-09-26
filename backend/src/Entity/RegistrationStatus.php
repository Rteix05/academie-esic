<?php

namespace App\Entity;

/**
 * Statut d'une inscription à un événement.
 */
enum RegistrationStatus: string
{
    /** Événement gratuit : inscription confirmée immédiatement */
    case Free = 'free';
    /** Événement payant : paiement Stripe confirmé */
    case Paid = 'paid';
    /** Place réservée le temps du paiement Stripe (expire, cf. EventRegistration::PENDING_TTL) */
    case Pending = 'pending';
}
