<?php

namespace App\Entity;

use App\Mailer\AppMailer;
use App\Repository\ContactMessageRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/**
 * Message du formulaire de contact, conservé en base : il reste consultable dans l'admin
 * même si l'email de notification n'a pas pu partir.
 */
#[ORM\Entity(repositoryClass: ContactMessageRepository::class)]
#[ORM\Index(name: 'idx_contact_message_handled', columns: ['is_handled', 'created_at'])]
class ContactMessage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private string $name;

    #[ORM\Column(length: 180)]
    private string $email;

    /** Clé de AppMailer::CONTACT_SUBJECTS */
    #[ORM\Column(length: 20)]
    private string $subject;

    #[ORM\Column(type: Types::TEXT)]
    private string $message;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    /** Coché dans l'admin une fois la réponse apportée */
    #[ORM\Column]
    private bool $isHandled = false;

    public function __construct(string $name, string $email, string $subject, string $message)
    {
        $this->name = $name;
        $this->email = $email;
        $this->subject = $subject;
        $this->message = $message;
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getName(): string { return $this->name; }
    public function getEmail(): string { return $this->email; }
    public function getSubject(): string { return $this->subject; }
    public function getSubjectLabel(): string { return AppMailer::CONTACT_SUBJECTS[$this->subject] ?? $this->subject; }
    public function getMessage(): string { return $this->message; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }

    public function isHandled(): bool { return $this->isHandled; }
    public function setIsHandled(bool $isHandled): static { $this->isHandled = $isHandled; return $this; }

    public function __toString(): string
    {
        return sprintf('%s — %s', $this->name, $this->getSubjectLabel());
    }
}
