<?php

namespace App\Controller\Admin;

use App\Entity\Subscription;
use App\Subscription\SubscriptionPlan;
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
 * Abonnements en lecture seule : ils sont créés, modifiés et résiliés dans Stripe
 * (site, portail client ou Dashboard Stripe), puis recopiés ici par les webhooks.
 */
class SubscriptionCrudController extends AbstractCrudController
{
    /** Libellés des statuts Stripe */
    private const STATUSES = [
        'Actif'                  => 'active',
        'Essai'                  => 'trialing',
        'Paiement en retard'     => 'past_due',
        'Impayé'                 => 'unpaid',
        'Résilié'                => 'canceled',
        'En pause'               => 'paused',
        'Paiement initial requis' => 'incomplete',
        'Expiré avant paiement'  => 'incomplete_expired',
    ];

    public static function getEntityFqcn(): string
    {
        return Subscription::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Abonnement')
            ->setEntityLabelInPlural('Abonnements')
            ->setDefaultSort(['createdAt' => 'DESC'])
            ->setHelp(Crud::PAGE_INDEX, 'Gestion (remboursement, résiliation, changement de carte) depuis le Dashboard Stripe.');
    }

    public function configureActions(Actions $actions): Actions
    {
        return $actions
            ->disable(Action::NEW, Action::EDIT, Action::DELETE, Action::BATCH_DELETE)
            ->add(Crud::PAGE_INDEX, Action::DETAIL);
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id'),
            AssociationField::new('user', 'Élève'),
            ChoiceField::new('plan', 'Formule')->setChoices(array_combine(
                array_map(fn (SubscriptionPlan $p) => $p->institut(), SubscriptionPlan::cases()),
                SubscriptionPlan::cases(),
            )),
            ChoiceField::new('status', 'Statut')->setChoices(self::STATUSES)->renderAsBadges([
                'active'   => 'success',
                'trialing' => 'success',
                'past_due' => 'warning',
                'unpaid'   => 'danger',
                'canceled' => 'secondary',
            ]),
            DateTimeField::new('currentPeriodEnd', 'Prochaine échéance'),
            DateTimeField::new('cancelAt', 'Fin programmée'),
            DateTimeField::new('createdAt', 'Souscrit le'),
            DateTimeField::new('endedAt', 'Terminé le')->hideOnIndex(),
            TextField::new('stripeSubscriptionId', 'Abonnement Stripe')->hideOnIndex(),
            TextField::new('stripeCustomerId', 'Client Stripe')->hideOnIndex(),
            TextField::new('cgvVersion', 'Version des CGV acceptée')->hideOnIndex(),
            DateTimeField::new('cgvAcceptedAt', 'CGV acceptées le')->hideOnIndex(),
            DateTimeField::new('immediateAccessConsentAt', 'Accès immédiat demandé le')->hideOnIndex(),
        ];
    }
}
