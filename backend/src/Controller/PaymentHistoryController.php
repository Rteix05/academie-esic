<?php

namespace App\Controller;

use App\Entity\MasterclassPurchase;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class PaymentHistoryController extends AbstractController
{
    #[Route('/api/payment-history', name: 'api_payment_history', methods: ['GET'])]
    public function index(UserRepository $userRepository, EntityManagerInterface $em): JsonResponse
    {
        $securityUser = $this->getUser();
        if (!$securityUser) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        $user = $userRepository->findOneBy(['email' => $securityUser->getUserIdentifier()]);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        $purchases = $em->getRepository(MasterclassPurchase::class)->findBy(
            ['user' => $user],
            ['createdAt' => 'DESC']
        );

        $data = array_map(function (MasterclassPurchase $purchase) {
            $mc     = $purchase->getMasterclass();
            $option = $purchase->getOption();

            $price = match ($option) {
                'pdf'   => $mc->getPricePdf() ?? 0.0,
                'video' => $mc->getPriceVideo() ?? 0.0,
                'pack'  => (float) ($mc->getPricePack() ?? 0),
                default => 0.0,
            };

            return [
                'id'               => $purchase->getId(),
                'masterclassTitle' => $mc->getTitle(),
                'masterclassId'    => $mc->getId(),
                'option'           => $option,
                'amount'           => $price,
                'purchasedAt'      => $purchase->getCreatedAt()?->format('d/m/Y à H:i'),
            ];
        }, $purchases);

        return $this->json($data);
    }
}
