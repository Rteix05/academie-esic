<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Attribute\Ignore;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    private ?string $email = null;

    #[ORM\Column]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    // Champ transitoire (non persisté) : saisie d'un nouveau mot de passe depuis l'admin, haché avant enregistrement
    private ?string $plainPassword = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $firstName = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $lastName = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $resetToken = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $resetTokenExpiresAt = null;

    #[ORM\ManyToMany(targetEntity: Masterclass::class, inversedBy: 'users')]
    private Collection $masterclasses;

    #[ORM\ManyToMany(targetEntity: Formation::class, inversedBy: 'users')]
    private Collection $formations;

    public function __construct()
    {
        $this->masterclasses = new ArrayCollection();
        $this->formations    = new ArrayCollection();
        if (empty($this->roles)) {
            $this->roles = ['ROLE_USER'];
        }
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    #[Ignore]
    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        // 🟢 Hachage automatique si le mot de passe reçu est en texte clair
        if (!str_starts_with($password, '$2y$') && !str_starts_with($password, '$argon2id$')) {
            $this->password = password_hash($password, PASSWORD_BCRYPT);
        } else {
            $this->password = $password;
        }

        return $this;
    }

    /**
     * @see UserInterface
     */
    // Méthode dépréciée depuis Symfony 7.3 (supprimée en 8.0) : conservée vide pour l'interface.
    // Le mot de passe en clair ($plainPassword) est effacé explicitement après hachage.
    #[\Deprecated]
    public function eraseCredentials(): void
    {
    }

    #[Ignore]
    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(?string $plainPassword): static
    {
        $this->plainPassword = $plainPassword;

        return $this;
    }

    /**
     * @return Collection<int, Masterclass>
     */
    public function getMasterclasses(): Collection
    {
        return $this->masterclasses;
    }

    public function addMasterclass(Masterclass $masterclass): static
    {
        if (!$this->masterclasses->contains($masterclass)) {
            $this->masterclasses->add($masterclass);
        }

        return $this;
    }

    public function removeMasterclass(Masterclass $masterclass): static
    {
        $this->masterclasses->removeElement($masterclass);
        return $this;
    }

    public function getFormations(): Collection
    {
        return $this->formations;
    }

    public function addFormation(Formation $formation): static
    {
        if (!$this->formations->contains($formation)) {
            $this->formations->add($formation);
        }
        return $this;
    }

    public function removeFormation(Formation $formation): static
    {
        $this->formations->removeElement($formation);
        return $this;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(?string $firstName): static
    {
        $this->firstName = $firstName;
        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(?string $lastName): static
    {
        $this->lastName = $lastName;
        return $this;
    }

    #[Ignore]
    public function getResetToken(): ?string
    {
        return $this->resetToken;
    }

    public function setResetToken(?string $resetToken): static
    {
        $this->resetToken = $resetToken;
        return $this;
    }

    #[Ignore]
    public function getResetTokenExpiresAt(): ?\DateTimeImmutable
    {
        return $this->resetTokenExpiresAt;
    }

    public function setResetTokenExpiresAt(?\DateTimeImmutable $resetTokenExpiresAt): static
    {
        $this->resetTokenExpiresAt = $resetTokenExpiresAt;
        return $this;
    }
}