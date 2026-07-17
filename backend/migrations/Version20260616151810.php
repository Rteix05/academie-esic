<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260616151810 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE masterclass_purchase (id INT AUTO_INCREMENT NOT NULL, `option` VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, masterclass_id INT NOT NULL, INDEX IDX_F71C8FCFA76ED395 (user_id), INDEX IDX_F71C8FCF426F0705 (masterclass_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE masterclass_purchase ADD CONSTRAINT FK_F71C8FCFA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE masterclass_purchase ADD CONSTRAINT FK_F71C8FCF426F0705 FOREIGN KEY (masterclass_id) REFERENCES masterclass (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE masterclass_purchase DROP FOREIGN KEY FK_F71C8FCFA76ED395');
        $this->addSql('ALTER TABLE masterclass_purchase DROP FOREIGN KEY FK_F71C8FCF426F0705');
        $this->addSql('DROP TABLE masterclass_purchase');
    }
}
