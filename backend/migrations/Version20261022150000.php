<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261022150000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Messages du formulaire de contact conservés en base';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE contact_message (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(100) NOT NULL, email VARCHAR(180) NOT NULL, subject VARCHAR(20) NOT NULL, message LONGTEXT NOT NULL, created_at DATETIME NOT NULL, is_handled TINYINT NOT NULL, INDEX idx_contact_message_handled (is_handled, created_at), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE contact_message');
    }
}
