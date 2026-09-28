import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';
import { ContactEmail, LegalArticle, LegalIdentity, LegalList, LegalToc, LegalValue, legalLinkClass } from '@/components/legal';
import { CONTACT_EMAIL } from '@/lib/contact';
import { LEGAL_INFO } from '@/lib/legalInfo';

export const metadata: Metadata = {
  title: 'Conditions générales de vente',
  description: "Conditions générales de vente des formations, masterclass et contenus numériques de l'Académie E.S.I.C.",
  alternates: { canonical: '/cgv' },
};

const ARTICLES = [
  { id: 'objet', title: '1. Objet' },
  { id: 'vendeur', title: '2. Identification du vendeur' },
  { id: 'produits', title: '3. Produits et services' },
  { id: 'prix', title: '4. Prix' },
  { id: 'commande', title: '5. Commande' },
  { id: 'paiement', title: '6. Paiement' },
  { id: 'confirmation', title: '7. Confirmation de commande' },
  { id: 'fourniture', title: '8. Fourniture des contenus numériques' },
  { id: 'duree', title: "9. Durée d'accès aux contenus" },
  { id: 'retractation', title: '10. Droit de rétractation' },
  { id: 'exercice-retractation', title: '11. Exercice du droit de rétractation' },
  { id: 'garanties', title: '12. Garanties légales' },
  { id: 'utilisation', title: '13. Utilisation des contenus achetés' },
  { id: 'compte', title: '14. Compte utilisateur' },
  { id: 'suppression', title: '15. Suppression du compte' },
  { id: 'reclamations', title: '16. Réclamations' },
  { id: 'mediation', title: '17. Médiation de la consommation' },
  { id: 'responsabilite', title: '18. Responsabilité' },
  { id: 'donnees', title: '19. Données personnelles' },
  { id: 'force-majeure', title: '20. Force majeure' },
  { id: 'modification', title: '21. Modification des CGV' },
  { id: 'droit', title: '22. Droit applicable' },
  { id: 'formulaire-retractation', title: 'Annexe — Formulaire type de rétractation' },
];

const politique = <Link href="/politique-de-confidentialite" className={legalLinkClass}>Politique de confidentialité</Link>;
const mentions = <Link href="/mentions-legales" className={legalLinkClass}>mentions légales</Link>;

