<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\EventRegistrationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class MesEvenementsController extends AbstractController
{
    #[Route('/api/mes-evenements', name: 'api_mes_evenements', methods: ['GET'])]
    public function index(EventRegistrationRepository $repo): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        $result = [];
        foreach ($repo->findBy(['user' => $user]) as $reg) {
            $event = $reg->getEvent();
            // Une réservation en attente dont le délai de paiement est dépassé n'a plus de valeur
            if (!$event || $reg->isExpiredPending()) {
                continue;
            }
            $result[] = [
                'id'           => $event->getId(),
                'title'        => $event->getTitle(),
                'location'     => $event->getLocation(),
                'startDate'    => $event->getStartDate()?->format(\DateTimeInterface::ATOM),
                'endDate'      => $event->getEndDate()?->format(\DateTimeInterface::ATOM),
                'price'        => $event->getPrice(),
                'status'       => $reg->getStatus()->value,
                'registeredAt' => $reg->getRegisteredAt()->format(\DateTimeInterface::ATOM),
            ];
        }

        return $this->json($result);
    }
}
