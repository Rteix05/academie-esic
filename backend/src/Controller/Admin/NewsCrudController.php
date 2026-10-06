<?php

namespace App\Controller\Admin;

use App\Entity\News;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class NewsCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return News::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Actualité')
            ->setEntityLabelInPlural('Actualités')
            ->setDefaultSort(['publishedAt' => 'DESC'])
            ->setHelp(Crud::PAGE_INDEX, 'Les deux plus récentes apparaissent sur la page d\'accueil, toutes sur la page Actualités.');
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),
            TextField::new('title', 'Titre')->setMaxLength(150),
            TextareaField::new('summary', 'Résumé')
                ->hideOnIndex()
                ->setHelp('600 caractères maximum, texte simple.'),
            DateField::new('publishedAt', 'Date de parution')
                ->setHelp('Affichée sur le site. Une date future programme la parution.'),
            BooleanField::new('isPublished', 'Publiée'),
        ];
    }
}
