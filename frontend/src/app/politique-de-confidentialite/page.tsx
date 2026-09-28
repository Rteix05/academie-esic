import Link from 'next/link';
import type { Metadata } from 'next';
import { CONTACT_EMAIL } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="pb-8">
      <section className="container-page pt-4">

        <div className="relative overflow-hidden rounded-5xl bg-brand-mint px-6 py-14 text-center sm:px-12 dark:bg-[#10231a]">
          <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-brand-sage/60 dark:bg-emerald-400/5" />
          <Link href="/" className="relative text-sm font-medium text-brand-muted transition hover:text-brand-emerald">← Retour à l'accueil</Link>
          <h1 className="relative mt-5 font-display text-4xl font-semibold text-brand-forest sm:text-5xl">Politique de confidentialité</h1>
          <p className="relative mt-4 text-sm text-brand-muted">Dernière mise à jour : juillet 2026</p>
        </div>

        <div className="card mx-auto mt-10 max-w-3xl space-y-10 p-8 text-[length:calc(15px*var(--text-scale,1))] leading-relaxed text-brand-muted sm:p-12">

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">1. Responsable du traitement</h2>
            <p>
              L'<strong>Académie E.S.I.C.</strong> est responsable du traitement de vos données personnelles
              collectées via le site <strong>academie-esic.fr</strong>.<br />
              Contact DPO : <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-brand-emerald underline underline-offset-4">{CONTACT_EMAIL}</a>
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">2. Données collectées</h2>
            <p>Dans le cadre de l'utilisation de nos services, nous collectons les données suivantes :</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-brand-emerald">
              <li><strong>Données d'inscription :</strong> adresse email, mot de passe (chiffré), prénom, nom</li>
              <li><strong>Données de transaction :</strong> historique des achats (formations, masterclass), montants</li>
              <li><strong>Données de connexion :</strong> token d'authentification JWT stocké localement dans votre navigateur</li>
              <li><strong>Données techniques :</strong> adresse IP, type de navigateur (via les logs serveur)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">3. Finalités du traitement</h2>
            <p>Vos données sont traitées pour les finalités suivantes :</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-brand-emerald">
              <li>Gestion de votre compte utilisateur et authentification sécurisée</li>
              <li>Traitement des paiements et accès aux contenus achetés (formations, masterclass)</li>
              <li>Envoi d'emails transactionnels (confirmation d'achat, réinitialisation de mot de passe)</li>
              <li>Amélioration de nos services et sécurité de la plateforme</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">4. Base légale</h2>
            <p>
              Le traitement de vos données est fondé sur :
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-brand-emerald">
              <li>L'<strong>exécution du contrat</strong> (accès aux formations et masterclass achetées)</li>
              <li>Le <strong>consentement</strong> (inscription volontaire sur la plateforme)</li>
              <li>L'<strong>intérêt légitime</strong> (sécurité de la plateforme, prévention des fraudes)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">5. Durée de conservation</h2>
            <ul className="list-disc space-y-2 pl-5 marker:text-brand-emerald">
              <li><strong>Compte utilisateur :</strong> données conservées pendant toute la durée d'activité du compte, puis 3 ans après la dernière connexion</li>
              <li><strong>Données de transaction :</strong> 10 ans conformément aux obligations comptables et fiscales</li>
              <li><strong>Tokens de réinitialisation :</strong> 1 heure, puis supprimés automatiquement</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">6. Partage des données</h2>
            <p>
              Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec :
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-brand-emerald">
              <li><strong>Stripe</strong> : prestataire de paiement sécurisé (traitement des transactions uniquement)</li>
              <li><strong>Hébergeur</strong> : pour le fonctionnement technique de la plateforme</li>
            </ul>
            <p className="mt-3">
              Ces prestataires sont soumis à des obligations de confidentialité strictes et conformes au RGPD.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">7. Sécurité des données</h2>
            <p>
              Nous mettons en œuvre les mesures techniques et organisationnelles suivantes pour protéger vos données :
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-brand-emerald">
              <li>Chiffrement des mots de passe (bcrypt)</li>
              <li>Authentification par token JWT à durée limitée</li>
              <li>Communications chiffrées en HTTPS</li>
              <li>Paiements traités exclusivement par Stripe (norme PCI-DSS)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">8. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-brand-emerald">
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> corriger vos données (via la page{' '}
                <Link href="/dashboard/profil" className="font-medium text-brand-emerald underline underline-offset-4">Mon profil</Link>)</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de votre compte</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements</li>
            </ul>
            <p className="mt-4">
              Pour exercer ces droits, contactez-nous à :{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-brand-emerald underline underline-offset-4">{CONTACT_EMAIL}</a>.
              Vous pouvez également introduire une réclamation auprès de la{' '}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="font-medium text-brand-emerald underline underline-offset-4">CNIL<span className="sr-only"> (nouvelle fenêtre)</span></a>.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">9. Cookies</h2>
            <p>
              Ce site utilise uniquement des cookies techniques strictement nécessaires au fonctionnement
              de l'authentification. Aucun cookie de traçage ou publicitaire n'est déposé sur votre appareil.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">10. Modifications</h2>
            <p>
              Nous nous réservons le droit de modifier cette politique à tout moment. Toute modification
              substantielle vous sera notifiée par email ou affichée en évidence sur le site.
            </p>
          </section>

        </div>
      </section>
    </div>
  );
}
