<?php

namespace App\EventListener;

use App\Entity\Event;
use App\Entity\Formation;
use App\Entity\Masterclass;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsDoctrineListener;
use Doctrine\ORM\Event\PrePersistEventArgs;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Doctrine\ORM\Events;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerInterface;

/**
 * Nettoie le HTML riche avant enregistrement (scripts, attributs on*, javascript:…).
 * Le frontend l'injecte via dangerouslySetInnerHTML : sans ce filtre, un compte
 * admin compromis permettrait une XSS stockée visible par tous les visiteurs.
 */
#[AsDoctrineListener(event: Events::prePersist)]
#[AsDoctrineListener(event: Events::preUpdate)]
final class RichTextSanitizerListener
{
    /** Champs HTML par entité */
    private const FIELDS = [
        Formation::class   => ['description', 'objectives', 'modalities'],
        Masterclass::class => ['description'],
        Event::class       => ['description'],
    ];

    public function __construct(
        #[Autowire(service: 'html_sanitizer.sanitizer.app.rich_text')] private readonly HtmlSanitizerInterface $sanitizer,
    ) {}

    public function prePersist(PrePersistEventArgs $args): void
    {
        $entity = $args->getObject();
        foreach ($this->fieldsFor($entity) as $field) {
            $getter = 'get' . ucfirst($field);
            $setter = 'set' . ucfirst($field);
            $value = $entity->$getter();
            if (is_string($value)) {
                $entity->$setter($this->sanitizer->sanitize($value));
            }
        }
    }

    public function preUpdate(PreUpdateEventArgs $args): void
    {
        foreach ($this->fieldsFor($args->getObject()) as $field) {
            if ($args->hasChangedField($field) && is_string($args->getNewValue($field))) {
                $args->setNewValue($field, $this->sanitizer->sanitize($args->getNewValue($field)));
            }
        }
    }

    /** @return string[] */
    private function fieldsFor(object $entity): array
    {
        foreach (self::FIELDS as $class => $fields) {
            if ($entity instanceof $class) {
                return $fields;
            }
        }

        return [];
    }
}
