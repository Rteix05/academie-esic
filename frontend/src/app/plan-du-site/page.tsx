import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';
import { SITE_SECTIONS } from '@/lib/siteMap';

export const metadata: Metadata = {
  title: 'Plan du site',
  description: "Toutes les pages du site de l'Académie E.S.I.C.",
  alternates: { canonical: '/plan-du-site' },
};

export default function PlanDuSitePage() {
  return (
    <div className="pb-8">
      <PageHeader title="Plan du site" lead="L'ensemble des pages du site, regroupées par rubrique." />

      <div className="container-page mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SITE_SECTIONS.map((section, i) => (
          <section key={section.title} className="card p-7" aria-labelledby={`plan-${i}`}>
            <h2 id={`plan-${i}`} className="font-display text-lg font-semibold text-brand-forest">{section.title}</h2>
            <ul className="mt-4 space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-brand-ink underline decoration-brand-emerald/40 underline-offset-4 transition hover:text-brand-emerald hover:decoration-brand-emerald dark:text-gray-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