export default function CgvPage() {
  const L = LEGAL_INFO;
  const M = L.mediateur;
  return (
    <div className="pb-8">
      <PageHeader
        title="Conditions générales de vente"
        lead={<>Dernière mise à jour : <LegalValue value={L.dateCgv} label="date" /></>}
      />

      <div className="card mx-auto mt-10 max-w-3xl space-y-10 p-8 text-[length:calc(15px*var(--text-scale,1))] leading-relaxed text-brand-muted sm:p-12">
        <LegalToc label="Sommaire des conditions générales de vente" articles={ARTICLES} />

        <LegalArticle id="objet" title="1. Objet">
          <p>
            Les présentes Conditions Générales de Vente (« CGV ») régissent les ventes réalisées par l&apos;Académie
            E.S.I.C. auprès des utilisateurs et consommateurs souhaitant acheter des formations, masterclass ou autres
            contenus numériques proposés sur <strong>academie-esic.fr</strong>.
          </p>
          <p>Elles s&apos;appliquent à toute commande effectuée sur le site.</p>
          <p>Avant toute commande, le client est invité à prendre connaissance des présentes CGV et à les accepter.</p>
          <p>Les CGV applicables sont celles en vigueur au moment de la commande.</p>
        </LegalArticle>

        <LegalArticle id="vendeur" title="2. Identification du vendeur">
          <LegalIdentity rows={[
            { label: 'Dénomination', value: L.nom },
            { label: 'Forme juridique', value: <LegalValue value={L.formeJuridique} label="forme juridique" /> },
            { label: 'Siège social', value: <LegalValue value={L.siege} label="adresse complète" /> },
            { label: 'SIREN / SIRET', value: <LegalValue value={L.siren} label="numéro" /> },
            { label: 'TVA intracommunautaire', value: <LegalValue value={L.tva} label="le cas échéant" /> },
            { label: 'Email', value: <ContactEmail /> },
            { label: 'Téléphone', value: <LegalValue value={L.telephone} label="numéro" /> },
          ]} />
          <p>Les informations concernant l&apos;hébergement et la publication du site figurent dans les {mentions}.</p>
        </LegalArticle>

        <LegalArticle id="produits" title="3. Produits et services">
          <p>L&apos;Académie propose à la vente différents contenus pédagogiques, notamment :</p>
          <LegalList items={[
            'des formations ;',
            'des masterclass ;',
            'des vidéos ;',
            'des documents PDF ;',
            'des packs comprenant plusieurs formats ;',
            "tout autre contenu numérique présenté comme disponible à l'achat sur le site.",
          ]} />
          <p>Chaque fiche produit présente les caractéristiques essentielles du contenu proposé, son prix et ses modalités d&apos;accès.</p>
          <p>
            Conformément aux règles applicables aux contrats conclus à distance, les informations essentielles relatives
            au contenu, au prix et à la fourniture du contenu sont communiquées au consommateur avant la conclusion du
            contrat.
          </p>
        </LegalArticle>

        <LegalArticle id="prix" title="4. Prix">
          <p>Les prix sont indiqués en euros.</p>
          <p>Le prix applicable est celui affiché sur le site au moment de la validation de la commande.</p>
          <p>Lorsque la TVA est applicable, les prix sont indiqués toutes taxes comprises.</p>
          <p>L&apos;Académie se réserve le droit de modifier ses prix à tout moment.</p>
          <p>Toutefois, une modification de prix ne s&apos;applique pas à une commande déjà validée.</p>
          <p>Les éventuelles offres promotionnelles sont valables pendant la période indiquée et selon les conditions précisées sur le site.</p>
        </LegalArticle>

        <LegalArticle id="commande" title="5. Commande">
          <p>
            Les contenus sont achetés à l&apos;unité, directement depuis leur fiche sur le site : chaque commande porte
            sur un seul contenu.
          </p>
          <p>Pour effectuer une commande, le client :</p>
          <LegalList items={[
            'se connecte à son compte personnel ou en crée un ;',
            'sélectionne, sur la fiche du contenu, la formation ou la masterclass souhaitée et, le cas échéant, son format (vidéo, PDF ou pack) ;',
            'prend connaissance des présentes CGV ;',
            'accepte les CGV ;',
            "pour obtenir un accès immédiat au contenu, exprime son consentement dans les conditions prévues à l'article 10 ;",
            'est redirigé vers la page de paiement sécurisée, qui récapitule le contenu choisi et son prix ;',
            'vérifie les informations relatives à sa commande ;',
            'procède au paiement ;',
            'reçoit la confirmation de sa commande.',
          ]} />
          <p>
            Avant la validation définitive, le client peut vérifier le récapitulatif de sa commande et corriger les
            éventuelles erreurs en quittant la page de paiement pour revenir à la fiche du contenu et modifier son choix.
            Tant que le paiement n&apos;est pas validé, aucune commande n&apos;est enregistrée.
          </p>
          <p>La validation de la commande implique l&apos;obligation de paiement.</p>
        </LegalArticle>

        <LegalArticle id="paiement" title="6. Paiement">
          <p>Le paiement est effectué en ligne par l&apos;intermédiaire du prestataire de paiement Stripe.</p>
          <p>
            L&apos;Académie ne collecte ni ne conserve les données bancaires complètes saisies lors du paiement lorsque
            celles-ci sont directement traitées par Stripe.
          </p>
          <p>Le paiement est confirmé après validation par le prestataire de paiement.</p>
          <p>
            En cas de refus ou d&apos;échec du paiement, la commande ne pourra pas être finalisée tant que le paiement
            n&apos;aura pas été validé.
          </p>
        </LegalArticle>

        <LegalArticle id="confirmation" title="7. Confirmation de commande">
          <p>Après validation du paiement, le client reçoit une confirmation de commande à l&apos;adresse email associée à son compte.</p>
          <p>Cette confirmation récapitule notamment :</p>
          <LegalList items={[
            'le contenu acheté ;',
            'le prix payé ;',
            'la date de la commande ;',
            'les informations essentielles relatives à la commande ;',
            'les conditions applicables.',
          ]} />
          <p>
            Pour les contrats conclus à distance, les informations contractuelles sont confirmées sur un support durable
            dans les conditions prévues par la réglementation applicable.
          </p>
        </LegalArticle>

        <LegalArticle id="fourniture" title="8. Fourniture des contenus numériques">
          <p>Les contenus numériques sont fournis par voie électronique.</p>
          <p>
            Sauf indication contraire sur la fiche du produit, l&apos;accès aux contenus achetés est rendu disponible
            depuis l&apos;espace personnel du client après confirmation du paiement.
          </p>
          <p>Lorsque le contenu est disponible immédiatement, l&apos;accès peut être ouvert dès la confirmation du paiement.</p>
          <p>Le client doit disposer d&apos;un équipement compatible et d&apos;une connexion Internet permettant l&apos;accès aux contenus.</p>
          <p>
            Les éventuelles exigences techniques particulières sont indiquées sur la fiche du contenu concerné
            lorsqu&apos;elles sont nécessaires.
          </p>
        </LegalArticle>

        <LegalArticle id="duree" title="9. Durée d'accès aux contenus">
          <p>Sauf indication contraire lors de la commande, l&apos;achat donne accès au contenu selon les modalités indiquées sur la fiche du produit.</p>
          <p>
            Lorsqu&apos;aucune durée déterminée n&apos;est annoncée, l&apos;Académie s&apos;efforce de maintenir
            l&apos;accès au contenu acheté pendant la durée d&apos;exploitation normale du service.
          </p>
          <p>
            L&apos;Académie ne peut toutefois garantir la disponibilité perpétuelle d&apos;un contenu lorsque son retrait
            devient nécessaire pour un motif légitime, notamment en raison d&apos;une obligation légale, d&apos;une
            décision judiciaire ou de la perte des droits nécessaires à sa diffusion.
          </p>
          <p>Lorsque cela est possible, l&apos;Académie informe les utilisateurs concernés dans un délai raisonnable.</p>
        </LegalArticle>

        <LegalArticle id="retractation" title="10. Droit de rétractation">
          <h3 className="font-display font-semibold text-brand-forest">10.1 Principe</h3>
          <p>
            Conformément à la réglementation applicable aux contrats conclus à distance, le consommateur dispose en
            principe d&apos;un délai de quatorze jours pour exercer son droit de rétractation à compter de la conclusion
            du contrat, lorsque ce droit s&apos;applique.
          </p>
          <p>
            Le consommateur peut exercer son droit de rétractation sans avoir à justifier sa décision et sans supporter
            d&apos;autres frais que ceux prévus par la loi.
          </p>
          <h3 className="pt-2 font-display font-semibold text-brand-forest">10.2 Contenus numériques fournis immédiatement</h3>
          <p>Les formations et masterclass proposées par l&apos;Académie peuvent constituer des contenus numériques fournis sans support matériel.</p>
          <p>
            Lorsque le client demande à accéder immédiatement à un tel contenu avant l&apos;expiration du délai de
            rétractation, l&apos;Académie recueille préalablement :
          </p>
          <LegalList items={[
            "son consentement exprès à l'exécution immédiate du contrat ;",
            "sa reconnaissance du fait qu'il perd son droit de rétractation lorsque les conditions légales sont remplies.",
          ]} />
          <p>Cette procédure correspond au régime prévu pour la fourniture immédiate de contenus numériques sans support matériel.</p>
          <p>La confirmation de cet accord est ensuite fournie au client sur un support durable conformément aux règles applicables.</p>
          <h3 className="pt-2 font-display font-semibold text-brand-forest">10.3 Recueil du consentement lors du paiement</h3>
          <p>
            Pour les contenus concernés, ce consentement est recueilli au moyen d&apos;une case distincte de
            l&apos;acceptation des CGV, qui n&apos;est jamais précochée, formulée ainsi :
          </p>
          <blockquote className="rounded-2xl border-l-4 border-brand-emerald bg-brand-mint p-4 italic dark:bg-white/5">
            « Je demande expressément l&apos;accès immédiat au contenu numérique avant l&apos;expiration du délai de
            rétractation et reconnais qu&apos;en conséquence je perdrai mon droit de rétractation. »
          </blockquote>
        </LegalArticle>

        <LegalArticle id="exercice-retractation" title="11. Exercice du droit de rétractation">
          <p>Lorsque le droit de rétractation est applicable, le client peut exercer celui-ci en adressant une demande claire à : <ContactEmail /></p>
          <p>
            Il peut également utiliser le{' '}
            <a href="#formulaire-retractation" className={legalLinkClass}>formulaire type de rétractation</a>{' '}
            reproduit en annexe des présentes CGV.
          </p>
          <p>
            Lorsque le droit de rétractation est valablement exercé, l&apos;Académie procède au remboursement dans les
            conditions prévues par la réglementation applicable.
          </p>
          <p>
            Pour les contenus numériques dont la fourniture a commencé immédiatement après consentement exprès du client
            et reconnaissance de la perte du droit de rétractation, le droit de rétractation ne s&apos;applique plus
            lorsque les conditions légales sont réunies.
          </p>
        </LegalArticle>

        <LegalArticle id="garanties" title="12. Garanties légales">
          <p>
            Lorsque les dispositions relatives aux garanties légales sont applicables au contenu ou au service fourni,
            le consommateur bénéficie des garanties prévues par la réglementation française.
          </p>
          <p>
            Aucune clause des présentes CGV ne peut avoir pour objet de supprimer ou de limiter les droits dont le
            consommateur bénéficie au titre des garanties légales.
          </p>
        </LegalArticle>

        <LegalArticle id="utilisation" title="13. Utilisation des contenus achetés">
          <p>
            L&apos;achat d&apos;une formation ou d&apos;une masterclass confère uniquement un droit d&apos;accès
            personnel au contenu selon les conditions prévues lors de la commande.
          </p>
          <p>Le client ne peut notamment pas :</p>
          <LegalList items={[
            'partager son compte ;',
            'communiquer ses identifiants ;',
            'revendre son accès ;',
            'diffuser les vidéos ;',
            'partager les PDF ;',
            'enregistrer ou capturer les contenus ;',
            'mettre les contenus à disposition de tiers ;',
            'exploiter commercialement les contenus.',
          ]} />
          <p>Les contenus restent protégés par les règles relatives à la propriété intellectuelle.</p>
        </LegalArticle>

        <LegalArticle id="compte" title="14. Compte utilisateur">
          <p>L&apos;accès aux contenus achetés peut nécessiter un compte personnel.</p>
          <p>Le client est responsable de la confidentialité de ses identifiants.</p>
          <p>
            L&apos;Académie peut prendre des mesures de suspension ou de restriction d&apos;accès en cas de fraude, de
            partage de compte ou de diffusion illicite des contenus.
          </p>
          <p>Ces mesures ne privent pas le consommateur des droits impératifs qui lui sont reconnus par la loi.</p>
        </LegalArticle>

        <LegalArticle id="suppression" title="15. Suppression du compte">
          <p>Le client peut demander la suppression de son compte en contactant l&apos;Académie à : <ContactEmail /></p>
          <p>
            La suppression du compte peut entraîner la suppression de l&apos;accès aux contenus associés au compte, sous
            réserve des droits légaux applicables et des engagements spécifiques pris par l&apos;Académie lors de la
            vente.
          </p>
          <p>
            Les informations nécessaires au respect des obligations légales, notamment comptables, peuvent être
            conservées pendant les durées prévues par la réglementation.
          </p>
        </LegalArticle>

        <LegalArticle id="reclamations" title="16. Réclamations">
          <p>
            Pour toute question, difficulté technique ou réclamation relative à une commande, le client peut contacter
            l&apos;Académie par email : <ContactEmail />
          </p>
          <p>L&apos;Académie s&apos;efforce de répondre aux réclamations dans les meilleurs délais.</p>
          <p>Le client est invité à effectuer une réclamation préalable auprès de l&apos;Académie avant toute démarche de médiation.</p>
        </LegalArticle>

        <LegalArticle id="mediation" title="17. Médiation de la consommation">
          <p>
            Conformément aux dispositions applicables, le consommateur peut, après avoir adressé une réclamation écrite
            à l&apos;Académie et en cas de réponse insatisfaisante ou d&apos;absence de réponse dans le délai applicable,
            recourir gratuitement au médiateur de la consommation dont relève l&apos;Académie.
          </p>
          <LegalIdentity rows={[
            { label: 'Médiateur de la consommation', value: <LegalValue value={M.nom} label="nom du médiateur" /> },
            { label: 'Adresse', value: <LegalValue value={M.adresse} label="adresse" /> },
            {
              label: 'Site Internet',
              value: M.url
                ? <a href={M.url} target="_blank" rel="noopener noreferrer" className={legalLinkClass}>{M.url}<span className="sr-only"> (nouvelle fenêtre)</span></a>
                : <LegalValue value={null} label="site du médiateur" />,
            },
          ]} />
        </LegalArticle>

        <LegalArticle id="responsabilite" title="18. Responsabilité">
          <p>L&apos;Académie met en œuvre des moyens raisonnables afin d&apos;assurer la fourniture des contenus et le fonctionnement du site.</p>
          <p>
            Elle ne peut être tenue responsable d&apos;une interruption résultant notamment d&apos;une défaillance des
            réseaux, d&apos;un cas de force majeure, d&apos;une maintenance ou d&apos;une défaillance d&apos;un
            prestataire extérieur.
          </p>
          <p>Aucune disposition des présentes CGV ne limite les droits ou garanties dont le consommateur bénéficie impérativement en vertu de la loi.</p>
        </LegalArticle>

        <LegalArticle id="donnees" title="19. Données personnelles">
          <p>Les données personnelles collectées lors d&apos;une commande sont traitées conformément à la {politique} de l&apos;Académie.</p>
          <p>Les données peuvent notamment être nécessaires pour :</p>
          <LegalList items={[
            'créer et gérer le compte ;',
            'traiter la commande ;',
            'effectuer le paiement ;',
            "fournir l'accès aux contenus ;",
            'assurer le service client ;',
            'respecter les obligations légales et comptables.',
          ]} />
          <p>Les modalités détaillées des traitements sont présentées dans la {politique}.</p>
        </LegalArticle>

        <LegalArticle id="force-majeure" title="20. Force majeure">
          <p>
            L&apos;Académie ne pourra être tenue responsable d&apos;un retard ou d&apos;une impossibilité d&apos;exécution
            résultant d&apos;un événement répondant aux conditions de la force majeure prévues par le droit français.
          </p>
        </LegalArticle>

        <LegalArticle id="modification" title="21. Modification des CGV">
          <p>L&apos;Académie peut modifier les présentes CGV pour tenir compte notamment de l&apos;évolution de ses services ou de la réglementation.</p>
          <p>Les CGV applicables à une commande sont celles acceptées par le client au moment de cette commande.</p>
          <p>
            Les modifications ultérieures ne remettent pas en cause les commandes déjà conclues, sauf lorsque la loi ou
            la nature du contrat impose le contraire.
          </p>
        </LegalArticle>

        <LegalArticle id="droit" title="22. Droit applicable">
          <p>Les présentes CGV sont soumises au droit français.</p>
          <p>En cas de litige, le consommateur est invité à contacter préalablement l&apos;Académie afin de rechercher une solution amiable.</p>
          <p>
            À défaut de résolution amiable, le consommateur peut exercer les recours dont il dispose devant les
            juridictions compétentes conformément aux règles de droit commun.
          </p>
        </LegalArticle>

        <LegalArticle id="formulaire-retractation" title="Annexe — Formulaire type de rétractation">
          <p className="italic">À utiliser uniquement lorsque le droit de rétractation est applicable.</p>
          <div className="space-y-3 rounded-2xl border border-brand-forest/15 p-5 dark:border-white/15">
            <p>
              À l&apos;attention de :<br />
              {L.nom}<br />
              <LegalValue value={L.siege} label="adresse complète" /><br />
              Email : {CONTACT_EMAIL}
            </p>
            <p>Je vous notifie par la présente ma rétractation du contrat portant sur la fourniture du contenu / service ci-dessous :</p>
            <p>Contenu concerné : ……………………………………… (nom de la formation / masterclass)</p>
            <p>Commandé le : ………………………</p>
            <p>Nom et prénom du consommateur : ………………………………………</p>
            <p>Adresse email utilisée pour la commande : ………………………………………</p>
            <p>Date : ………………………</p>
            <p>Signature du consommateur (uniquement en cas d&apos;envoi papier) : ………………………</p>
          </div>
        </LegalArticle>
      </div>
    </div>
  );
}
