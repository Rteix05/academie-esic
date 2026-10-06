<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261006120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Accès complets aux instituts (achat unique, accès à vie)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE institut_access (id INT AUTO_INCREMENT NOT NULL, pack VARCHAR(30) NOT NULL, stripe_session_id VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, INDEX IDX_A088A605A76ED395 (user_id), UNIQUE INDEX uniq_institut_access_user_pack (user_id, pack), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE institut_access ADD CONSTRAINT FK_A088A605A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE institut_access DROP FOREIGN KEY FK_A088A605A76ED395');
        $this->addSql('DROP TABLE institut_access');
    }
}
