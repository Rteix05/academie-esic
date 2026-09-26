<?php

namespace App\Controller;

use App\Repository\EventRegistrationRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class MesEvenementsController extends AbstractController
{
    #[Route('/api/mes-evenements', name: 'api_mes_evenements', methods: ['GET'])]
    public function index(
        EventRegistrationRepository $repo,
        UserRepository $userRepository
    ): JsonResponse {
        $securityUser = $this->getUser();
        if (!$securityUser) {
            return $this->json([], 401);
        }

        $user = $userRepository->findOneBy(['email' => $securityUser->getUserIdentifier()]);
        if (!$user) {
            return $this->json([], 404);
        }

        $registrations = $repo->findBy(['user' => $user]);

        $result = [];
        foreach ($registrations as $reg) {
            $event = $reg->getEvent();
            // Une réservation en attente dont le délai de paiement est dépassé n'a plus de valeur
            if (!$event || $reg->isExpiredPending()) continue;
            $result[] = [
                'id'             => $event->getId(),
                'title'          => $event->getTitle(),
                'location'       => $event->getLocation(),
                'startDate'      => $event->getStartDate()?->format(\DateTimeInterface::ATOM),
                'endDate'        => $event->getEndDate()?->format(\DateTimeInterface::ATOM),
                'price'          => $event->getPrice(),
                'status'         => $reg->getStatus(),
                'registeredAt'   => $reg->getRegisteredAt()->format(\DateTimeInterface::ATOM),
            ];
        }

        return $this->json($result);
    }
}
