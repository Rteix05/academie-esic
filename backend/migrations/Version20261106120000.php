<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261106120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Mesure d\'audience interne (pages vues) et date d\'inscription des comptes';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE page_view (id INT AUTO_INCREMENT NOT NULL, viewed_at DATETIME NOT NULL, path VARCHAR(255) NOT NULL, visitor_hash VARCHAR(16) NOT NULL, referrer_host VARCHAR(100) DEFAULT NULL, device VARCHAR(12) NOT NULL, entry TINYINT NOT NULL, INDEX idx_page_view_viewed_at (viewed_at), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE `user` ADD created_at DATETIME DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE page_view');
        $this->addSql('ALTER TABLE `user` DROP created_at');
    }
}
