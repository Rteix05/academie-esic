<?php

namespace App\Controller;

use App\Entity\Payment;
use App\Entity\User;
use App\Repository\PaymentRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class PaymentHistoryController extends AbstractController
{
    /**
     * Historique des paiements : montant réellement encaissé (figé au moment de l'achat),
     * pour les formations, masterclasses et événements.
     */
    #[Route('/api/payment-history', name: 'api_payment_history', methods: ['GET'])]
    public function index(PaymentRepository $payments): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        return $this->json(array_map(fn (Payment $p) => [
            'id'          => $p->getId(),
            'productType' => $p->getProductType()->value,
            'productId'   => $p->getProductId(),
            'label'       => $p->getLabel(),
            'option'      => $p->getOption(),
            'amount'      => $p->getAmount(),
            'currency'    => strtoupper($p->getCurrency()),
            'purchasedAt' => $p->getCreatedAt()->format(\DateTimeInterface::ATOM),
            // Référence courte affichable (fin de l'identifiant de session Stripe)
            'reference'   => $p->getStripeSessionId() ? substr($p->getStripeSessionId(), -12) : null,
        ], $payments->findForUser($user)));
    }
}
