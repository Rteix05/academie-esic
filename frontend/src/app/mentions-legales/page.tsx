import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales — Académie E.S.I.C.',
};

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-[#FBFBFA] text-[#1C2C24] font-sans antialiased">
      <section className="max-w-3xl mx-auto px-6 py-16">

        <div className="mb-10">
          <Link href="/" className="text-sm text-gray-400 hover:text-[#0F291E] transition">← Retour à l'accueil</Link>
        </div>

        <h1 className="text-4xl font-black text-[#0F291E] tracking-tight mb-2">Mentions légales</h1>
        <p className="text-sm text-gray-400 mb-12">Dernière mise à jour : juillet 2026</p>

        <div className="prose prose-sm max-w-none space-y-10 text-gray-700">

          <section>
            <h2 className="text-lg font-bold text-[#0F291E] mb-3">1. Éditeur du site</h2>
            <p>
              Le site <strong>academie-esic.fr</strong> est édité par l'<strong>Académie E.S.I.C.</strong>,
              association loi 1901 dont le siège social est situé en France.<br />
              Responsable de la publication : Direction de l'Académie E.S.I.C.<br />
              Contact : <a href="mailto:contact@academie-esic.fr" className="text-emerald-700 underline">contact@academie-esic.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0F291E] mb-3">2. Hébergement</h2>
            <p>
              Ce site est hébergé par des prestataires d'hébergement cloud (serveurs localisés dans l'Union Européenne).
              Les coordonnées précises de l'hébergeur sont disponibles sur demande à l'adresse email indiquée ci-dessus.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0F291E] mb-3">3. Propriété intellectuelle</h2>
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
            <h2 className="text-lg font-bold text-[#0F291E] mb-3">4. Données personnelles</h2>
            <p>
              L'Académie E.S.I.C. collecte et traite des données à caractère personnel dans le cadre de la gestion
              des comptes utilisateurs et des transactions. Conformément au Règlement Général sur la Protection des
              Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification,
              de suppression et de portabilité de vos données.
            </p>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous à :{' '}
              <a href="mailto:contact@academie-esic.fr" className="text-emerald-700 underline">contact@academie-esic.fr</a>.
              Consultez notre{' '}
              <Link href="/politique-de-confidentialite" className="text-emerald-700 underline">
                politique de confidentialité
              </Link>{' '}
              pour plus d'informations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0F291E] mb-3">5. Cookies</h2>
            <p>
              Ce site utilise des cookies techniques nécessaires à son bon fonctionnement (authentification,
              session utilisateur). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0F291E] mb-3">6. Limitation de responsabilité</h2>
            <p>
              L'Académie E.S.I.C. s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées
              sur ce site. Toutefois, elle ne peut garantir l'exactitude, la précision ou l'exhaustivité des
              informations mises à disposition, et décline toute responsabilité pour toute imprécision,
              inexactitude ou omission portant sur des informations disponibles sur ce site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0F291E] mb-3">7. Droit applicable</h2>
            <p>
              Les présentes mentions légales sont soumises au droit français. En cas de litige,
              les tribunaux français seront seuls compétents.
            </p>
          </section>

        </div>
      </section>
    </main>
  );
}
