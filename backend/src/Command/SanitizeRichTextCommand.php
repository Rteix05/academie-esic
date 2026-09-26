<?php

namespace App\Command;

use App\Entity\Event;
use App\Entity\Formation;
use App\Entity\Masterclass;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerInterface;

/**
 * Nettoyage ponctuel du HTML riche déjà en base (les nouveaux enregistrements
 * sont filtrés automatiquement par RichTextSanitizerListener).
 */
#[AsCommand(name: 'app:sanitize-rich-text', description: 'Nettoie le HTML des descriptions existantes (formations, masterclasses, événements)')]
final class SanitizeRichTextCommand extends Command
{
    private const FIELDS = [
        Formation::class   => ['description', 'objectives', 'modalities'],
        Masterclass::class => ['description'],
        Event::class       => ['description'],
    ];

    public function __construct(
        private readonly EntityManagerInterface $em,
        #[Autowire(service: 'html_sanitizer.sanitizer.app.rich_text')] private readonly HtmlSanitizerInterface $sanitizer,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('dry-run', null, InputOption::VALUE_NONE, 'Affiche les enregistrements concernés sans rien modifier');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $dryRun = (bool) $input->getOption('dry-run');
        $changed = 0;

        foreach (self::FIELDS as $class => $fields) {
            foreach ($this->em->getRepository($class)->findAll() as $entity) {
                foreach ($fields as $field) {
                    $value = $entity->{'get' . ucfirst($field)}();
                    if (!is_string($value)) {
                        continue;
                    }
                    $clean = $this->sanitizer->sanitize($value);
                    // Comparaison sur le texte normalisé : ignore les simples différences d'espaces/encodage
                    if (preg_replace('/\s+/', '', html_entity_decode($clean)) !== preg_replace('/\s+/', '', html_entity_decode($value))) {
                        $changed++;
                        $io->writeln(sprintf('%s #%d · %s', (new \ReflectionClass($class))->getShortName(), $entity->getId(), $field));
                    }
                    if (!$dryRun) {
                        // Écriture directe : le listener preUpdate ne se déclenche que sur les champs modifiés
                        $entity->{'set' . ucfirst($field)}($clean);
                    }
                }
            }
        }

        if (!$dryRun) {
            $this->em->flush();
        }

        $io->success(sprintf('%d champ(s) %s.', $changed, $dryRun ? 'à nettoyer' : 'nettoyé(s)'));

        return Command::SUCCESS;
    }
}
