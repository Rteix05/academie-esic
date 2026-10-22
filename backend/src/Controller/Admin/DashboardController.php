<?php

namespace App\Controller\Admin;

use App\Controller\Admin\EventCrudController;
use App\Controller\Admin\EventRegistrationCrudController;
use App\Controller\Admin\FormationCrudController;
use App\Controller\Admin\MasterclassCrudController;
use App\Controller\Admin\UserCrudController;
use App\Repository\ContactMessageRepository;
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
    public function __construct(private readonly ContactMessageRepository $contactMessages)
    {
    }

    public function index(): Response
    {
        $adminUrlGenerator = $this->container->get(AdminUrlGenerator::class);
        return $this->redirect($adminUrlGenerator->setController(FormationCrudController::class)->generateUrl());
    }

    public function configureDashboard(): Dashboard
    {
        return Dashboard::new()
            ->setTitle('Académie E.S.I.C.')
            // Thème clair unique, aux couleurs du site (admin-theme.css)
            ->disableDarkMode();
    }

    public function configureAssets(): Assets
    {
        return Assets::new()
            // Polices du site public : Poppins (titres) et DM Sans (texte)
            ->addHtmlContentToHead('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap">')
            ->addCssFile('/admin-theme.css');
    }

    public function configureMenuItems(): iterable
    {
        yield MenuItem::linkToDashboard('Tableau de bord', 'fa fa-home');

        yield MenuItem::section('Catalogue');
        yield MenuItem::linkTo(FormationCrudController::class, 'Formations', 'fas fa-graduation-cap');
        yield MenuItem::linkTo(MasterclassCrudController::class, 'Masterclasses', 'fas fa-video');
        yield MenuItem::linkTo(EventCrudController::class, 'Événements', 'fas fa-calendar-alt');
        yield MenuItem::linkTo(EventRegistrationCrudController::class, 'Inscriptions', 'fas fa-ticket-alt');

        yield MenuItem::section('Contenus');
        yield MenuItem::linkTo(NewsCrudController::class, 'Actualités', 'fas fa-newspaper');
        $unhandled = $this->contactMessages->countUnhandled();
        yield MenuItem::linkTo(ContactMessageCrudController::class, 'Messages', 'fas fa-envelope')
            ->setBadge($unhandled ?: false, 'danger');

        yield MenuItem::section('Membres');
        yield MenuItem::linkTo(UserCrudController::class, 'Utilisateurs', 'fas fa-users');
        yield MenuItem::linkTo(InstitutAccessCrudController::class, 'Accès instituts', 'fas fa-university');

        yield MenuItem::section('');
        yield MenuItem::linkToUrl('← Retour au site', 'fas fa-arrow-left', $_ENV['FRONTEND_URL'] ?? '');
    }
}