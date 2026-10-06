<?php

namespace App\Controller;

use App\Entity\Formation;
use App\Entity\Masterclass;
use App\Entity\MasterclassPurchase;
use App\Entity\User;
use App\Institut\FormationAccess;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\String\Slugger\AsciiSlugger;

/**
 * Contenus payants : supports PDF (stockés hors de public/) et contenu de la salle de cours.
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

    /**
     * Contenu de la salle de cours : lien vidéo (jamais exposé par l'API publique)
     * et présence d'un support PDF, pour un élève ayant accès à la formation.
     */
    #[Route('/api/content/formation/{id}', name: 'api_content_formation', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function formationContent(Formation $formation, FormationAccess $access): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        if (!$access->canAccess($user, $formation)) {
            return $this->json(['message' => 'Accès non autorisé — formation non acquise.'], 403);
        }

        $pdf = $formation->getPdfFile();

        return $this->json([
            'video'        => $formation->getVideoUrl() ?: null,
            'pdfAvailable' => $pdf !== null && $pdf !== '' && is_file($this->pdfPath($pdf)),
        ]);
    }

    #[Route('/api/content/formation/{id}/pdf', name: 'api_content_formation_pdf', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function formationPdf(Formation $formation, FormationAccess $access): Response
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        // Formation acquise ou incluse dans un accès complet à son institut
        if (!$access->canAccess($user, $formation)) {
            return $this->json(['message' => 'Accès non autorisé — formation non acquise.'], 403);
        }

        return $this->servePdf($formation->getPdfFile(), $formation->getTitle());
    }

    private function servePdf(?string $fileName, ?string $title): Response
    {
        if (!$fileName) {
            return $this->json(['message' => 'Aucun PDF disponible.'], 404);
        }

        $filePath = $this->pdfPath($fileName);
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

    private function pdfPath(string $fileName): string
    {
        return $this->projectDir . '/private/uploads/pdfs/' . basename($fileName);
    }
}
