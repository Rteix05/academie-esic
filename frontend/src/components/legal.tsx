import type { ReactNode } from 'react';
import { CONTACT_EMAIL } from '@/lib/contact';

/** Mise en forme commune des pages juridiques (CGU, CGV) */

export const legalLinkClass = 'font-medium text-brand-forest underline underline-offset-4 hover:text-brand-emerald dark:text-emerald-200';

export function LegalArticle({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-28">
      <h2 id={id} className="mb-3 font-display text-lg font-semibold text-brand-forest">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

/** Sommaire cliquable des articles */
export function LegalToc({ label, articles }: { label: string; articles: { id: string; title: string }[] }) {
  return (
    <nav aria-label={label}>
      <p className="font-display text-sm font-semibold text-brand-forest">Sommaire</p>
      <ol className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {articles.map((a) => (
          <li key={a.id}><a href={`#${a.id}`} className={legalLinkClass}>{a.title}</a></li>
        ))}
      </ol>
    </nav>
  );
}

/** Valeur légale connue, ou repère visible « À compléter » tant qu'elle ne l'est pas */
export function LegalValue({ value, label }: { value: string | null; label: string }) {
  if (value) return <>{value}</>;
  return (
    <mark className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-900 dark:bg-amber-400/15 dark:text-amber-200">
      [À compléter : {label}]
    </mark>
  );
}

export function ContactEmail() {
  return <a href={`mailto:${CONTACT_EMAIL}`} className={legalLinkClass}>{CONTACT_EMAIL}</a>;
}

/** Bloc d'identification de l'Académie (lignes « Libellé : valeur ») */
export function LegalIdentity({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="space-y-1 rounded-2xl bg-brand-mint p-5 dark:bg-white/5">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-wrap gap-x-2">
          <dt className="font-medium text-brand-forest dark:text-emerald-100">{row.label} :</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
