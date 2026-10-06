<?php

namespace App\Controller\Admin;

use App\Entity\Masterclass;
use App\Media\ImageUploader;
use Doctrine\ORM\EntityManagerInterface;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\Field;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\NumberField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\UrlField;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class MasterclassCrudController extends AbstractCrudController
{
    public function __construct(
        private readonly ImageUploader $imageUploader,
    ) {}

    public static function getEntityFqcn(): string
    {
        return Masterclass::class;
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),

            TextField::new('title', 'Titre de la Masterclass'),
            TextField::new('speakerName', 'Expert / Formateur'),
            TextEditorField::new('description', 'Description')->hideOnIndex(),

            // Image de prévisualisation — upload depuis le PC local
            Field::new('imageUpload', 'Image de prévisualisation (upload)')
                ->setFormType(FileType::class)
                ->setFormTypeOptions(['required' => false, 'attr' => ['accept' => 'image/jpeg,image/png,image/webp,image/gif'], 'constraints' => [UploadConstraints::image()]])
                ->hideOnIndex()
                ->setHelp('Formats acceptés : JPG, PNG, WebP — recommandé : 800×450 px. Laissez vide pour conserver l\'image actuelle.'),

            // Affiche le nom du fichier image enregistré (lecture seule dans la liste)
            TextField::new('imagePreview', 'Image enregistrée')
                ->hideOnForm()
                ->setHelp('Nom du fichier image stocké sur le serveur'),

            // PDF (champ upload virtuel)
            Field::new('pdfUpload', 'Fichier PDF')
                ->setFormType(FileType::class)
                ->setFormTypeOptions(['required' => false, 'attr' => ['accept' => '.pdf'], 'constraints' => [UploadConstraints::pdf()]])
                ->hideOnIndex()
                ->setHelp('Laissez vide pour conserver le fichier actuel'),

            // Affiche le nom du PDF enregistré (lecture seule sur le formulaire)
            TextField::new('pdfFile', 'PDF enregistré')
                ->hideOnForm()
                ->setHelp('Nom du fichier PDF stocké sur le serveur'),

            // Lien vidéo externe (pCloud, Vimeo, etc.)
            UrlField::new('video', 'Lien de la vidéo (URL externe)')
                ->hideOnIndex()
                ->setRequired(false),

            // Tarification
            NumberField::new('pricePdf', 'Prix — PDF seul (€)'),
            NumberField::new('priceVideo', 'Prix — Vidéo seule (€)'),
            NumberField::new('pricePack', 'Prix — Pack complet (€)')->hideOnIndex(),

            BooleanField::new('isLive', 'En direct ?')->hideOnIndex(),
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

    private function handleUploads(Masterclass $mc): void
    {
        // Contenu payant : stocké hors de public/, servi uniquement par ContentController
        $privateDir = $this->getParameter('kernel.project_dir') . '/private/uploads/';

        $imageUpload = $mc->getImageUpload();
        if ($imageUpload instanceof UploadedFile) {
            $mc->setImagePreview($this->imageUploader->store($imageUpload, 'img_'));
        }

        $pdfUpload = $mc->getPdfUpload();
        if ($pdfUpload instanceof UploadedFile) {
            $fileName = uniqid('pdf_') . '.pdf';
            $pdfUpload->move($privateDir . 'pdfs', $fileName);
            $mc->setPdfFile($fileName);
        }
    }
}
