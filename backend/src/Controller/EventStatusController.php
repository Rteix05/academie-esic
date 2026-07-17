<?php

namespace App\Controller;

use App\Entity\Event;
use App\Repository\EventRegistrationRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class EventStatusController extends AbstractController
{
    #[Route('/api/events/{id}/status', name: 'api_event_status', methods: ['GET'])]
    public function status(
        Event $event,
        EventRegistrationRepository $repo,
        UserRepository $userRepository
    ): JsonResponse {
        $totalRegistered = $repo->count(['event' => $event]);
        $spotsLeft = $event->getCapacity() !== null
            ? max(0, $event->getCapacity() - $totalRegistered)
            : null;
        $isFull = $event->getCapacity() !== null && $totalRegistered >= $event->getCapacity();

        $isRegistered = false;
        $registrationStatus = null;

        $securityUser = $this->getUser();
        if ($securityUser) {
            $user = $userRepository->findOneBy(['email' => $securityUser->getUserIdentifier()]);
            if ($user) {
                $reg = $repo->findOneBy(['event' => $event, 'user' => $user]);
                if ($reg && $reg->getStatus() !== 'pending') {
                    $isRegistered = true;
                    $registrationStatus = $reg->getStatus();
                }
            }
        }

        return $this->json([
            'totalRegistered'    => $totalRegistered,
            'spotsLeft'          => $spotsLeft,
            'isFull'             => $isFull,
            'capacity'           => $event->getCapacity(),
            'isRegistered'       => $isRegistered,
            'registrationStatus' => $registrationStatus,
        ]);
    }
}
