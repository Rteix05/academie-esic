<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261006220841 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Actualités de l\'Académie (accueil et page Actualités)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE news (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(150) NOT NULL, summary LONGTEXT NOT NULL, published_at DATETIME NOT NULL, is_published TINYINT NOT NULL, INDEX idx_news_published (is_published, published_at), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE news');
    }
}
