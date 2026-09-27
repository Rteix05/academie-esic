import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, GraduationCap, Quote, ShieldCheck, Users } from 'lucide-react';
import Logo from './Logo';

/**
 * Gabarit des pages d'authentification (sans barre de navigation ni pied de page) :
 * panneau illustré à gauche, formulaire à droite.
 */
export default function AuthShell({ title, subtitle, children, footer }: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-cream p-4 sm:p-6 dark:bg-[#0a1810]">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-2">
        {/* Panneau illustré */}
        <aside className="relative hidden overflow-hidden rounded-5xl bg-brand-forest p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/5" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-brand-emerald/20" />

          <div className="relative"><Logo inverted /></div>

          <div className="relative">
            <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
              <div aria-hidden="true" className="absolute inset-0 rounded-full bg-white/5" />
              <div aria-hidden="true" className="absolute inset-8 rounded-full bg-white/10" />
              <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-brand-emerald shadow-float">
                <BookOpen className="h-11 w-11" aria-hidden="true" />
              </span>
              <span className="absolute -left-4 top-8 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 font-display text-xs font-semibold text-brand-forest shadow-float animate-float">
                <GraduationCap className="h-4 w-4 text-brand-emerald" aria-hidden="true" /> Formations
              </span>
              <span className="absolute -right-6 bottom-8 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 font-display text-xs font-semibold text-brand-forest shadow-float [animation-delay:2s] animate-float">
                <Users className="h-4 w-4 text-brand-emerald" aria-hidden="true" /> Communauté
              </span>
            </div>

            <figure className="mt-12">
              <Quote className="h-7 w-7 text-emerald-300" aria-hidden="true" />
              <blockquote className="mt-3 font-display text-xl font-medium leading-snug">
                « Afin que l&apos;homme de Dieu soit accompli et propre à toute bonne œuvre. »
              </blockquote>
              <figcaption className="mt-3 text-sm font-semibold text-emerald-300">2 Timothée 3:17</figcaption>
            </figure>
          </div>

          <p className="relative flex items-center gap-2 text-sm text-emerald-100/70">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Vos données sont protégées et ne sont jamais revendues.
          </p>
        </aside>

        {/* Formulaire */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between py-2">
            <div className="lg:hidden"><Logo /></div>
            <Link href="/" className="btn-ghost ml-auto text-brand-muted">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Accueil
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-md">
              <h1 className="font-display text-3xl font-semibold text-brand-forest sm:text-4xl">{title}</h1>
              {subtitle && <p className="mt-3 text-brand-muted">{subtitle}</p>}
              <div className="mt-8">{children}</div>
              {footer && <div className="mt-8 text-center text-sm text-brand-muted">{footer}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Message d'erreur / de succès des formulaires */
export function FormMessage({ tone, children }: { tone: 'error' | 'success'; children: ReactNode }) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={`mb-6 rounded-2xl px-5 py-4 text-sm font-medium ${tone === 'error' ? 'bg-red-50 text-red-700' : 'bg-brand-sage text-brand-forest'}`}
    >
      {children}
    </p>
  );
}
