import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/ui';
import { CONTACT_EMAIL } from '@/lib/contact';

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description: "Conditions générales d'utilisation du site et des services de l'Académie E.S.I.C.",
  alternates: { canonical: '/cgu' },
};

const linkClass = 'font-medium text-brand-forest underline underline-offset-4 hover:text-brand-emerald dark:text-emerald-200';

const CONTACT = (
  <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>{CONTACT_EMAIL}</a>
);

function Article({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-28">
      <h2 id={id} className="mb-3 font-display text-lg font-semibold text-brand-forest">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

const ARTICLES = [
  { id: 'objet', title: '1. Objet et acceptation' },
  { id: 'editeur', title: '2. Éditeur du site' },
  { id: 'acces', title: '3. Accès au site et création de compte' },
  { id: 'securite', title: '4. Identifiants et sécurité du compte' },
  { id: 'services', title: '5. Services proposés' },
  { id: 'contenus', title: '6. Utilisation des contenus pédagogiques' },
  { id: 'propriete', title: '7. Propriété intellectuelle' },
  { id: 'obligations', title: "8. Obligations de l'utilisateur" },
  { id: 'suspension', title: '9. Suspension et suppression du compte' },
  { id: 'responsabilite', title: '10. Disponibilité et responsabilité' },
  { id: 'donnees', title: '11. Données personnelles et cookies' },
  { id: 'liens', title: '12. Liens et services tiers' },
  { id: 'modification', title: '13. Modification des conditions' },
  { id: 'droit', title: '14. Droit applicable et litiges' },
];

export default function CguPage() {
  return (
    <div className="pb-8">
      <PageHeader title="Conditions générales d'utilisation" lead="Dernière mise à jour : septembre 2026" />

      <div className="card mx-auto mt-10 max-w-3xl space-y-10 p-8 text-[length:calc(15px*var(--text-scale,1))] leading-relaxed text-brand-muted sm:p-12">
        <nav aria-label="Sommaire des conditions générales d'utilisation">
          <p className="font-display text-sm font-semibold text-brand-forest">Sommaire</p>
          <ol className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {ARTICLES.map((a) => (
              <li key={a.id}><a href={`#${a.id}`} className={linkClass}>{a.title}</a></li>
            ))}
          </ol>
        </nav>

        <Article id="objet" title="1. Objet et acceptation">
          <p>
            Les présentes conditions générales d&apos;utilisation (« CGU ») définissent les règles d&apos;accès et
            d&apos;utilisation du site <strong>academie-esic.fr</strong> et des services proposés par
            l&apos;Académie E.S.I.C. (« l&apos;Académie »).
          </p>
          <p>
            La navigation sur le site vaut acceptation des présentes CGU. La création d&apos;un compte est subordonnée
            à leur acceptation expresse, en cochant la case prévue à cet effet dans le formulaire d&apos;inscription.
          </p>
          <p>
            L&apos;achat de formations ou de masterclass est en outre soumis aux conditions de vente (prix, paiement,
            droit de rétractation) portées à la connaissance de l&apos;utilisateur avant toute commande.
          </p>
        </Article>

        <Article id="editeur" title="2. Éditeur du site">
          <p>
            Le site est édité par l&apos;Académie E.S.I.C. Les informations relatives à l&apos;éditeur et à
            l&apos;hébergeur figurent dans les{' '}
            <Link href="/mentions-legales" className={linkClass}>mentions légales</Link>.
            Pour toute question relative aux présentes CGU : {CONTACT}.
          </p>
        </Article>

        <Article id="acces" title="3. Accès au site et création de compte">
          <p>
            Le site est accessible gratuitement à toute personne disposant d&apos;un accès à Internet. Les frais de
            connexion et d&apos;équipement restent à la charge de l&apos;utilisateur.
          </p>
          <p>
            L&apos;accès aux formations, aux masterclass et à l&apos;espace personnel nécessite la création d&apos;un
            compte, avec une adresse email valide et un mot de passe. L&apos;utilisateur s&apos;engage à fournir des
            informations exactes et à les tenir à jour depuis son espace « Mon profil ».
          </p>
          <p>
            Un compte est strictement personnel : il ne peut être ni partagé, ni cédé, ni utilisé par plusieurs
            personnes. Les mineurs doivent disposer de l&apos;autorisation de leur représentant légal pour créer un
            compte et effectuer un achat.
          </p>
        </Article>

        <Article id="securite" title="4. Identifiants et sécurité du compte">
          <p>
            L&apos;utilisateur est responsable de la confidentialité de son mot de passe et de toute activité réalisée
            depuis son compte. Il choisit un mot de passe robuste et ne le communique à personne.
          </p>
          <p>
            En cas de perte ou de suspicion d&apos;utilisation frauduleuse, l&apos;utilisateur modifie sans délai son
            mot de passe (fonction « Mot de passe oublié » ou « Mon profil ») et en informe l&apos;Académie à {CONTACT}.
            Pour la sécurité des comptes, les tentatives de connexion répétées peuvent être temporairement bloquées.
          </p>
        </Article>

        <Article id="services" title="5. Services proposés">
          <p>L&apos;Académie propose notamment :</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>des <strong>formations</strong>, en accès gratuit ou payant selon la formation ;</li>
            <li>des <strong>masterclass</strong> payantes, disponibles en vidéo, en PDF ou en pack (vidéo et PDF) ;</li>
            <li>un <strong>espace personnel</strong> regroupant les contenus débloqués et l&apos;historique des paiements.</li>
          </ul>
          <p>
            Les contenus achetés restent accessibles depuis l&apos;espace personnel tant que le compte est actif et
            que le service est exploité par l&apos;Académie. Les paiements sont traités par le prestataire sécurisé
            Stripe : l&apos;Académie n&apos;a jamais accès aux données bancaires complètes.
          </p>
          <p>
            L&apos;Académie peut faire évoluer, ajouter ou retirer des contenus et des fonctionnalités, sans
            toutefois retirer l&apos;accès à un contenu déjà acheté, sauf motif légitime (obligation légale, droits
            d&apos;un intervenant) ; dans ce cas, l&apos;utilisateur en est informé.
          </p>
        </Article>

        <Article id="contenus" title="6. Utilisation des contenus pédagogiques">
          <p>
            Les formations, masterclass, vidéos et documents sont concédés pour un <strong>usage strictement personnel
            et non commercial</strong>, dans le cadre de l&apos;apprentissage de l&apos;utilisateur.
          </p>
          <p>Sont notamment interdits, sans autorisation écrite de l&apos;Académie :</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>le téléchargement, l&apos;enregistrement ou la capture des vidéos ;</li>
            <li>la reproduction, la diffusion, le partage ou la revente de tout ou partie des contenus, y compris des PDF ;</li>
            <li>la communication de ses accès à un tiers ou la projection collective des contenus.</li>
          </ul>
          <p>
            Afin de protéger les contenus, le lecteur vidéo affiche un filigrane personnalisé (nom ou adresse email de
            l&apos;utilisateur). Toute diffusion illicite constatée peut entraîner la suspension du compte, sans
            préjudice de poursuites.
          </p>
        </Article>

        <Article id="propriete" title="7. Propriété intellectuelle">
          <p>
            L&apos;ensemble des éléments du site (textes, vidéos, documents, images, logos, marques, structure) est
            protégé par le droit de la propriété intellectuelle et appartient à l&apos;Académie ou à ses intervenants
            et partenaires. L&apos;utilisation du site ou l&apos;achat d&apos;un contenu ne transfère aucun droit de
            propriété à l&apos;utilisateur, au-delà du droit d&apos;usage personnel défini à l&apos;article 6.
          </p>
        </Article>

        <Article id="obligations" title="8. Obligations de l'utilisateur">
          <p>L&apos;utilisateur s&apos;engage à utiliser le site de manière loyale et conforme à la loi. Il s&apos;interdit notamment :</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>de porter atteinte au fonctionnement ou à la sécurité du site (intrusion, contournement des protections, surcharge volontaire) ;</li>
            <li>d&apos;utiliser des robots ou procédés automatisés pour extraire des contenus ou des données ;</li>
            <li>d&apos;usurper l&apos;identité d&apos;un tiers ou de transmettre des informations fausses ;</li>
            <li>de publier ou de transmettre, notamment via le formulaire de contact, des propos illicites, injurieux ou discriminatoires.</li>
          </ul>
        </Article>

        <Article id="suspension" title="9. Suspension et suppression du compte">
          <p>
            L&apos;utilisateur peut demander à tout moment la suppression de son compte en écrivant à {CONTACT}. La
            suppression entraîne la perte d&apos;accès aux contenus débloqués ; les données de paiement sont
            conservées pendant la durée imposée par les obligations comptables.
          </p>
          <p>
            En cas de manquement aux présentes CGU, l&apos;Académie peut suspendre ou supprimer le compte concerné,
            après information préalable de l&apos;utilisateur, sauf urgence ou manquement grave (fraude, diffusion
            illicite des contenus, atteinte à la sécurité du site).
          </p>
        </Article>

        <Article id="responsabilite" title="10. Disponibilité et responsabilité">
          <p>
            L&apos;Académie met en œuvre les moyens raisonnables pour assurer un accès continu au site, sans
            obligation de résultat. L&apos;accès peut être interrompu pour maintenance, mise à jour ou en cas de force
            majeure ou de défaillance d&apos;un prestataire technique.
          </p>
          <p>
            L&apos;Académie ne saurait être tenue responsable des dommages résultant d&apos;une mauvaise utilisation du
            site, d&apos;une indisponibilité temporaire, ou de l&apos;usage fait par l&apos;utilisateur des
            enseignements proposés. Les contenus ont une vocation pédagogique et spirituelle et ne constituent pas un
            conseil professionnel individualisé.
          </p>
        </Article>

        <Article id="donnees" title="11. Données personnelles et cookies">
          <p>
            Les données personnelles sont traitées conformément au Règlement général sur la protection des données
            (RGPD). Les traitements, leurs finalités, les durées de conservation et les droits de l&apos;utilisateur
            (accès, rectification, effacement, portabilité, opposition) sont détaillés dans la{' '}
            <Link href="/politique-de-confidentialite" className={linkClass}>politique de confidentialité</Link>.
          </p>
          <p>
            Le site utilise un cookie strictement nécessaire à la connexion au compte. Les préférences d&apos;affichage
            (thème, taille du texte) sont enregistrées uniquement dans le navigateur de l&apos;utilisateur.
          </p>
        </Article>

        <Article id="liens" title="12. Liens et services tiers">
          <p>
            Certaines vidéos sont diffusées au moyen de lecteurs de services tiers (par exemple YouTube ou Vimeo) et
            le paiement est assuré par Stripe. L&apos;utilisation de ces services est également soumise à leurs
            propres conditions. Les liens vers des sites extérieurs sont fournis à titre d&apos;information ;
            l&apos;Académie n&apos;est pas responsable de leur contenu.
          </p>
        </Article>

        <Article id="modification" title="13. Modification des conditions">
          <p>
            L&apos;Académie peut modifier les présentes CGU, notamment pour suivre l&apos;évolution des services ou de
            la réglementation. La version applicable est celle en ligne à la date d&apos;utilisation du site. En cas
            de modification substantielle, les utilisateurs inscrits en sont informés par email ou lors de leur
            connexion.
          </p>
        </Article>

        <Article id="droit" title="14. Droit applicable et litiges">
          <p>
            Les présentes CGU sont soumises au droit français. En cas de difficulté, l&apos;utilisateur est invité à
            contacter d&apos;abord l&apos;Académie à {CONTACT} afin de rechercher une solution amiable.
          </p>
          <p>
            L&apos;utilisateur consommateur peut également recourir gratuitement à un médiateur de la consommation,
            dans les conditions prévues par le Code de la consommation. À défaut d&apos;accord amiable, le litige est
            porté devant les juridictions françaises compétentes.
          </p>
        </Article>
      </div>
    </div>
  );
}
