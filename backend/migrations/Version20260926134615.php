<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Resynchronise la base avec le mapping Doctrine : les tables event, event_registration
 * et user_formation avaient été créées hors migrations.
 *
 * Pré-requis vérifiés le 2026-09-26 : aucun lien orphelin dans user_formation,
 * aucune valeur NULL dans event.price / event_registration.registered_at.
 */
final class Version20260926134615 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Synchronisation du schéma : clés étrangères user_formation, noms d\'index, types event/event_registration';
    }

    public function up(Schema $schema): void
    {
        // Types de colonnes alignés sur le mapping (aucun changement de données)
        $this->addSql('ALTER TABLE event CHANGE price price DOUBLE PRECISION DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE event_registration CHANGE registered_at registered_at DATETIME NOT NULL');

        // Index renommés selon la convention Doctrine
        $this->addSql('ALTER TABLE event_registration RENAME INDEX idx_event TO IDX_8FBBAD5471F7E88B');
        $this->addSql('ALTER TABLE event_registration RENAME INDEX idx_user TO IDX_8FBBAD54A76ED395');

        // Clés étrangères manquantes : supprimer un utilisateur ou une formation
        // supprime désormais ses liens au lieu de laisser des lignes orphelines
        $this->addSql('ALTER TABLE user_formation ADD CONSTRAINT FK_40A0AC5BA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_formation ADD CONSTRAINT FK_40A0AC5B5200282E FOREIGN KEY (formation_id) REFERENCES formation (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_formation RENAME INDEX idx_user TO IDX_40A0AC5BA76ED395');
        $this->addSql('ALTER TABLE user_formation RENAME INDEX idx_formation TO IDX_40A0AC5B5200282E');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE event CHANGE price price DOUBLE PRECISION DEFAULT \'0\' NOT NULL');
        $this->addSql('ALTER TABLE event_registration CHANGE registered_at registered_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE event_registration RENAME INDEX idx_8fbbad5471f7e88b TO IDX_event');
        $this->addSql('ALTER TABLE event_registration RENAME INDEX idx_8fbbad54a76ed395 TO IDX_user');
        $this->addSql('ALTER TABLE user_formation DROP FOREIGN KEY FK_40A0AC5BA76ED395');
        $this->addSql('ALTER TABLE user_formation DROP FOREIGN KEY FK_40A0AC5B5200282E');
        $this->addSql('ALTER TABLE user_formation RENAME INDEX idx_40a0ac5b5200282e TO IDX_formation');
        $this->addSql('ALTER TABLE user_formation RENAME INDEX idx_40a0ac5ba76ed395 TO IDX_user');
    }
}
