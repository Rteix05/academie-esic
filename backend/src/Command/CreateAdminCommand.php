<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Création du premier administrateur en production (SSH), sans passer par l'inscription publique.
 * Le mot de passe est saisi de façon masquée : il n'apparaît ni à l'écran ni dans l'historique du shell.
 * Si le compte existe déjà, il reçoit le rôle administrateur et le nouveau mot de passe.
 */
#[AsCommand(name: 'app:create-admin', description: 'Crée un compte administrateur (ou promeut un compte existant)')]
final class CreateAdminCommand extends Command
{
    public const MIN_PASSWORD_LENGTH = 12;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ValidatorInterface $validator,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addArgument('email', InputArgument::REQUIRED, 'Adresse email du compte administrateur');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $email = mb_strtolower(trim((string) $input->getArgument('email')));

        $emailErrors = $this->validator->validate($email, [
            new Assert\NotBlank(),
            new Assert\Email(mode: Assert\Email::VALIDATION_MODE_HTML5),
            new Assert\Length(max: 180),
        ]);
        if (count($emailErrors) > 0) {
            $io->error('Adresse email invalide.');

            return Command::FAILURE;
        }

        $password = (string) $io->askHidden(sprintf('Mot de passe (%d caractères minimum, dont une lettre et un chiffre)', self::MIN_PASSWORD_LENGTH));
        $passwordErrors = $this->validator->validate($password, [
            new Assert\Length(min: self::MIN_PASSWORD_LENGTH, max: 4096),
            new Assert\Regex(pattern: '/^(?=.*[A-Za-z])(?=.*\d).+$/'),
        ]);
        if (count($passwordErrors) > 0) {
            $io->error(sprintf('Le mot de passe doit contenir au moins %d caractères, dont une lettre et un chiffre.', self::MIN_PASSWORD_LENGTH));

            return Command::FAILURE;
        }

        if ($password !== (string) $io->askHidden('Confirmation du mot de passe')) {
            $io->error('Les deux mots de passe ne correspondent pas.');

            return Command::FAILURE;
        }

        $user = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
        $created = $user === null;
        $user ??= (new User())->setEmail($email);

        // setPassword hache le mot de passe en clair
        $user->setPassword($password);
        // getRoles() ajoute toujours ROLE_USER : seuls les rôles attribués sont stockés
        $roles = array_diff($user->getRoles(), ['ROLE_USER']);
        $user->setRoles(array_values(array_unique([...$roles, 'ROLE_ADMIN'])));

        $this->em->persist($user);
        $this->em->flush();

        $io->success(sprintf($created ? 'Administrateur %s créé.' : 'Le compte %s est désormais administrateur.', $email));

        return Command::SUCCESS;
    }
}
