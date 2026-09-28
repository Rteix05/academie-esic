import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';
import { ContactEmail, LegalArticle, LegalIdentity, LegalList, LegalToc, LegalValue, legalLinkClass } from '@/components/legal';
import { LEGAL_INFO } from '@/lib/legalInfo';

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description: "Conditions générales d'utilisation du site et des services de l'Académie E.S.I.C.",
  alternates: { canonical: '/cgu' },
};

const ARTICLES = [
  { id: 'objet', title: '1. Objet et acceptation' },
  { id: 'editeur', title: '2. Éditeur du site' },
  { id: 'acces', title: '3. Accès au site et création de compte' },
  { id: 'securite', title: '4. Identifiants et sécurité' },
  { id: 'services', title: '5. Services proposés' },
  { id: 'acces-contenus', title: '6. Accès aux contenus' },
  { id: 'utilisation', title: '7. Utilisation des contenus pédagogiques' },
  { id: 'propriete', title: '8. Propriété intellectuelle' },
  { id: 'obligations', title: "9. Obligations de l'utilisateur" },
  { id: 'suspension', title: "10. Suspension ou suppression d'un compte" },
  { id: 'disponibilite', title: '11. Disponibilité du site' },
  { id: 'responsabilite', title: '12. Responsabilité' },
  { id: 'donnees', title: '13. Données personnelles' },
  { id: 'cookies', title: '14. Cookies et technologies similaires' },
  { id: 'tiers', title: '15. Services tiers' },
  { id: 'liens', title: '16. Liens externes' },
  { id: 'modification', title: '17. Modification des CGU' },
  { id: 'droit', title: '18. Droit applicable et règlement des litiges' },
];

const cgv = <Link href="/cgv" className={legalLinkClass}>Conditions Générales de Vente</Link>;
const politique = <Link href="/politique-de-confidentialite" className={legalLinkClass}>Politique de confidentialité</Link>;

