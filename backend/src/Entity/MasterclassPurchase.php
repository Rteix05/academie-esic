<?php

namespace App\Entity;

use App\Repository\MasterclassPurchaseRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MasterclassPurchaseRepository::class)]
class MasterclassPurchase
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Masterclass $masterclass = null;

    // 'pdf', 'video' ou 'pack'
    #[ORM\Column(name: 'purchase_option', length: 20)]
    private ?string $option = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function getId(): ?int { return $this->id; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }

    public function getMasterclass(): ?Masterclass { return $this->masterclass; }
    public function setMasterclass(?Masterclass $masterclass): static { $this->masterclass = $masterclass; return $this; }

    public function getOption(): ?string { return $this->option; }
    public function setOption(string $option): static { $this->option = $option; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $createdAt): static { $this->createdAt = $createdAt; return $this; }
}
