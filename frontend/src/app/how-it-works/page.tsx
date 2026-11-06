import type { Metadata } from 'next';
import { BookOpen, CreditCard, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Comment ça marche',
  description: "Créez votre compte, choisissez votre parcours et apprenez à votre rythme à l'Académie E.S.I.C.",
};

const etapes = [
  { icon: UserPlus,   titre: 'Créez votre compte',        desc: "Inscrivez-vous gratuitement en quelques secondes pour accéder à votre espace personnel." },
  { icon: BookOpen,   titre: 'Choisissez votre parcours', desc: 'Formations structurées ou masterclasses : suivez ce qui correspond à votre appel.' },
  { icon: CreditCard, titre: 'Apprenez à votre rythme',   desc: 'Paiement sécurisé, contenus acquis et suivi de votre progression depuis votre tableau de bord.' },
];

export default function HowItWorksPage() {
  return (
    <div>
      <PageHeader
        eyebrow="En trois étapes"
        title="Comment ça marche"
        lead="De la création du compte à votre premier enseignement, en trois étapes."
      />

      <section className="container-page py-20">
        <ol className="grid gap-6 md:grid-cols-3">
          {etapes.map(({ icon: Icon, titre, desc }, i) => (
            <li key={titre} className="card p-8">
              <div className="flex items-center justify-between">
                <span className="icon-tile"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                <span className="font-display text-sm font-medium text-brand-muted">Étape {i + 1}</span>
              </div>
              <h2 className="mt-8 font-display text-xl font-medium text-brand-forest">{titre}</h2>
              <p className="mt-3 text-base leading-relaxed text-brand-muted">{desc}</p>
            </li>
          ))}
        </ol>

      </section>
    </div>
  );
}
