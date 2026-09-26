<?php

namespace App\Controller;

use App\Entity\Event;
use App\Entity\User;
use App\Repository\EventRegistrationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class EventStatusController extends AbstractController
{
    #[Route('/api/events/{id}/status', name: 'api_event_status', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function status(Event $event, EventRegistrationRepository $repo): JsonResponse
    {
        // Places occupées : inscriptions confirmées + réservations en attente de paiement non expirées
        $totalRegistered = $repo->countOccupiedSeats($event);
        $capacity = $event->getCapacity();

        // Route publique : l'utilisateur est connu seulement si un cookie de session valide est présent
        $user = $this->getUser();
        $registration = $user instanceof User ? $repo->findOneBy(['event' => $event, 'user' => $user]) : null;
        $isRegistered = $registration !== null && $registration->isConfirmed();

        return $this->json([
            'totalRegistered'    => $totalRegistered,
            'spotsLeft'          => $capacity !== null ? max(0, $capacity - $totalRegistered) : null,
            'isFull'             => $capacity !== null && $totalRegistered >= $capacity,
            'capacity'           => $capacity,
            'isRegistered'       => $isRegistered,
            'registrationStatus' => $isRegistered ? $registration->getStatus()->value : null,
        ]);
    }
}
