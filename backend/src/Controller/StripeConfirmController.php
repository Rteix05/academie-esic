<?php

namespace App\Controller;

use App\Entity\MasterclassPurchase;
use App\Repository\MasterclassRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class StripeConfirmController extends AbstractController
{
    #[Route('/api/stripe/confirm', name: 'api_stripe_confirm', methods: ['POST'])]
    public function confirm(
        Request $request,
        UserRepository $userRepository,
        MasterclassRepository $masterclassRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        try {
            $body      = json_decode($request->getContent(), true);
            $sessionId = $body['session_id'] ?? null;

            if (!$sessionId) {
                return $this->json(['error' => 'session_id manquant.'], 400);
            }

            Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);

            $session = Session::retrieve($sessionId);

            if ($session->payment_status !== 'paid') {
                return $this->json(['error' => 'Paiement non complété.', 'status' => $session->payment_status], 402);
            }

            $metadata      = $session->metadata->toArray();
            $userEmail     = $metadata['user_email']     ?? null;
            $masterclassId = $metadata['masterclass_id'] ?? null;
            $option        = $metadata['option']         ?? null;

            if (!$userEmail || !$masterclassId || !$option) {
                return $this->json(['error' => 'Métadonnées manquantes.', 'meta' => $metadata], 400);
            }

            $user        = $userRepository->findOneBy(['email' => $userEmail]);
            $masterclass = $masterclassRepository->find($masterclassId);

            if (!$user || !$masterclass) {
                return $this->json(['error' => 'Utilisateur ou masterclass introuvable.'], 404);
            }

            $existing = $em->getRepository(MasterclassPurchase::class)->findOneBy([
                'user'        => $user,
                'masterclass' => $masterclass,
                'option'      => $option,
            ]);

            if (!$existing) {
                $purchase = new MasterclassPurchase();
                $purchase->setUser($user);
                $purchase->setMasterclass($masterclass);
                $purchase->setOption($option);
                $purchase->setCreatedAt(new \DateTimeImmutable());
                $em->persist($purchase);

                if (!$user->getMasterclasses()->contains($masterclass)) {
                    $user->addMasterclass($masterclass);
                }

                $em->flush();
            }

            return $this->json([
                'success'       => true,
                'masterclassId' => $masterclass->getId(),
                'option'        => $option,
            ]);

        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage(), 'class' => get_class($e)], 500);
        }
    }
}
