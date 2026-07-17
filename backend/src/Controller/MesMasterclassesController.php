<?php

namespace App\Controller;

use App\Entity\MasterclassPurchase;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class MesMasterclassesController extends AbstractController
{
    #[Route('/api/mes-masterclasses', name: 'api_mes_masterclasses', methods: ['GET'])]
    public function index(UserRepository $userRepository, EntityManagerInterface $em): JsonResponse
    {
        $securityUser = $this->getUser();

        if (!$securityUser) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        $realUser = $userRepository->findOneBy(['email' => $securityUser->getUserIdentifier()]);

        if (!$realUser) {
            return $this->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        $purchases = $em->getRepository(MasterclassPurchase::class)->findBy(['user' => $realUser]);

        $data = [];
        foreach ($purchases as $purchase) {
            $mc = $purchase->getMasterclass();
            $id = $mc->getId();

            if (!isset($data[$id])) {
                $data[$id] = [
                    'id'      => $id,
                    'title'   => $mc->getTitle(),
                    'video'   => $mc->getVideo(),
                    'options' => [],
                ];
            }
            $data[$id]['options'][] = $purchase->getOption();
        }

        return $this->json(array_values($data));
    }
}

