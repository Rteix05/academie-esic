<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260926000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Unicité (event, user) sur event_registration + dédoublonnage préalable';
    }

    public function up(Schema $schema): void
    {
        // Supprime les éventuels doublons (inscriptions concurrentes) en conservant, par couple
        // (event, user), l'inscription au statut le plus fort (paid > free > pending) puis la plus ancienne.
        $this->addSql(<<<'SQL'
            DELETE r1 FROM event_registration r1
            INNER JOIN event_registration r2
                ON r1.event_id = r2.event_id
               AND r1.user_id = r2.user_id
               AND r1.id <> r2.id
               AND (
                    FIELD(r1.status, 'pending', 'free', 'paid') < FIELD(r2.status, 'pending', 'free', 'paid')
                    OR (FIELD(r1.status, 'pending', 'free', 'paid') = FIELD(r2.status, 'pending', 'free', 'paid') AND r1.id > r2.id)
               )
            SQL);

        $this->addSql('CREATE UNIQUE INDEX uniq_event_registration_event_user ON event_registration (event_id, user_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX uniq_event_registration_event_user ON event_registration');
    }
}
