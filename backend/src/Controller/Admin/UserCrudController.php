<?php

namespace App\Controller\Admin;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\EmailField;
use EasyCorp\Bundle\EasyAdminBundle\Field\Field;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Gestion des utilisateurs.
 *
 * Champs explicites : sans cette configuration, EasyAdmin exposait tous les
 * champs de l'entité (hash du mot de passe, token de réinitialisation) et
 * enregistrait un mot de passe saisi tel quel, sans hachage.
 */
class UserCrudController extends AbstractCrudController
{
    private const ROLES = [
        'Élève'          => 'ROLE_USER',
        'Administrateur' => 'ROLE_ADMIN',
    ];

    public function __construct(
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {}

    public static function getEntityFqcn(): string
    {
        return User::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Utilisateur')
            ->setEntityLabelInPlural('Utilisateurs')
            ->setSearchFields(['email', 'firstName', 'lastName'])
            ->setDefaultSort(['id' => 'DESC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield EmailField::new('email', 'Email');
        yield TextField::new('firstName', 'Prénom')->setRequired(false);
        yield TextField::new('lastName', 'Nom')->setRequired(false);

        yield ChoiceField::new('roles', 'Rôles')
            ->setChoices(self::ROLES)
            ->allowMultipleChoices()
            ->renderExpanded()
            ->renderAsBadges(['ROLE_ADMIN' => 'danger', 'ROLE_USER' => 'success']);

        // Mot de passe : saisi en double, obligatoire à la création, facultatif ensuite
        yield Field::new('plainPassword', $pageName === Crud::PAGE_NEW ? 'Mot de passe' : 'Nouveau mot de passe')
            ->onlyOnForms()
            ->setFormType(RepeatedType::class)
            ->setFormTypeOptions([
                'type'            => PasswordType::class,
                'first_options'   => ['label' => $pageName === Crud::PAGE_NEW ? 'Mot de passe' : 'Nouveau mot de passe', 'attr' => ['autocomplete' => 'new-password']],
                'second_options'  => ['label' => 'Confirmation', 'attr' => ['autocomplete' => 'new-password']],
                'invalid_message' => 'Les deux mots de passe ne correspondent pas.',
                'required'        => $pageName === Crud::PAGE_NEW,
                'constraints'     => array_filter([
                    $pageName === Crud::PAGE_NEW ? new Assert\NotBlank(message: 'Le mot de passe est obligatoire.') : null,
                    new Assert\Length(min: 8, max: 4096, minMessage: 'Au moins {{ limit }} caractères.'),
                    new Assert\Regex(pattern: '/^(?=.*[A-Za-z])(?=.*\d).+$/', message: 'Au moins une lettre et un chiffre.'),
                ]),
            ])
            ->setHelp($pageName === Crud::PAGE_NEW ? '' : 'Laissez vide pour conserver le mot de passe actuel.');
    }

    public function persistEntity(EntityManagerInterface $em, $entityInstance): void
    {
        $this->hashPlainPassword($entityInstance);
        parent::persistEntity($em, $entityInstance);
    }

    public function updateEntity(EntityManagerInterface $em, $entityInstance): void
    {
        $this->hashPlainPassword($entityInstance);
        parent::updateEntity($em, $entityInstance);
    }

    private function hashPlainPassword(User $user): void
    {
        $plain = $user->getPlainPassword();
        if ($plain !== null && $plain !== '') {
            $user->setPassword($this->passwordHasher->hashPassword($user, $plain));
            // Un changement de mot de passe invalide aussi une éventuelle demande de réinitialisation en cours
            $user->setResetToken(null);
            $user->setResetTokenExpiresAt(null);
        }
        $user->setPlainPassword(null);
    }
}
