<?php

namespace App\Controller;

use App\Entity\News;
use App\Repository\NewsRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Actualités publiques (accueil : ?limit=2, page /actualites : toutes).
 */
class NewsController extends AbstractController
{
    private const MAX_LIMIT = 50;

    #[Route('/api/actualites', name: 'api_actualites', methods: ['GET'])]
    public function index(Request $request, NewsRepository $news): JsonResponse
    {
        $limit = $request->query->getInt('limit', self::MAX_LIMIT);
        $limit = max(1, min($limit, self::MAX_LIMIT));

        return $this->json(array_map(fn (News $n) => [
            'id'          => $n->getId(),
            'title'       => $n->getTitle(),
            'summary'     => $n->getSummary(),
            'publishedAt' => $n->getPublishedAt()?->format(\DateTimeInterface::ATOM),
        ], $news->findVisible($limit)));
    }
}
