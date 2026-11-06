import type { ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * En-tête commun des pages intérieures : titre et introduction alignés à gauche, sur le fond de la page,
 * séparés du contenu par un filet fin.
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
    <section className="border-b border-brand-forest/10 dark:border-white/10">
      <div className="container-page py-14 sm:py-20">
        <div className="max-w-3xl">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className={`${eyebrow ? 'mt-3' : ''} font-display text-4xl font-medium leading-[1.1] tracking-[-0.03em] text-brand-forest sm:text-5xl lg:text-6xl`}>{title}</h1>
          {lead && <p className="mt-5 max-w-2xl text-base leading-relaxed text-brand-muted sm:text-lg">{lead}</p>}
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
      <p className="mt-5 font-display text-lg font-medium text-brand-forest">{title}</p>
      {children && <div className="mt-2 text-base text-brand-muted">{children}</div>}
    </div>
  );
}
