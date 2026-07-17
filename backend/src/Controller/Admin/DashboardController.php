<?php

namespace App\Controller\Admin;

use App\Controller\Admin\EventCrudController;
use App\Controller\Admin\EventRegistrationCrudController;
use App\Controller\Admin\FormationCrudController;
use App\Controller\Admin\MasterclassCrudController;
use App\Controller\Admin\UserCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Attribute\AdminDashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\Assets;
use EasyCorp\Bundle\EasyAdminBundle\Config\Dashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\MenuItem;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractDashboardController;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use Symfony\Component\HttpFoundation\Response;

#[AdminDashboard(routePath: '/admin', routeName: 'admin')]
class DashboardController extends AbstractDashboardController
{
    public function index(): Response
    {
        $adminUrlGenerator = $this->container->get(AdminUrlGenerator::class);
        return $this->redirect($adminUrlGenerator->setController(FormationCrudController::class)->generateUrl());
    }

    public function configureDashboard(): Dashboard
    {
        return Dashboard::new()
            ->setTitle('Académie E.S.I.C.');
    }

    public function configureAssets(): Assets
    {
        return Assets::new()
            ->addCssFile('/admin-theme.css')
            ->addHtmlContentToHead('<script>document.documentElement.setAttribute("data-bs-theme","dark");</script>');
    }

    public function configureMenuItems(): iterable
    {
        yield MenuItem::linkToDashboard('Tableau de bord', 'fa fa-home');

        yield MenuItem::section('Catalogue');
        yield MenuItem::linkTo(FormationCrudController::class, 'Formations', 'fas fa-graduation-cap');
        yield MenuItem::linkTo(MasterclassCrudController::class, 'Masterclasses', 'fas fa-video');
        yield MenuItem::linkTo(EventCrudController::class, 'Événements', 'fas fa-calendar-alt');
        yield MenuItem::linkTo(EventRegistrationCrudController::class, 'Inscriptions', 'fas fa-ticket-alt');

        yield MenuItem::section('Membres');
        yield MenuItem::linkTo(UserCrudController::class, 'Utilisateurs', 'fas fa-users');

        yield MenuItem::section('');
        yield MenuItem::linkToUrl('← Retour au site', 'fas fa-arrow-left', $_ENV['FRONTEND_URL'] ?? '');
    }
}