import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, CreditCard, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Comment ça marche',
  description: "Créez votre compte, choisissez votre parcours et apprenez à votre rythme à l'Académie E.S.I.C.",
};

const etapes = [
  { icon: UserPlus,   titre: 'Créez votre compte',        desc: "Inscrivez-vous gratuitement en quelques secondes pour accéder à votre espace personnel." },
  { icon: BookOpen,   titre: 'Choisissez votre parcours', desc: 'Formations structurées ou masterclasses : suivez ce qui correspond à votre appel.' },
  { icon: CreditCard, titre: 'Apprenez à votre rythme',   desc: 'Paiement sécurisé, accès à vie aux contenus acquis et suivi depuis votre tableau de bord.' },
];

export default function HowItWorksPage() {
  return (
    <div className="overflow-x-hidden">
      <PageHeader
        eyebrow="En trois étapes"
        title="Comment ça marche"
        lead="De l'inscription à votre premier enseignement, tout est pensé pour vous permettre de grandir sereinement."
      />

      <section className="container-page py-20">
        <ol className="grid gap-6 md:grid-cols-3">
          {etapes.map(({ icon: Icon, titre, desc }, i) => (
            <li key={titre} className="card-hover relative p-8">
              <span className="absolute right-6 top-6 font-display text-5xl font-semibold text-brand-sage dark:text-white/10" aria-hidden="true">{i + 1}</span>
              <span className="icon-tile"><Icon className="h-6 w-6" aria-hidden="true" /></span>
              <h2 className="mt-6 font-display text-lg font-semibold text-brand-forest">{titre}</h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">{desc}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 text-center">
          <Link href="/register" className="btn-primary">
            Créer mon compte
            <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
          </Link>
        </div>
      </section>
    </div>
  );
}
