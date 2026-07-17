<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\MasterclassRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Ignore;

#[ORM\Entity(repositoryClass: MasterclassRepository::class)]
#[ApiResource]
class Masterclass
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $description = null;

    #[ORM\Column(length: 255)]
    private ?string $speakerName = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $scheduledAt = null;

    #[ORM\Column]
    private ?float $price = null;

    #[ORM\Column(length: 255)]
    private ?string $videoUrl = null;

    #[ORM\Column]
    private ?bool $isLive = null;

    /**
     * @var Collection<int, User>
     */
    #[ORM\ManyToMany(targetEntity: User::class, mappedBy: 'masterclasses')]
    #[Ignore]
    private Collection $users;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $video = null;

    #[ORM\Column(nullable: true)]
    private ?float $pricePdf = null;

    #[ORM\Column(nullable: true)]
    private ?float $priceVideo = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $pricePack = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $imagePreview = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $pdfFile = null;

    // Champs virtuels (non persistés) pour les uploads via le formulaire admin
    private mixed $pdfUpload = null;
    private mixed $imageUpload = null;

    public function __construct()
    {
        $this->users = new ArrayCollection();
        // 🟢 Génère automatiquement la date du jour à la création pour éviter les bugs
       $this->scheduledAt = new \DateTimeImmutable();
        $this->price = 0.0;
        $this->videoUrl = ''; // Assure que la colonne video_url ne soit jamais null
        $this->isLive = false; // Assure que la colonne is_live ne soit jamais null

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

    public function getSpeakerName(): ?string
    {
        return $this->speakerName;
    }

    public function setSpeakerName(string $speakerName): static
    {
        $this->speakerName = $speakerName;

        return $this;
    }

    public function getScheduledAt(): ?\DateTimeImmutable
    {
        return $this->scheduledAt;
    }

    public function setScheduledAt(\DateTimeImmutable $scheduledAt): static
    {
        $this->scheduledAt = $scheduledAt;

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

    public function getVideoUrl(): ?string
    {
        return $this->videoUrl;
    }

    public function setVideoUrl(string $videoUrl): static
    {
        $this->videoUrl = $videoUrl;

        return $this;
    }

    public function isLive(): ?bool
    {
        return $this->isLive;
    }

    public function setIsLive(bool $isLive): static
    {
        $this->isLive = $isLive;

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

    public function addUser(User $user): static
    {
        if (!$this->users->contains($user)) {
            $this->users->add($user);
            $user->addMasterclass($this);
        }

        return $this;
    }

    public function removeUser(User $user): static
    {
        if ($this->users->removeElement($user)) {
            $user->removeMasterclass($this);
        }

        return $this;
    }

    public function getVideo(): ?string
    {
        return $this->video;
    }

    public function setVideo(?string $video): static
    {
        $this->video = $video;

        return $this;
    }

    public function getPricePdf(): ?float
    {
        return $this->pricePdf;
    }

    public function setPricePdf(?float $pricePdf): static
    {
        $this->pricePdf = $pricePdf;

        return $this;
    }

    public function getPriceVideo(): ?float
    {
        return $this->priceVideo;
    }

    public function setPriceVideo(?float $priceVideo): static
    {
        $this->priceVideo = $priceVideo;

        return $this;
    }

    public function getPricePack(): ?string
    {
        return $this->pricePack;
    }

    public function setPricePack(?string $pricePack): static
    {
        $this->pricePack = $pricePack;

        return $this;
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

    public function getPdfFile(): ?string
    {
        return $this->pdfFile;
    }

    public function setPdfFile(?string $pdfFile): static
    {
        $this->pdfFile = $pdfFile;

        return $this;
    }

    public function getPdfUpload(): mixed
    {
        return $this->pdfUpload;
    }

    public function setPdfUpload(mixed $pdfUpload): static
    {
        $this->pdfUpload = $pdfUpload;

        return $this;
    }

    public function getImageUpload(): mixed
    {
        return $this->imageUpload;
    }

    public function setImageUpload(mixed $imageUpload): static
    {
        $this->imageUpload = $imageUpload;

        return $this;
    }
}