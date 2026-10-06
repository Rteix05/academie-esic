<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261006120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Abonnements mensuels par institut (copie locale des abonnements Stripe, preuve des consentements)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE subscription (id INT AUTO_INCREMENT NOT NULL, plan VARCHAR(30) NOT NULL, stripe_subscription_id VARCHAR(255) NOT NULL, stripe_customer_id VARCHAR(255) NOT NULL, status VARCHAR(30) NOT NULL, current_period_end DATETIME DEFAULT NULL, cancel_at DATETIME DEFAULT NULL, ended_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, cgv_version VARCHAR(20) DEFAULT NULL, cgv_accepted_at DATETIME DEFAULT NULL, immediate_access_consent_at DATETIME DEFAULT NULL, user_id INT NOT NULL, INDEX idx_subscription_user (user_id), UNIQUE INDEX uniq_subscription_stripe_id (stripe_subscription_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE subscription ADD CONSTRAINT FK_A3C664D3A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE subscription DROP FOREIGN KEY FK_A3C664D3A76ED395');
        $this->addSql('DROP TABLE subscription');
    }
}
