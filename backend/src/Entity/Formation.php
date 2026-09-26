<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\Repository\FormationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Ignore;

#[ORM\Entity(repositoryClass: FormationRepository::class)]
// Lecture seule : l'écriture passe exclusivement par l'admin EasyAdmin
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
    ]
)]
class Formation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $description = null;

    #[ORM\Column]
    private ?float $price = null;

    #[ORM\Column(length: 255)]
    private ?string $duration = null;

    #[ORM\Column(length: 255)]
    private ?string $level = null;

    #[ORM\Column(length: 255)]
    private ?string $category = null;

    #[ORM\Column]
    private ?bool $isPublished = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $imagePreview = null;

    // Contenu payant : jamais exposé par l'API publique
    #[ORM\Column(length: 255, nullable: true)]
    #[Ignore]
    private ?string $pdfFile = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Ignore]
    private ?string $videoUrl = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $institut = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $objectives = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $trainer = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $modalities = null;

    // Champs virtuels (non persistés) pour les uploads via le formulaire admin
    private mixed $pdfUpload = null;
    private mixed $imageUpload = null;

    /**
     * @var Collection<int, User>
     */
    #[ORM\ManyToMany(targetEntity: User::class, mappedBy: 'formations')]
    #[Ignore]
    private Collection $users;

    public function __construct()
    {
        $this->users = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(float $price): static
    {
        $this->price = $price;

        return $this;
    }

    public function getDuration(): ?string
    {
        return $this->duration;
    }

    public function setDuration(string $duration): static
    {
        $this->duration = $duration;

        return $this;
    }

    public function getLevel(): ?string
    {
        return $this->level;
    }

    public function setLevel(string $level): static
    {
        $this->level = $level;

        return $this;
    }

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(string $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function isPublished(): ?bool
    {
        return $this->isPublished;
    }

    public function setIsPublished(bool $isPublished): static
    {
        $this->isPublished = $isPublished;

        return $this;
    }

    /**
     * @return Collection<int, User>
     */
    #[Ignore]
    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function getImagePreview(): ?string
    {
        return $this->imagePreview;
    }

    public function setImagePreview(?string $imagePreview): static
    {
        $this->imagePreview = $imagePreview;

        return $this;
    }

    #[Ignore]
    public function getPdfFile(): ?string
    {
        return $this->pdfFile;
    }

    public function setPdfFile(?string $pdfFile): static
    {
        $this->pdfFile = $pdfFile;

        return $this;
    }

    #[Ignore]
    public function getVideoUrl(): ?string
    {
        return $this->videoUrl;
    }

    public function setVideoUrl(?string $videoUrl): static
    {
        $this->videoUrl = $videoUrl;

        return $this;
    }

    public function getInstitut(): ?string
    {
        return $this->institut;
    }

    public function setInstitut(?string $institut): static
    {
        $this->institut = $institut;

        return $this;
    }

    public function getObjectives(): ?string
    {
        return $this->objectives;
    }

    public function setObjectives(?string $objectives): static
    {
        $this->objectives = $objectives;

        return $this;
    }

    public function getTrainer(): ?string
    {
        return $this->trainer;
    }

    public function setTrainer(?string $trainer): static
    {
        $this->trainer = $trainer;

        return $this;
    }

    public function getModalities(): ?string
    {
        return $this->modalities;
    }

    public function setModalities(?string $modalities): static
    {
        $this->modalities = $modalities;

        return $this;
    }

    public function isPdfAvailable(): bool
    {
        return (bool) $this->pdfFile;
    }

    #[Ignore]
    public function getImageUpload(): mixed
    {
        return $this->imageUpload;
    }

    public function setImageUpload(mixed $imageUpload): static
    {
        $this->imageUpload = $imageUpload;

        return $this;
    }

    #[Ignore]
    public function getPdfUpload(): mixed
    {
        return $this->pdfUpload;
    }

    public function setPdfUpload(mixed $pdfUpload): static
    {
        $this->pdfUpload = $pdfUpload;

        return $this;
    }

    public function addUser(User $user): static
    {
        if (!$this->users->contains($user)) {
            $this->users->add($user);
            $user->addFormation($this);
        }

        return $this;
    }

    public function removeUser(User $user): static
    {
        if ($this->users->removeElement($user)) {
            $user->removeFormation($this);
        }

        return $this;
    }
}