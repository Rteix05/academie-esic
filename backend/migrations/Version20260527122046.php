<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260527122046 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE user_formation (user_id INT NOT NULL, formation_id INT NOT NULL, INDEX IDX_40A0AC5BA76ED395 (user_id), INDEX IDX_40A0AC5B5200282E (formation_id), PRIMARY KEY (user_id, formation_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE user_masterclass (user_id INT NOT NULL, masterclass_id INT NOT NULL, INDEX IDX_32C08D78A76ED395 (user_id), INDEX IDX_32C08D78426F0705 (masterclass_id), PRIMARY KEY (user_id, masterclass_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE user_formation ADD CONSTRAINT FK_40A0AC5BA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_formation ADD CONSTRAINT FK_40A0AC5B5200282E FOREIGN KEY (formation_id) REFERENCES formation (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_masterclass ADD CONSTRAINT FK_32C08D78A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_masterclass ADD CONSTRAINT FK_32C08D78426F0705 FOREIGN KEY (masterclass_id) REFERENCES masterclass (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_formation DROP FOREIGN KEY FK_40A0AC5BA76ED395');
        $this->addSql('ALTER TABLE user_formation DROP FOREIGN KEY FK_40A0AC5B5200282E');
        $this->addSql('ALTER TABLE user_masterclass DROP FOREIGN KEY FK_32C08D78A76ED395');
        $this->addSql('ALTER TABLE user_masterclass DROP FOREIGN KEY FK_32C08D78426F0705');
        $this->addSql('DROP TABLE user_formation');
        $this->addSql('DROP TABLE user_masterclass');
    }
}
