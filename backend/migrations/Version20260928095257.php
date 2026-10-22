<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260928095257 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Paiements : preuve des consentements (version des CGV acceptée, accès immédiat au contenu numérique)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE payment ADD cgv_version VARCHAR(20) DEFAULT NULL, ADD cgv_accepted_at DATETIME DEFAULT NULL, ADD immediate_access_consent_at DATETIME DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE payment DROP cgv_version, DROP cgv_accepted_at, DROP immediate_access_consent_at');
    }
}