export default function CguPage() {
  const L = LEGAL_INFO;
  return (
    <div className="pb-8">
      <PageHeader
        title="Conditions générales d'utilisation"
        lead={<>Dernière mise à jour : <LegalValue value={L.dateCgu} label="date" /></>}
      />

      <div className="card mx-auto mt-10 max-w-3xl space-y-10 p-8 text-[length:calc(15px*var(--text-scale,1))] leading-relaxed text-brand-muted sm:p-12">
        <LegalToc label="Sommaire des conditions générales d'utilisation" articles={ARTICLES} />

        <LegalArticle id="objet" title="1. Objet et acceptation">
          <p>
            Les présentes Conditions Générales d&apos;Utilisation (« CGU ») ont pour objet de définir les conditions
            d&apos;accès et d&apos;utilisation du site <strong>academie-esic.fr</strong> ainsi que des services proposés
            par l&apos;Académie E.S.I.C. (« l&apos;Académie »).
          </p>
          <p>
            Le site permet notamment aux utilisateurs de consulter des contenus pédagogiques, de créer un compte
            personnel, d&apos;accéder à des formations et masterclass, gratuites ou payantes, et de gérer leurs contenus
            depuis leur espace personnel.
          </p>
          <p>La navigation sur le site implique l&apos;acceptation des présentes CGU.</p>
          <p>
            La création d&apos;un compte nécessite l&apos;acceptation expresse des présentes CGU au moyen de la case
            prévue à cet effet lors de l&apos;inscription.
          </p>
          <p>
            L&apos;achat de contenus payants est également soumis aux {cgv} de l&apos;Académie, qui doivent être
            acceptées avant toute commande.
          </p>
        </LegalArticle>

        <LegalArticle id="editeur" title="2. Éditeur du site">
          <p>Le site academie-esic.fr est édité par :</p>
          <LegalIdentity rows={[
            { label: 'Dénomination', value: L.nom },
            { label: 'Forme juridique', value: <LegalValue value={L.formeJuridique} label="forme juridique" /> },
            { label: 'Capital social', value: <LegalValue value={L.capitalSocial} label="le cas échéant" /> },
            { label: 'Siège social', value: <LegalValue value={L.siege} label="adresse complète" /> },
            { label: 'SIREN / SIRET', value: <LegalValue value={L.siren} label="numéro" /> },
            { label: 'N° de TVA intracommunautaire', value: <LegalValue value={L.tva} label="le cas échéant" /> },
            { label: 'Email', value: <ContactEmail /> },
            { label: 'Téléphone', value: <LegalValue value={L.telephone} label="numéro" /> },
            { label: 'Directeur de la publication', value: <LegalValue value={L.directeurPublication} label="nom" /> },
          ]} />
          <p>
            Les informations relatives à l&apos;hébergement du site sont disponibles dans les{' '}
            <Link href="/mentions-legales" className={legalLinkClass}>mentions légales</Link>.
          </p>
        </LegalArticle>

        <LegalArticle id="acces" title="3. Accès au site et création de compte">
          <p>Le site est accessible gratuitement à toute personne disposant d&apos;un accès à Internet.</p>
          <p>
            Les frais nécessaires à l&apos;accès au site, notamment les frais de connexion, d&apos;abonnement Internet et
            d&apos;équipement informatique ou mobile, sont à la charge de l&apos;utilisateur.
          </p>
          <p>Certaines fonctionnalités, formations et masterclass nécessitent la création d&apos;un compte.</p>
          <p>
            Lors de la création de son compte, l&apos;utilisateur s&apos;engage à fournir des informations exactes,
            complètes et à jour.
          </p>
          <p>L&apos;utilisateur peut modifier certaines informations personnelles depuis son espace « Mon profil ».</p>
          <p>Un compte est strictement personnel. Il ne peut être vendu, cédé, prêté ou utilisé par plusieurs personnes.</p>
          <p>
            Lorsqu&apos;un utilisateur est mineur, les conditions applicables aux mineurs et, notamment,
            l&apos;autorisation de son représentant légal doivent être respectées.
          </p>
        </LegalArticle>

        <LegalArticle id="securite" title="4. Identifiants et sécurité">
          <p>L&apos;utilisateur est responsable de la confidentialité de ses identifiants de connexion.</p>
          <p>Il s&apos;engage à :</p>
          <LegalList items={[
            'choisir un mot de passe suffisamment robuste ;',
            'conserver ses identifiants confidentiels ;',
            'ne pas communiquer son compte à un tiers ;',
            "informer l'Académie dans les meilleurs délais en cas d'utilisation non autorisée ou de compromission de son compte.",
          ]} />
          <p>En cas d&apos;oubli du mot de passe, l&apos;utilisateur peut utiliser la fonctionnalité « Mot de passe oublié ».</p>
          <p>
            Afin de préserver la sécurité du service, l&apos;Académie peut mettre temporairement en œuvre des mesures de
            protection, notamment le blocage temporaire de tentatives de connexion répétées.
          </p>
        </LegalArticle>

        <LegalArticle id="services" title="5. Services proposés">
          <p>L&apos;Académie propose notamment :</p>
          <LegalList items={[
            'des formations accessibles gratuitement ou moyennant paiement ;',
            'des masterclass payantes ;',
            'des contenus vidéo ;',
            'des documents au format PDF ;',
            'des packs comprenant plusieurs formats de contenus ;',
            'un espace personnel permettant notamment de retrouver les contenus accessibles ;',
            'un historique des commandes et paiements.',
          ]} />
          <p>
            Les caractéristiques essentielles, les modalités d&apos;accès et, lorsqu&apos;ils sont payants, les prix des
            contenus sont présentés à l&apos;utilisateur avant toute commande.
          </p>
          <p>Les modalités spécifiques relatives aux achats sont définies dans les {cgv}.</p>
        </LegalArticle>

        <LegalArticle id="acces-contenus" title="6. Accès aux contenus">
          <p>Les contenus accessibles depuis le compte de l&apos;utilisateur sont destinés à un usage personnel et non commercial.</p>
          <p>L&apos;accès à un contenu ne constitue pas un transfert de propriété intellectuelle.</p>
          <p>Sauf indication contraire dans les CGV ou lors de la commande, l&apos;accès aux contenus numériques est personnel et individuel.</p>
          <p>L&apos;Académie peut faire évoluer ses formations, ses fonctionnalités et son interface afin d&apos;améliorer le service.</p>
          <p>
            Lorsqu&apos;un contenu a déjà été acheté, toute modification ou suppression de ce contenu est réalisée
            conformément aux conditions prévues dans les CGV.
          </p>
        </LegalArticle>

        <LegalArticle id="utilisation" title="7. Utilisation des contenus pédagogiques">
          <p>
            Les formations, masterclass, vidéos, documents et autres supports pédagogiques sont destinés exclusivement à
            l&apos;usage personnel de l&apos;utilisateur.
          </p>
          <p>
            Sauf autorisation écrite préalable de l&apos;Académie ou des titulaires des droits concernés, il est
            notamment interdit de :
          </p>
          <LegalList items={[
            'reproduire tout ou partie des contenus ;',
            'copier ou redistribuer les vidéos ;',
            'enregistrer ou capturer les vidéos ;',
            'partager les fichiers PDF avec des tiers ;',
            'revendre ou commercialiser les contenus ;',
            'communiquer ses identifiants à un tiers ;',
            'mettre les contenus à disposition du public ;',
            'organiser une projection ou diffusion collective ;',
            'utiliser les contenus pour créer une offre concurrente.',
          ]} />
          <p>
            Afin de protéger les contenus, certains lecteurs vidéo peuvent intégrer un filigrane personnalisé
            comprenant notamment le nom ou l&apos;adresse email du titulaire du compte.
          </p>
          <p>
            Toute utilisation illicite ou diffusion non autorisée pourra entraîner les mesures prévues par les présentes
            CGU, sans préjudice des éventuelles actions judiciaires.
          </p>
        </LegalArticle>

        <LegalArticle id="propriete" title="8. Propriété intellectuelle">
          <p>
            L&apos;ensemble des éléments composant le site et les services de l&apos;Académie, notamment les textes,
            vidéos, documents, illustrations, photographies, logos, marques, éléments graphiques, interfaces, bases de
            données et contenus pédagogiques, est protégé par les dispositions applicables en matière de propriété
            intellectuelle.
          </p>
          <p>Ces éléments appartiennent à l&apos;Académie, à ses intervenants, partenaires ou titulaires de droits concernés.</p>
          <p>L&apos;accès au site ou l&apos;achat d&apos;un contenu n&apos;emporte aucun transfert de propriété intellectuelle au profit de l&apos;utilisateur.</p>
          <p>Toute reproduction, représentation, adaptation ou exploitation non autorisée est susceptible de constituer une contrefaçon.</p>
        </LegalArticle>

        <LegalArticle id="obligations" title="9. Obligations de l'utilisateur">
          <p>
            L&apos;utilisateur s&apos;engage à utiliser le site de manière loyale, responsable et conforme aux lois et
            règlements applicables.
          </p>
          <p>Il lui est notamment interdit :</p>
          <LegalList items={[
            "de tenter d'accéder sans autorisation aux systèmes informatiques du site ;",
            'de contourner les dispositifs de sécurité ;',
            'de perturber volontairement le fonctionnement du site ;',
            'de procéder à une surcharge volontaire des serveurs ;',
            "d'utiliser des robots ou systèmes automatisés pour extraire les contenus ou données ;",
            "d'usurper l'identité d'une autre personne ;",
            'de fournir volontairement de fausses informations ;',
            'de diffuser des contenus illicites, haineux, discriminatoires, injurieux ou menaçants ;',
            "de porter atteinte aux droits de l'Académie ou de tiers.",
          ]} />
        </LegalArticle>

        <LegalArticle id="suspension" title="10. Suspension ou suppression d'un compte">
          <p>L&apos;utilisateur peut demander la suppression de son compte en contactant l&apos;Académie à l&apos;adresse : <ContactEmail /></p>
          <p>
            L&apos;Académie peut suspendre ou supprimer un compte en cas de violation des présentes CGU, notamment en cas
            de fraude, de partage d&apos;identifiants, de diffusion non autorisée de contenus ou d&apos;atteinte à la
            sécurité du site.
          </p>
          <p>Lorsque la situation le permet, l&apos;utilisateur est informé préalablement de la mesure envisagée.</p>
          <p>
            En cas de manquement grave ou de risque immédiat pour la sécurité du service ou les droits de l&apos;Académie
            ou de tiers, une suspension immédiate peut être mise en œuvre.
          </p>
          <p>
            La suppression d&apos;un compte peut entraîner la perte de l&apos;accès aux contenus associés au compte, sous
            réserve des droits impératifs dont bénéficie éventuellement l&apos;utilisateur et des conditions applicables
            aux contenus achetés prévues dans les CGV.
          </p>
        </LegalArticle>

        <LegalArticle id="disponibilite" title="11. Disponibilité du site">
          <p>L&apos;Académie met en œuvre des moyens raisonnables afin d&apos;assurer l&apos;accessibilité et le bon fonctionnement du site.</p>
          <p>Le site peut toutefois être temporairement inaccessible notamment en raison :</p>
          <LegalList items={[
            "d'opérations de maintenance ;",
            'de mises à jour ;',
            "d'incidents techniques ;",
            'de défaillances de prestataires ;',
            'de difficultés liées aux réseaux Internet ;',
            "d'un cas de force majeure.",
          ]} />
          <p>L&apos;Académie ne peut garantir une disponibilité permanente du site.</p>
        </LegalArticle>

        <LegalArticle id="responsabilite" title="12. Responsabilité">
          <p>L&apos;utilisateur est responsable de l&apos;utilisation qu&apos;il fait du site et des contenus auxquels il accède.</p>
          <p>
            L&apos;Académie ne saurait être responsable des dommages résultant notamment d&apos;une mauvaise utilisation
            du site, d&apos;une utilisation non conforme aux présentes CGU, d&apos;une indisponibilité temporaire
            indépendante de sa volonté ou d&apos;une défaillance d&apos;un équipement appartenant à l&apos;utilisateur.
          </p>
          <p>Les contenus proposés par l&apos;Académie ont notamment une vocation pédagogique et spirituelle.</p>
          <p>
            Ils ne constituent pas, sauf indication contraire, un conseil professionnel, juridique, médical, financier
            ou personnalisé.
          </p>
          <p>
            Aucune stipulation des présentes CGU ne saurait avoir pour objet ou pour effet de supprimer ou limiter une
            responsabilité qui ne peut légalement être exclue ou limitée.
          </p>
        </LegalArticle>

        <LegalArticle id="donnees" title="13. Données personnelles">
          <p>
            L&apos;Académie traite certaines données personnelles nécessaires notamment à la création et à la gestion
            des comptes, à la fourniture des services, au traitement des commandes et au fonctionnement du site.
          </p>
          <p>Les modalités de traitement des données personnelles sont détaillées dans la {politique} accessible sur le site.</p>
          <p>Cette politique précise notamment :</p>
          <LegalList items={[
            'les données collectées ;',
            'les finalités des traitements ;',
            'les bases légales ;',
            'les destinataires ;',
            'les durées de conservation ;',
            'les droits des personnes concernées ;',
            "les modalités d'exercice de ces droits.",
          ]} />
        </LegalArticle>

        <LegalArticle id="cookies" title="14. Cookies et technologies similaires">
          <p>
            Le site peut utiliser des cookies et technologies similaires nécessaires à son fonctionnement, notamment pour
            permettre l&apos;authentification et le maintien de la session de l&apos;utilisateur.
          </p>
          <p>
            Les éventuels cookies non strictement nécessaires sont utilisés conformément à la réglementation applicable
            et font, lorsque nécessaire, l&apos;objet d&apos;un consentement préalable.
          </p>
          <p>
            Les préférences d&apos;affichage pouvant être enregistrées localement dans le navigateur de l&apos;utilisateur
            ne sont utilisées qu&apos;aux fins prévues lors de leur mise en place.
          </p>
        </LegalArticle>

        <LegalArticle id="tiers" title="15. Services tiers">
          <p>Le site peut utiliser des services fournis par des prestataires tiers, notamment :</p>
          <LegalList items={[
            'Stripe pour le traitement des paiements ;',
            "YouTube, Vimeo ou d'autres prestataires pour la diffusion de certaines vidéos ;",
            "des prestataires techniques nécessaires à l'hébergement et au fonctionnement du site.",
          ]} />
          <p>
            L&apos;utilisation de ces services peut être soumise aux conditions contractuelles et politiques de
            confidentialité propres à ces prestataires.
          </p>
          <p>Les traitements de données associés sont détaillés dans la {politique} de l&apos;Académie.</p>
        </LegalArticle>

        <LegalArticle id="liens" title="16. Liens externes">
          <p>Le site peut contenir des liens vers des sites Internet exploités par des tiers.</p>
          <p>Ces liens sont proposés à titre informatif.</p>
          <p>
            L&apos;Académie ne contrôle pas nécessairement le contenu ou le fonctionnement de ces sites et ne peut être
            tenue responsable de leur contenu ou de leurs pratiques.
          </p>
        </LegalArticle>

        <LegalArticle id="modification" title="17. Modification des CGU">
          <p>
            L&apos;Académie peut modifier les présentes CGU afin notamment de tenir compte de l&apos;évolution de ses
            services, de ses fonctionnalités ou de la réglementation applicable.
          </p>
          <p>La version applicable est celle publiée sur le site à la date d&apos;utilisation du service.</p>
          <p>
            En cas de modification substantielle affectant les utilisateurs inscrits, l&apos;Académie pourra les informer
            par email ou lors de leur prochaine connexion, lorsque cela est approprié.
          </p>
        </LegalArticle>

        <LegalArticle id="droit" title="18. Droit applicable et règlement des litiges">
          <p>Les présentes CGU sont soumises au droit français.</p>
          <p>
            En cas de difficulté ou de réclamation, l&apos;utilisateur est invité à contacter en premier lieu
            l&apos;Académie : <ContactEmail />
          </p>
          <p>
            Lorsqu&apos;il agit en qualité de consommateur, l&apos;utilisateur bénéficie des dispositions impératives de
            protection qui lui sont applicables.
          </p>
          <p>
            Les conditions relatives à la médiation de la consommation sont précisées dans les{' '}
            <Link href="/cgv#mediation" className={legalLinkClass}>CGV</Link>.
          </p>
        </LegalArticle>
      </div>
    </div>
  );
}
