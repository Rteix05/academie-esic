<?php

namespace App\Controller\Admin;

use App\Entity\Event;
use App\Media\ImageUploader;
use Doctrine\ORM\EntityManagerInterface;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\Field;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\NumberField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\UrlField;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class EventCrudController extends AbstractCrudController
{
    public function __construct(
        private readonly ImageUploader $imageUploader,
    ) {}

    public static function getEntityFqcn(): string
    {
        return Event::class;
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),
            TextField::new('title', 'Titre de l\'événement'),
            TextEditorField::new('description', 'Description')->hideOnIndex(),
            TextField::new('location', 'Lieu (ou "En ligne")'),
            DateTimeField::new('startDate', 'Date de début'),
            DateTimeField::new('endDate', 'Date de fin'),
            NumberField::new('price', 'Prix (€) — 0 si gratuit'),
            IntegerField::new('capacity', 'Capacité max (optionnel)')->hideOnIndex(),

            // Upload image depuis le PC local
            Field::new('imageUpload', 'Image (upload depuis PC)')
                ->setFormType(FileType::class)
                ->setFormTypeOptions(['required' => false, 'attr' => ['accept' => 'image/jpeg,image/png,image/webp,image/gif'], 'constraints' => [UploadConstraints::image()]])
                ->hideOnIndex()
                ->setHelp('Laissez vide pour conserver l\'image actuelle. Prioritaire sur l\'URL ci-dessous.'),

            // Nom du fichier uploadé (lecture seule dans la liste)
            TextField::new('imageFile', 'Image uploadée')
                ->hideOnForm()
                ->setHelp('Nom du fichier image stocké sur le serveur'),

            // URL externe (fallback / option alternative)
            UrlField::new('imageUrl', 'Image URL externe (optionnel)')
                ->hideOnIndex()
                ->setRequired(false)
                ->setHelp('Optionnel — ignoré si une image est uploadée ci-dessus'),

            BooleanField::new('isPublished', 'Publié'),
        ];
    }

    public function persistEntity(EntityManagerInterface $em, $entityInstance): void
    {
        $this->handleUploads($entityInstance);
        parent::persistEntity($em, $entityInstance);
    }

    public function updateEntity(EntityManagerInterface $em, $entityInstance): void
    {
        $this->handleUploads($entityInstance);
        parent::updateEntity($em, $entityInstance);
    }

    private function handleUploads(Event $event): void
    {
        $imageUpload = $event->getImageUpload();
        if ($imageUpload instanceof UploadedFile) {
            $event->setImageFile($this->imageUploader->store($imageUpload, 'evt_'));
        }
    }
}
