<?php

namespace App\Command;

use App\Entity\Event;
use App\Entity\Formation;
use App\Entity\Payment;
use App\Entity\ProductType;
use App\Entity\User;
use App\Legal\SalesTerms;
use App\Mailer\AppMailer;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Envoie un exemplaire de chaque email transactionnel à une adresse de test, avec des données
 * fictives (rien n'est enregistré en base). Sert à vérifier le rendu dans une vraie boîte mail
 * ou dans MailHog en local (http://localhost:8025).
 *
 *   php bin/console app:email:preview destinataire@exemple.fr
 */
#[AsCommand(name: 'app:email:preview', description: 'Envoie un exemplaire de chaque email transactionnel à une adresse de test')]
class EmailPreviewCommand extends Command
{
    public function __construct(private readonly AppMailer $mailer)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addArgument('to', InputArgument::REQUIRED, 'Adresse qui reçoit les exemplaires');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $to = (string) $input->getArgument('to');
        if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
            $io->error('Adresse email invalide.');

            return Command::INVALID;
        }

        $user = (new User())->setEmail($to)->setFirstName('Marie')->setLastName('Exemple');
        $formation = (new Formation())->setTitle('Introduction à la théologie biblique')->setLevel('Débutant')->setDuration('12 heures')->setPrice(0);
        $event = (new Event())->setTitle('Séminaire de leadership chrétien')->setLocation('Paris')
            ->setStartDate(new \DateTimeImmutable('+14 days 10:00'))->setEndDate(new \DateTimeImmutable('+14 days 17:00'))->setPrice(0);

        $payment = (new Payment($user, ProductType::Masterclass, 1, 'La prière qui transforme — Pack Complet (Vidéo + PDF)', 4900, 'eur', 'cs_test_apercu' . strtoupper(bin2hex(random_bytes(4)))))
            ->setOption('pack');
        $now = new \DateTimeImmutable();
        $payment->recordConsents(SalesTerms::CGV_VERSION, $now, $now);

        $emails = [
            'Bienvenue (inscription)'           => fn () => $this->mailer->sendWelcome($user),
            'Inscription à une formation'       => fn () => $this->mailer->sendEnrollmentConfirmation($user, $formation),
            'Confirmation de commande'          => fn () => $this->mailer->sendPurchaseConfirmation($payment),
            'Réinitialisation du mot de passe'  => fn () => $this->mailer->sendPasswordReset($to, 'jeton-exemple-non-valide'),
            'Événement'                         => fn () => $this->mailer->sendEventConfirmation($user, $event, false),
        ];
        foreach ($emails as $label => $send) {
            $send();
            $io->writeln(' ✓ ' . $label);
        }

        // Contact : accusé de réception et notification interne, tous deux vers l'adresse de test
        // (jamais vers la vraie boîte de l'Académie)
        $this->mailer->sendContactMessage('Marie Exemple', $to, 'formation', "Bonjour,\nje souhaiterais connaître les dates de la prochaine session.\nMerci !", notificationTo: $to);
        $io->writeln(' ✓ Contact : accusé de réception et notification interne');

        $io->success('Emails envoyés. En local, consultez-les sur http://localhost:8025 (MailHog).');

        return Command::SUCCESS;
    }
}
