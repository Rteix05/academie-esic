<?php

namespace App\Controller;

use App\Entity\MasterclassPurchase;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class MesMasterclassesController extends AbstractController
{
    #[Route('/api/mes-masterclasses', name: 'api_mes_masterclasses', methods: ['GET'])]
    public function index(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        $data = [];
        foreach ($em->getRepository(MasterclassPurchase::class)->findBy(['user' => $user]) as $purchase) {
            $mc = $purchase->getMasterclass();
            $id = $mc->getId();

            $data[$id] ??= [
                'id'           => $id,
                'title'        => $mc->getTitle(),
                'video'        => null,
                'pdfAvailable' => false,
                'options'      => [],
            ];

            $option = $purchase->getOption();
            $data[$id]['options'][] = $option;

            // Le lien vidéo n'est livré qu'aux acheteurs de l'option vidéo ou pack
            if (in_array($option, ['video', 'pack'], true)) {
                $data[$id]['video'] = $mc->getVideo();
            }
            if (in_array($option, ['pdf', 'pack'], true)) {
                $data[$id]['pdfAvailable'] = $mc->isPdfAvailable();
            }
        }

        return $this->json(array_values($data));
    }
}
