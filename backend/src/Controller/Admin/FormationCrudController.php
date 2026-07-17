<?php

namespace App\Controller\Admin;

use App\Entity\Formation;
use Doctrine\ORM\EntityManagerInterface;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\Field;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\NumberField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\UrlField;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class FormationCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Formation::class;
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),

            TextField::new('title', 'Titre de la formation'),
            TextEditorField::new('description', 'Description')->hideOnIndex(),

            NumberField::new('price', 'Prix (€)'),
            TextField::new('duration', 'Durée (ex : 8 heures)'),
            ChoiceField::new('level', 'Niveau')->setChoices([
                'Débutant'      => 'Débutant',
                'Intermédiaire' => 'Intermédiaire',
                'Avancé'        => 'Avancé',
            ]),
            TextField::new('category', 'Catégorie'),

            // Image de prévisualisation — upload depuis le PC local
            Field::new('imageUpload', 'Image de prévisualisation (upload)')
                ->setFormType(FileType::class)
                ->setFormTypeOptions(['required' => false, 'attr' => ['accept' => 'image/jpeg,image/png,image/webp,image/gif']])
                ->hideOnIndex()
                ->setHelp('Formats acceptés : JPG, PNG, WebP — recommandé : 800×450 px. Laissez vide pour conserver l\'image actuelle.'),

            // Affiche le nom du fichier image enregistré (lecture seule dans la liste)
            TextField::new('imagePreview', 'Image enregistrée')
                ->hideOnForm()
                ->setHelp('Nom du fichier image stocké sur le serveur'),

            // PDF support de cours (upload virtuel)
            Field::new('pdfUpload', 'Support de cours (PDF)')
                ->setFormType(FileType::class)
                ->setFormTypeOptions(['required' => false, 'attr' => ['accept' => '.pdf']])
                ->hideOnIndex()
                ->setHelp('Laissez vide pour conserver le fichier actuel'),

            // Affiche le PDF enregistré (lecture seule dans la liste)
            TextField::new('pdfFile', 'PDF enregistré')
                ->hideOnForm()
                ->setHelp('Nom du fichier PDF stocké sur le serveur'),

            // Lien vidéo externe
            UrlField::new('videoUrl', 'Lien vidéo (URL externe)')
                ->hideOnIndex()
                ->setRequired(false)
                ->setHelp('Ex : Vimeo, YouTube, pCloud...'),

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

    private function handleUploads(Formation $f): void
    {
        $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/';

        $imageUpload = $f->getImageUpload();
        if ($imageUpload instanceof UploadedFile) {
            $ext = $imageUpload->guessExtension() ?? 'jpg';
            $fileName = uniqid('img_') . '.' . $ext;
            $imageUpload->move($uploadDir . 'images', $fileName);
            $f->setImagePreview($fileName);
        }

        $pdfUpload = $f->getPdfUpload();
        if ($pdfUpload instanceof UploadedFile) {
            $fileName = uniqid('pdf_') . '.pdf';
            $pdfUpload->move($uploadDir . 'pdfs', $fileName);
            $f->setPdfFile($fileName);
        }
    }
}
