<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Historique des paiements (table payment), suppressions en cascade des inscriptions,
 * prix du pack de masterclass en numérique.
 */
final class Version20260926143321 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Table payment (+ reprise des achats existants), cascades event_registration, price_pack numérique';
    }

    public function up(Schema $schema): void
    {
        // 1. Historique des paiements
        $this->addSql('CREATE TABLE payment (id INT AUTO_INCREMENT NOT NULL, product_type VARCHAR(20) NOT NULL, product_id INT NOT NULL, label VARCHAR(255) NOT NULL, purchase_option VARCHAR(20) DEFAULT NULL, amount_cents INT NOT NULL, currency VARCHAR(3) NOT NULL, stripe_session_id VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, INDEX idx_payment_user_created (user_id, created_at), UNIQUE INDEX uniq_payment_stripe_session (stripe_session_id), INDEX IDX_6D28840DA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE payment ADD CONSTRAINT FK_6D28840DA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');

        // 2. Inscriptions supprimées avec leur événement / leur compte.
        //    La table avait été créée hors migrations : ses clés étrangères portent des noms
        //    générés par MySQL, supprimés seulement s'ils existent.
        $registration = $schema->getTable('event_registration');
        foreach (['event_registration_ibfk_1', 'event_registration_ibfk_2', 'FK_8FBBAD5471F7E88B', 'FK_8FBBAD54A76ED395'] as $fk) {
            if ($registration->hasForeignKey($fk)) {
                $this->addSql(sprintf('ALTER TABLE event_registration DROP FOREIGN KEY `%s`', $fk));
            }
        }
        $this->addSql('ALTER TABLE event_registration ADD CONSTRAINT FK_8FBBAD5471F7E88B FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE event_registration ADD CONSTRAINT FK_8FBBAD54A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');

        // 3. price_pack : chaîne -> nombre (valeurs vides ou non numériques remises à NULL avant conversion)
        $this->addSql("UPDATE masterclass SET price_pack = NULL WHERE price_pack IS NOT NULL AND TRIM(price_pack) NOT REGEXP '^[0-9]+([.,][0-9]+)?$'");
        $this->addSql("UPDATE masterclass SET price_pack = REPLACE(TRIM(price_pack), ',', '.') WHERE price_pack IS NOT NULL");
        $this->addSql('ALTER TABLE masterclass CHANGE price_pack price_pack DOUBLE PRECISION DEFAULT NULL');

        // 4. Reprise des achats antérieurs à l'historique. Le montant réellement payé n'ayant pas
        //    été conservé, on reprend le prix catalogue actuel (meilleure estimation disponible).
        $this->addSql(<<<'SQL'
            INSERT INTO payment (user_id, product_type, product_id, label, purchase_option, amount_cents, currency, stripe_session_id, created_at)
            SELECT mp.user_id, 'masterclass', m.id,
                   CONCAT(m.title, ' — ', CASE mp.purchase_option WHEN 'pdf' THEN 'Format PDF' WHEN 'video' THEN 'Format Vidéo' ELSE 'Pack Complet (Vidéo + PDF)' END),
                   mp.purchase_option,
                   ROUND(COALESCE(CASE mp.purchase_option WHEN 'pdf' THEN m.price_pdf WHEN 'video' THEN m.price_video ELSE m.price_pack END, 0) * 100),
                   'eur', NULL, mp.created_at
            FROM masterclass_purchase mp
            INNER JOIN masterclass m ON m.id = mp.masterclass_id
            SQL);

        $this->addSql(<<<'SQL'
            INSERT INTO payment (user_id, product_type, product_id, label, purchase_option, amount_cents, currency, stripe_session_id, created_at)
            SELECT er.user_id, 'event', e.id, e.title, NULL, ROUND(e.price * 100), 'eur', er.stripe_session_id, er.registered_at
            FROM event_registration er
            INNER JOIN event e ON e.id = er.event_id
            WHERE er.status = 'paid'
            SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE payment DROP FOREIGN KEY FK_6D28840DA76ED395');
        $this->addSql('DROP TABLE payment');
        $this->addSql('ALTER TABLE event_registration DROP FOREIGN KEY FK_8FBBAD5471F7E88B');
        $this->addSql('ALTER TABLE event_registration DROP FOREIGN KEY FK_8FBBAD54A76ED395');
        $this->addSql('ALTER TABLE event_registration ADD CONSTRAINT FK_8FBBAD5471F7E88B FOREIGN KEY (event_id) REFERENCES event (id)');
        $this->addSql('ALTER TABLE event_registration ADD CONSTRAINT FK_8FBBAD54A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE masterclass CHANGE price_pack price_pack VARCHAR(255) DEFAULT NULL');
    }
}
