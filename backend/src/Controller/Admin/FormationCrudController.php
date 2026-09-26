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

            // — Classement —
            ChoiceField::new('institut', 'Institut / Bloc')->setChoices([
                'Institut Biblique Théologique'           => 'Institut Biblique Théologique',
                'École du Ministère et du Leadership'     => 'École du Ministère et du Leadership',
            ])->setRequired(false),

            ChoiceField::new('category', 'Sous-catégorie')->setChoices([
                // IBT
                'Formation biblique'         => 'Formation biblique',
                'Discipulat'                 => 'Discipulat',
                'Développement personnel'    => 'Développement personnel',
                'Famille et vie chrétienne'  => 'Famille et vie chrétienne',
                'Autres programmes'          => 'Autres programmes',
                // École du Ministère
                'Leadership chrétien'        => 'Leadership chrétien',
                'Formation poussée'          => 'Formation poussée',
                'Ministère'                  => 'Ministère',
            ])->setRequired(false),

            TextField::new('title', 'Titre de la formation'),
            TextEditorField::new('description', 'Contenu de la formation')->hideOnIndex(),

            // — Détails pédagogiques —
            TextEditorField::new('objectives', 'Objectifs de la formation')->hideOnIndex()->setRequired(false),
            TextField::new('trainer', 'Formateur')->setRequired(false),
            TextEditorField::new('modalities', 'Modalités')->hideOnIndex()->setRequired(false)
                ->setHelp('Modalités d\'accès, de suivi, d\'évaluation…'),

            NumberField::new('price', 'Frais (€)'),
            TextField::new('duration', 'Durée (ex : 8 heures)'),
            ChoiceField::new('level', 'Niveau')->setChoices([
                'Débutant'      => 'Débutant',
                'Intermédiaire' => 'Intermédiaire',
                'Avancé'        => 'Avancé',
            ]),

            // — Médias —
            Field::new('imageUpload', 'Image de prévisualisation (upload)')
                ->setFormType(FileType::class)
                ->setFormTypeOptions(['required' => false, 'attr' => ['accept' => 'image/jpeg,image/png,image/webp,image/gif'], 'constraints' => [UploadConstraints::image()]])
                ->hideOnIndex()
                ->setHelp('Formats acceptés : JPG, PNG, WebP — recommandé : 800×450 px. Laissez vide pour conserver l\'image actuelle.'),

            TextField::new('imagePreview', 'Image enregistrée')
                ->hideOnForm()
                ->setHelp('Nom du fichier image stocké sur le serveur'),

            Field::new('pdfUpload', 'Support de cours (PDF)')
                ->setFormType(FileType::class)
                ->setFormTypeOptions(['required' => false, 'attr' => ['accept' => '.pdf'], 'constraints' => [UploadConstraints::pdf()]])
                ->hideOnIndex()
                ->setHelp('Laissez vide pour conserver le fichier actuel'),

            TextField::new('pdfFile', 'PDF enregistré')
                ->hideOnForm()
                ->setHelp('Nom du fichier PDF stocké sur le serveur'),

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
        // Contenu payant : stocké hors de public/, servi uniquement par ContentController
        $privateDir = $this->getParameter('kernel.project_dir') . '/private/uploads/';

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
            $pdfUpload->move($privateDir . 'pdfs', $fileName);
            $f->setPdfFile($fileName);
        }
    }
}
