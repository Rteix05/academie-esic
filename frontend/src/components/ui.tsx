import type { ReactNode } from 'react';
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

/**
 * En-tête commun des pages intérieures : panneau arrondi vert pâle
 * (même langage visuel que le hero de l'accueil).
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="container-page pt-4">
      <div className="relative overflow-hidden rounded-5xl bg-brand-mint px-6 py-16 text-center sm:px-12 sm:py-20 dark:bg-[#10231a]">
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-brand-sage/60 dark:bg-emerald-400/5" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 right-10 h-28 w-28 rounded-full border-[14px] border-brand-sage/70 dark:border-emerald-400/10" />
        <div className="relative mx-auto max-w-3xl">
          {eyebrow && (
            <span className="eyebrow bg-white dark:bg-white/5">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {eyebrow}
            </span>
          )}
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-brand-forest sm:text-5xl">{title}</h1>
          {lead && <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-brand-muted sm:text-lg">{lead}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}

export function Spinner({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="flex justify-center py-24" role="status">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-sage border-t-brand-emerald" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card mx-auto max-w-md p-10 text-center" role="alert">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="mt-4 font-medium text-red-600">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary-plain mt-6">
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Réessayer
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="card mx-auto max-w-lg p-12 text-center">
      <span className="icon-tile mx-auto" aria-hidden="true">{icon}</span>
      <p className="mt-5 font-display text-lg font-semibold text-brand-forest">{title}</p>
      {children && <div className="mt-2 text-sm text-brand-muted">{children}</div>}
    </div>
  );
}
