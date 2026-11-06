<?php

namespace App\Entity;

use App\Repository\PageViewRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Page vue sur le site public (mesure d'audience interne, sans cookie).
 *
 * Aucune donnée personnelle n'est conservée : le visiteur n'est identifié que par une empreinte
 * calculée à partir de son IP et de son navigateur, salée avec un secret qui change chaque jour.
 * Elle ne permet ni de retrouver l'IP, ni de suivre un visiteur d'un jour à l'autre.
 */
#[ORM\Entity(repositoryClass: PageViewRepository::class)]
#[ORM\Index(name: 'idx_page_view_viewed_at', columns: ['viewed_at'])]
class PageView
{
    public const DEVICE_MOBILE  = 'mobile';
    public const DEVICE_TABLET  = 'tablette';
    public const DEVICE_DESKTOP = 'ordinateur';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private \DateTimeImmutable $viewedAt;

    #[ORM\Column(length: 255)]
    private string $path;

    #[ORM\Column(length: 16)]
    private string $visitorHash;

    /** Site d'où vient le visiteur (nom de domaine seul), null pour un accès direct */
    #[ORM\Column(length: 100, nullable: true)]
    private ?string $referrerHost;

    #[ORM\Column(length: 12)]
    private string $device;

    /** Première page vue en arrivant sur le site (les suivantes sont des navigations internes) */
    #[ORM\Column]
    private bool $entry;

    public function __construct(string $path, string $visitorHash, ?string $referrerHost, string $device, bool $entry = true, ?\DateTimeImmutable $viewedAt = null)
    {
        $this->entry        = $entry;
        $this->path         = $path;
        $this->visitorHash  = $visitorHash;
        $this->referrerHost = $referrerHost;
        $this->device       = $device;
        $this->viewedAt     = $viewedAt ?? new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getViewedAt(): \DateTimeImmutable
    {
        return $this->viewedAt;
    }

    public function getPath(): string
    {
        return $this->path;
    }

    public function getVisitorHash(): string
    {
        return $this->visitorHash;
    }

    public function getReferrerHost(): ?string
    {
        return $this->referrerHost;
    }

    public function getDevice(): string
    {
        return $this->device;
    }

    public function isEntry(): bool
    {
        return $this->entry;
    }
}
