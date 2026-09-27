import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales',
};

export default function MentionsLegalesPage() {
  return (
    <div className="pb-8">
      <section className="container-page pt-4">

        <div className="relative overflow-hidden rounded-5xl bg-brand-mint px-6 py-14 text-center sm:px-12 dark:bg-[#10231a]">
          <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-brand-sage/60 dark:bg-emerald-400/5" />
          <Link href="/" className="relative text-sm font-medium text-brand-muted transition hover:text-brand-emerald">← Retour à l'accueil</Link>
          <h1 className="relative mt-5 font-display text-4xl font-semibold text-brand-forest sm:text-5xl">Mentions légales</h1>
          <p className="relative mt-4 text-sm text-brand-muted">Dernière mise à jour : juillet 2026</p>
        </div>

        <div className="card mx-auto mt-10 max-w-3xl space-y-10 p-8 text-[length:calc(15px*var(--text-scale,1))] leading-relaxed text-brand-muted sm:p-12">

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">1. Éditeur du site</h2>
            <p>
              Le site <strong>academie-esic.fr</strong> est édité par l'<strong>Académie E.S.I.C.</strong>,
              association loi 1901 dont le siège social est situé en France.<br />
              Responsable de la publication : Direction de l'Académie E.S.I.C.<br />
              Contact : <a href="mailto:contact@academie-esic.fr" className="font-medium text-brand-emerald underline underline-offset-4">contact@academie-esic.fr</a>
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">2. Hébergement</h2>
            <p>
              Ce site est hébergé par des prestataires d'hébergement cloud (serveurs localisés dans l'Union Européenne).
              Les coordonnées précises de l'hébergeur sont disponibles sur demande à l'adresse email indiquée ci-dessus.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">3. Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus présents sur ce site (textes, images, vidéos, logos, formations, masterclass)
              est la propriété exclusive de l'Académie E.S.I.C. ou de ses partenaires, et est protégé par les lois
              françaises et internationales relatives à la propriété intellectuelle.
            </p>
            <p className="mt-3">
              Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même partielle,
              de ces différents éléments est strictement interdite sans l'accord exprès par écrit de l'Académie E.S.I.C.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">4. Données personnelles</h2>
            <p>
              L'Académie E.S.I.C. collecte et traite des données à caractère personnel dans le cadre de la gestion
              des comptes utilisateurs et des transactions. Conformément au Règlement Général sur la Protection des
              Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification,
              de suppression et de portabilité de vos données.
            </p>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous à :{' '}
              <a href="mailto:contact@academie-esic.fr" className="font-medium text-brand-emerald underline underline-offset-4">contact@academie-esic.fr</a>.
              Consultez notre{' '}
              <Link href="/politique-de-confidentialite" className="font-medium text-brand-emerald underline underline-offset-4">
                politique de confidentialité
              </Link>{' '}
              pour plus d'informations.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">5. Cookies</h2>
            <p>
              Ce site utilise des cookies techniques nécessaires à son bon fonctionnement (authentification,
              session utilisateur). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">6. Limitation de responsabilité</h2>
            <p>
              L'Académie E.S.I.C. s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées
              sur ce site. Toutefois, elle ne peut garantir l'exactitude, la précision ou l'exhaustivité des
              informations mises à disposition, et décline toute responsabilité pour toute imprécision,
              inexactitude ou omission portant sur des informations disponibles sur ce site.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">7. Droit applicable</h2>
            <p>
              Les présentes mentions légales sont soumises au droit français. En cas de litige,
              les tribunaux français seront seuls compétents.
            </p>
          </section>

        </div>
      </section>
    </div>
  );
}
