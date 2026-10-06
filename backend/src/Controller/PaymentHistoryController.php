<?php

namespace App\Controller;

use App\Entity\Payment;
use App\Entity\User;
use App\Repository\PaymentRepository;
use App\Stripe\StripeGateway;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class PaymentHistoryController extends AbstractController
{
    /**
     * Historique des paiements : montant réellement encaissé (figé au moment de l'achat),
     * pour les formations, masterclasses, événements et accès aux instituts.
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
            'hasInvoice'  => $this->hasCheckoutSession($p),
        ], $payments->findForUser($user)));
    }

    /**
     * Facture Stripe d'un paiement de l'élève connecté : lien vers le PDF généré par Stripe.
     */
    #[Route('/api/payment-history/{id}/invoice', name: 'api_payment_invoice', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function invoice(int $id, PaymentRepository $payments, StripeGateway $stripe, LoggerInterface $logger): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        // Paiement d'un autre élève : même réponse qu'un paiement inexistant
        $payment = $payments->find($id);
        if (!$payment || $payment->getUser()->getId() !== $user->getId()) {
            return $this->json(['message' => 'Paiement introuvable.'], 404);
        }

        if (!$this->hasCheckoutSession($payment)) {
            return $this->json(['message' => 'Aucune facture n\'est disponible pour ce paiement.'], 404);
        }

        if (!$stripe->isConfigured()) {
            return $this->json(['message' => 'Les factures sont momentanément indisponibles.'], 503);
        }

        try {
            $url = $stripe->retrieveInvoiceUrl((string) $payment->getStripeSessionId());
        } catch (\Throwable $e) {
            $logger->error('Stripe : facture illisible', ['payment' => $id, 'error' => $e->getMessage()]);

            return $this->json(['message' => 'Impossible de récupérer la facture. Réessayez dans quelques instants.'], 502);
        }

        if (!$url) {
            return $this->json(['message' => 'Aucune facture n\'est disponible pour ce paiement.'], 404);
        }

        return $this->json(['url' => $url]);
    }

    /** Paiement passé par Stripe Checkout : seul cas où Stripe a pu générer une facture */
    private function hasCheckoutSession(Payment $payment): bool
    {
        return str_starts_with((string) $payment->getStripeSessionId(), 'cs_');
    }
}
