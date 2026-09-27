<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration de référence : crée le schéma complet sur une base vide.
 *
 * Elle remplace l'historique précédent (qui ne permettait pas de recréer la base de zéro :
 * les tables event et event_registration n'y étaient jamais créées).
 * Collation utf8mb4_unicode_ci : compatible MySQL 8 et MariaDB.
 *
 * Base existante déjà à jour : php bin/console doctrine:migrations:rollup
 * (enregistre cette migration comme exécutée sans rien modifier).
 */
final class Version20260927000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Schéma complet de référence (base vierge)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE event (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, location VARCHAR(255) NOT NULL, start_date DATETIME NOT NULL, end_date DATETIME NOT NULL, price DOUBLE PRECISION DEFAULT 0 NOT NULL, capacity INT DEFAULT NULL, is_published TINYINT DEFAULT 0 NOT NULL, image_url VARCHAR(255) DEFAULT NULL, image_file VARCHAR(255) DEFAULT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE event_registration (id INT AUTO_INCREMENT NOT NULL, registered_at DATETIME NOT NULL, status VARCHAR(50) DEFAULT \'free\' NOT NULL, stripe_session_id VARCHAR(255) DEFAULT NULL, event_id INT NOT NULL, user_id INT NOT NULL, UNIQUE INDEX uniq_event_registration_event_user (event_id, user_id), INDEX IDX_8FBBAD5471F7E88B (event_id), INDEX IDX_8FBBAD54A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE formation (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, price DOUBLE PRECISION NOT NULL, duration VARCHAR(255) NOT NULL, level VARCHAR(255) NOT NULL, category VARCHAR(255) NOT NULL, is_published TINYINT NOT NULL, image_preview VARCHAR(255) DEFAULT NULL, pdf_file VARCHAR(255) DEFAULT NULL, video_url VARCHAR(255) DEFAULT NULL, institut VARCHAR(255) DEFAULT NULL, objectives LONGTEXT DEFAULT NULL, trainer VARCHAR(255) DEFAULT NULL, modalities LONGTEXT DEFAULT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE masterclass (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, speaker_name VARCHAR(255) NOT NULL, scheduled_at DATETIME NOT NULL, price DOUBLE PRECISION NOT NULL, video_url VARCHAR(255) NOT NULL, is_live TINYINT NOT NULL, video VARCHAR(255) DEFAULT NULL, price_pdf DOUBLE PRECISION DEFAULT NULL, price_video DOUBLE PRECISION DEFAULT NULL, price_pack DOUBLE PRECISION DEFAULT NULL, image_preview VARCHAR(255) DEFAULT NULL, pdf_file VARCHAR(255) DEFAULT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE masterclass_purchase (id INT AUTO_INCREMENT NOT NULL, purchase_option VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, masterclass_id INT NOT NULL, INDEX IDX_F71C8FCFA76ED395 (user_id), INDEX IDX_F71C8FCF426F0705 (masterclass_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE payment (id INT AUTO_INCREMENT NOT NULL, product_type VARCHAR(20) NOT NULL, product_id INT NOT NULL, label VARCHAR(255) NOT NULL, purchase_option VARCHAR(20) DEFAULT NULL, amount_cents INT NOT NULL, currency VARCHAR(3) NOT NULL, stripe_session_id VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, INDEX idx_payment_user_created (user_id, created_at), UNIQUE INDEX uniq_payment_stripe_session (stripe_session_id), INDEX IDX_6D28840DA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE `user` (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, first_name VARCHAR(100) DEFAULT NULL, last_name VARCHAR(100) DEFAULT NULL, reset_token VARCHAR(100) DEFAULT NULL, reset_token_expires_at DATETIME DEFAULT NULL, UNIQUE INDEX UNIQ_8D93D649E7927C74 (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user_masterclass (user_id INT NOT NULL, masterclass_id INT NOT NULL, INDEX IDX_32C08D78A76ED395 (user_id), INDEX IDX_32C08D78426F0705 (masterclass_id), PRIMARY KEY (user_id, masterclass_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user_formation (user_id INT NOT NULL, formation_id INT NOT NULL, INDEX IDX_40A0AC5BA76ED395 (user_id), INDEX IDX_40A0AC5B5200282E (formation_id), PRIMARY KEY (user_id, formation_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL, available_at DATETIME NOT NULL, delivered_at DATETIME DEFAULT NULL, INDEX IDX_75EA56E0FB7336F0E3BD61CE16BA31DBBF396750 (queue_name, available_at, delivered_at, id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE event_registration ADD CONSTRAINT FK_8FBBAD5471F7E88B FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE event_registration ADD CONSTRAINT FK_8FBBAD54A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE masterclass_purchase ADD CONSTRAINT FK_F71C8FCFA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE masterclass_purchase ADD CONSTRAINT FK_F71C8FCF426F0705 FOREIGN KEY (masterclass_id) REFERENCES masterclass (id)');
        $this->addSql('ALTER TABLE payment ADD CONSTRAINT FK_6D28840DA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_masterclass ADD CONSTRAINT FK_32C08D78A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_masterclass ADD CONSTRAINT FK_32C08D78426F0705 FOREIGN KEY (masterclass_id) REFERENCES masterclass (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_formation ADD CONSTRAINT FK_40A0AC5BA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_formation ADD CONSTRAINT FK_40A0AC5B5200282E FOREIGN KEY (formation_id) REFERENCES formation (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE event_registration');
        $this->addSql('DROP TABLE masterclass_purchase');
        $this->addSql('DROP TABLE payment');
        $this->addSql('DROP TABLE user_masterclass');
        $this->addSql('DROP TABLE user_formation');
        $this->addSql('DROP TABLE messenger_messages');
        $this->addSql('DROP TABLE event');
        $this->addSql('DROP TABLE formation');
        $this->addSql('DROP TABLE masterclass');
        $this->addSql('DROP TABLE `user`');
    }
}
