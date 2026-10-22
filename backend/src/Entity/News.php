<?php

namespace App\Entity;

use App\Repository\NewsRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Actualité de l'Académie (accueil et page /actualites), saisie depuis l'admin.
 */
#[ORM\Entity(repositoryClass: NewsRepository::class)]
#[ORM\Index(name: 'idx_news_published', columns: ['is_published', 'published_at'])]
class News
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 150)]
    private ?string $title = null;

    /** Texte court affiché tel quel (pas de HTML) */
    #[ORM\Column(type: Types::TEXT)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 600)]
    private ?string $summary = null;

    /** Date affichée et ordre de tri ; une date future programme la parution */
    #[ORM\Column]
    #[Assert\NotNull]
    private ?\DateTimeImmutable $publishedAt = null;

    #[ORM\Column]
    private bool $isPublished = true;

    public function __construct()
    {
        $this->publishedAt = new \DateTimeImmutable('today');
    }

    public function getId(): ?int { return $this->id; }

    public function getTitle(): ?string { return $this->title; }
    public function setTitle(?string $title): static { $this->title = $title; return $this; }

    public function getSummary(): ?string { return $this->summary; }
    public function setSummary(?string $summary): static { $this->summary = $summary; return $this; }

    public function getPublishedAt(): ?\DateTimeImmutable { return $this->publishedAt; }
    public function setPublishedAt(?\DateTimeImmutable $publishedAt): static { $this->publishedAt = $publishedAt; return $this; }

    public function isPublished(): bool { return $this->isPublished; }
    public function setIsPublished(bool $isPublished): static { $this->isPublished = $isPublished; return $this; }

    public function __toString(): string
    {
        return (string) $this->title;
    }
}
