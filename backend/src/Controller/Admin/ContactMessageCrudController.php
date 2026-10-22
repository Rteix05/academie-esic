<?php

namespace App\Controller\Admin;

use App\Entity\ContactMessage;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\EmailField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Filter\BooleanFilter;

/**
 * Messages reçus par le formulaire de contact : consultation et suivi (« Traité »).
 * Ils ne se créent ni ne se modifient ici, seul l'état « Traité » change.
 */
class ContactMessageCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return ContactMessage::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Message')
            ->setEntityLabelInPlural('Messages de contact')
            ->setDefaultSort(['isHandled' => 'ASC', 'createdAt' => 'DESC'])
            ->setSearchFields(['name', 'email', 'message'])
            ->setHelp(Crud::PAGE_INDEX, 'Répondez par email à l\'adresse de l\'expéditeur, puis cochez « Traité ». Les messages non traités apparaissent en premier.');
    }

    public function configureActions(Actions $actions): Actions
    {
        return $actions
            ->disable(Action::NEW, Action::BATCH_DELETE)
            ->add(Crud::PAGE_INDEX, Action::DETAIL);
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters->add(BooleanFilter::new('isHandled', 'Traité'));
    }

    public function configureFields(string $pageName): iterable
    {
        yield DateTimeField::new('createdAt', 'Reçu le')->setFormat('dd/MM/yyyy HH:mm')->hideOnForm();
        yield TextField::new('name', 'Nom')->setDisabled();
        yield EmailField::new('email', 'Email')->setDisabled();
        yield TextField::new('subjectLabel', 'Sujet')->hideOnForm();
        yield TextareaField::new('message', 'Message')
            ->setDisabled()
            ->setMaxLength($pageName === Crud::PAGE_INDEX ? 80 : 5000)
            ->renderAsHtml(false);
        yield BooleanField::new('isHandled', 'Traité');
    }
}
