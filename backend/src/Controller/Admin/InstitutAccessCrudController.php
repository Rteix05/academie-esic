<?php

namespace App\Controller\Admin;

use App\Entity\InstitutAccess;
use App\Institut\InstitutPack;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

/**
 * Accès complets aux instituts, créés au paiement (webhook / confirmation Stripe).
 * Pas de création ni de modification manuelle ; la suppression retire l'accès (après un remboursement).
 */
class InstitutAccessCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return InstitutAccess::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Accès institut')
            ->setEntityLabelInPlural('Accès instituts')
            ->setDefaultSort(['createdAt' => 'DESC'])
            ->setHelp(Crud::PAGE_INDEX, 'Remboursement depuis le Dashboard Stripe, puis suppression de l\'accès ici. Le paiement reste dans l\'historique.');
    }

    public function configureActions(Actions $actions): Actions
    {
        return $actions
            ->disable(Action::NEW, Action::EDIT, Action::BATCH_DELETE)
            ->add(Crud::PAGE_INDEX, Action::DETAIL);
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id'),
            AssociationField::new('user', 'Élève'),
            ChoiceField::new('pack', 'Institut')->setChoices(array_combine(
                array_map(fn (InstitutPack $p) => $p->institut(), InstitutPack::cases()),
                InstitutPack::cases(),
            )),
            DateTimeField::new('createdAt', 'Acheté le'),
            TextField::new('stripeSessionId', 'Session Stripe')->hideOnIndex(),
        ];
    }
}
