import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Accessibilité',
  description: "Déclaration d'accessibilité du site de l'Académie E.S.I.C. (RGAA 4.1).",
  alternates: { canonical: '/accessibilite' },
};

const linkClass = 'font-medium text-brand-forest underline underline-offset-4 hover:text-brand-emerald dark:text-emerald-200';

export default function AccessibilitePage() {
  return (
    <div className="pb-8">
      <PageHeader title="Déclaration d'accessibilité" lead="Dernière mise à jour : septembre 2026" />

      <div className="card mx-auto mt-10 max-w-3xl space-y-10 p-8 text-[length:calc(15px*var(--text-scale,1))] leading-relaxed text-brand-muted sm:p-12">
        <section>
          <p>
            L&apos;Académie E.S.I.C. s&apos;engage à rendre son site internet accessible, conformément au
            Référentiel général d&apos;amélioration de l&apos;accessibilité (RGAA) version 4.1.
            Cette déclaration s&apos;applique au site <strong>academie-esic.fr</strong>.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">État de conformité</h2>
          <p>
            Le site <strong>academie-esic.fr</strong> est <strong>non conforme</strong> avec le RGAA 4.1 :
            aucun audit de conformité n&apos;a encore été réalisé. Le site a toutefois été conçu et vérifié
            en suivant les critères du référentiel (voir ci-dessous) ; un audit complet est prévu.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">Mesures mises en œuvre</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Lien d&apos;évitement vers le contenu principal, structure de titres et zones de navigation balisées.</li>
            <li>Deux systèmes de navigation : menu principal et plan du site.</li>
            <li>
              Réglages d&apos;affichage (bouton « Réglages d&apos;affichage » en haut de page, ou rubrique « Affichage » du menu sur mobile) :
              taille du texte de 90 % à 200 %, liens en gras, texte en gras. Ces choix sont mémorisés dans votre navigateur.
            </li>
            <li>Navigation complète au clavier, focus visible, menu mobile utilisable au clavier et au lecteur d&apos;écran.</li>
            <li>Contrastes de couleurs conformes au niveau AA, en mode clair comme en mode sombre.</li>
            <li>Formulaires : étiquettes associées aux champs, champs obligatoires signalés, messages d&apos;erreur restitués.</li>
            <li>Mise en page adaptée du mobile au bureau, sans défilement horizontal, et respect de la préférence « réduire les animations ».</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">Contenus non accessibles</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Les vidéos des masterclass sont hébergées sur des services tiers (YouTube, Vimeo…) : leurs lecteurs et l&apos;éventuelle absence de sous-titres ou de transcription relèvent de ces services et des contenus publiés.</li>
            <li>Les documents PDF téléchargeables peuvent ne pas être balisés pour l&apos;accessibilité.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">Technologies utilisées</h2>
          <p>HTML5, CSS, JavaScript (React / Next.js), WAI-ARIA.</p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">Retour d&apos;information et contact</h2>
          <p>
            Si vous n&apos;arrivez pas à accéder à un contenu ou à un service, vous pouvez nous contacter pour être
            orienté vers une alternative accessible ou obtenir le contenu sous une autre forme :{' '}
            <a href="mailto:contact@academie-esic.fr" className={linkClass}>contact@academie-esic.fr</a>.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-brand-forest">Voies de recours</h2>
          <p>
            Si vous avez signalé un défaut d&apos;accessibilité qui vous empêche d&apos;accéder à un contenu ou à un
            service et que vous n&apos;avez pas obtenu de réponse satisfaisante, vous pouvez :
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              écrire un message au{' '}
              <a href="https://formulaire.defenseurdesdroits.fr/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                Défenseur des droits<span className="sr-only"> (nouvelle fenêtre)</span>
              </a> ;
            </li>
            <li>
              contacter le délégué du Défenseur des droits de votre région ;
            </li>
            <li>
              envoyer un courrier (gratuit, sans affranchissement) : Défenseur des droits, Libre réponse 71120,
              75342 Paris CEDEX 07.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
