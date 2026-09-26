<?php

namespace App\Controller\Admin;

use App\Entity\EventRegistration;
use App\Entity\RegistrationStatus;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;

class EventRegistrationCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return EventRegistration::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Inscription')
            ->setEntityLabelInPlural('Inscriptions aux événements')
            ->setDefaultSort(['registeredAt' => 'DESC']);
    }

    public function configureActions(Actions $actions): Actions
    {
        return $actions
            ->disable(Action::NEW)  // Les inscriptions se créent via le site
            ->add(Crud::PAGE_INDEX, Action::DETAIL);
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),
            AssociationField::new('event', 'Événement'),
            AssociationField::new('user', 'Utilisateur'),
            ChoiceField::new('status', 'Statut')->setChoices([
                'Gratuit'    => RegistrationStatus::Free,
                'Payant'     => RegistrationStatus::Paid,
                'En attente' => RegistrationStatus::Pending,
            ])->renderAsBadges([
                RegistrationStatus::Free->value    => 'success',
                RegistrationStatus::Paid->value    => 'warning',
                RegistrationStatus::Pending->value => 'secondary',
            ]),
            DateTimeField::new('registeredAt', 'Date d\'inscription')->hideOnForm(),
            TextField::new('stripeSessionId', 'Session Stripe')->hideOnIndex()->hideOnForm(),
        ];
    }
}
