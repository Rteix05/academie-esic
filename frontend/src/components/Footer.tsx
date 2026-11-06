import Link from 'next/link';
import Logo from './Logo';
import FooterClose from './FooterClose';
import { SITE_SECTIONS } from '@/lib/siteMap';

// Colonnes du pied de page : rubriques du plan du site (hors « Informations », en bas de page)
const COLUMNS = SITE_SECTIONS.filter((section) => section.title !== 'Informations');

const LEGAL = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/cgu', label: 'CGU' },
  { href: '/cgv', label: 'CGV' },
  { href: '/politique-de-confidentialite', label: 'Confidentialité' },
  { href: '/accessibilite', label: 'Accessibilité : non conforme' },
  { href: '/plan-du-site', label: 'Plan du site' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto" aria-label="Pied de page">
      {/* Dernier appel à l'action, sur le fond de la page */}
      <FooterClose />

      {/* Plan du site et mentions, sur le bandeau de la marque */}
      <div className="bg-brand-forest text-emerald-50">
        <div className="container-page">
          <div className="grid grid-cols-2 gap-10 py-16 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
            <div className="col-span-2 md:col-span-1">
              <Logo inverted />
              <p className="mt-6 max-w-xs text-base leading-relaxed text-emerald-100/85">
                Centre de formation chrétienne : école biblique, parcours théologique personnalisé et mentorat ministériel.
              </p>
              <p className="mt-4 text-sm italic text-emerald-200/80">
                « Afin que l&apos;homme de Dieu soit accompli » — 2 Tm 3:17
              </p>
            </div>

            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h2 className="font-display text-base font-medium text-white">{column.title}</h2>
                <ul className="mt-5 space-y-3 text-base text-emerald-100/85">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="underline-offset-4 transition-colors hover:text-white hover:underline">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-sm text-emerald-100/85 lg:flex-row lg:items-center lg:justify-between">
            <p>
              © {year} Académie E.S.I.C.
              <span className="mx-2" aria-hidden="true">·</span>
              <span>Version {process.env.APP_VERSION}</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <Link href="/credits-photos" className="underline-offset-4 hover:text-white hover:underline">Photographies via Wikimedia Commons</Link>
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="underline-offset-4 transition-colors hover:text-white hover:underline">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
