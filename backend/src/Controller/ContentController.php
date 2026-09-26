<?php

namespace App\Controller;

use App\Entity\Formation;
use App\Entity\Masterclass;
use App\Entity\MasterclassPurchase;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\String\Slugger\AsciiSlugger;

/**
 * Téléchargement des supports PDF payants, stockés hors de public/.
 * Requiert JWT + droit d'accès au contenu.
 */
class ContentController extends AbstractController
{
    public function __construct(
        private readonly string $projectDir,
    ) {}

    #[Route('/api/content/masterclass/{id}/pdf', name: 'api_content_masterclass_pdf', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function masterclassPdf(Masterclass $masterclass, EntityManagerInterface $em): Response
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        $purchase = $em->getRepository(MasterclassPurchase::class)->findOneBy([
            'user'        => $user,
            'masterclass' => $masterclass,
            'option'      => ['pdf', 'pack'],
        ]);

        if (!$purchase) {
            return $this->json(['message' => 'Accès non autorisé — option PDF requise.'], 403);
        }

        return $this->servePdf($masterclass->getPdfFile(), $masterclass->getTitle());
    }

    #[Route('/api/content/formation/{id}/pdf', name: 'api_content_formation_pdf', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function formationPdf(Formation $formation): Response
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        if (!$user->getFormations()->contains($formation)) {
            return $this->json(['message' => 'Accès non autorisé — formation non acquise.'], 403);
        }

        return $this->servePdf($formation->getPdfFile(), $formation->getTitle());
    }

    private function servePdf(?string $fileName, ?string $title): Response
    {
        if (!$fileName) {
            return $this->json(['message' => 'Aucun PDF disponible.'], 404);
        }

        $filePath = $this->projectDir . '/private/uploads/pdfs/' . basename($fileName);
        if (!is_file($filePath)) {
            return $this->json(['message' => 'Fichier PDF introuvable sur le serveur.'], 404);
        }

        $downloadName = (new AsciiSlugger())->slug($title ?: 'support')->lower() . '.pdf';

        $response = new BinaryFileResponse($filePath);
        $response->headers->set('Content-Type', 'application/pdf');
        $response->headers->set('Cache-Control', 'private, no-store');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, $downloadName);

        return $response;
    }
}
