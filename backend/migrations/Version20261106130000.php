<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261106130000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Parcours guidé après l\'inscription : centres d\'intérêt, niveau et objectif de l\'élève';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE `user` ADD interests JSON DEFAULT NULL, ADD learning_level VARCHAR(20) DEFAULT NULL, ADD learning_goal VARCHAR(60) DEFAULT NULL, ADD onboarded_at DATETIME DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE `user` DROP interests, DROP learning_level, DROP learning_goal, DROP onboarded_at');
    }
}
