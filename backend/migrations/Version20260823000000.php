<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260823000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add institut, objectives, trainer, modalities fields to Formation entity';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE formation ADD institut VARCHAR(255) DEFAULT NULL, ADD objectives LONGTEXT DEFAULT NULL, ADD trainer VARCHAR(255) DEFAULT NULL, ADD modalities LONGTEXT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE formation DROP institut, DROP objectives, DROP trainer, DROP modalities');
    }
}
