import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import Logo from './Logo';

const COLUMNS = [
  {
    title: 'Académie',
    links: [
      { href: '/histoire', label: 'À propos' },
      { href: '/temoignages', label: 'Témoignages' },
      { href: '/actualites', label: 'Actualités' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Apprendre',
    links: [
      { href: '/formations', label: 'Formations' },
      { href: '/masterclass', label: 'Masterclass' },
      { href: '/evenements', label: 'Événements' },
    ],
  },
  {
    title: 'Mon compte',
    links: [
      { href: '/login', label: 'Connexion' },
      { href: '/register', label: 'Inscription' },
      { href: '/dashboard', label: 'Mon espace' },
      { href: '/dashboard/profil', label: 'Mon profil' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto pt-24">
      <div className="container-page">
        {/* Bandeau d'appel à l'action, à cheval sur le pied de page */}
        <div className="relative z-10 -mb-20 overflow-hidden rounded-4xl bg-brand-emerald px-8 py-10 shadow-float sm:px-12 md:flex md:items-center md:justify-between md:gap-10">
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 right-40 h-40 w-40 rounded-full bg-white/10" />
          <div className="relative">
            <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              Prêt à grandir dans votre marche avec Dieu ?
            </h2>
            <p className="mt-2 max-w-xl text-sm text-emerald-50/90">
              Rejoignez une communauté d&apos;étudiants engagés et commencez votre parcours dès aujourd&apos;hui.
            </p>
          </div>
          <div className="relative mt-6 flex flex-wrap gap-3 md:mt-0 md:shrink-0">
            <Link href="/register" className="btn bg-white py-3 pl-6 pr-2 text-brand-forest shadow-soft hover:-translate-y-0.5">
              S&apos;inscrire
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-emerald text-white"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </Link>
            <Link href="/contact" className="btn border border-white/40 px-6 py-3 text-white hover:bg-white/10">
              Nous contacter
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-t-5xl bg-brand-forest pt-32 text-emerald-50">
        <div className="container-page">
          <div className="grid grid-cols-2 gap-10 pb-14 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
            <div className="col-span-2 md:col-span-1">
              <Logo inverted />
              <p className="mt-6 max-w-xs text-sm leading-relaxed text-emerald-100/70">
                Un centre de formation chrétienne dédié à l&apos;édification des disciples et à la préparation des serviteurs de Dieu.
              </p>
              <p className="mt-5 text-sm italic text-emerald-200/80">
                « Afin que l&apos;homme de Dieu soit accompli » — 2 Tm 3:17
              </p>
              <Link href="/contact" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20">
                <Mail className="h-4 w-4" aria-hidden="true" /> Écrivez-nous
              </Link>
            </div>

            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="font-display text-sm font-semibold text-white">{column.title}</h3>
                <ul className="mt-5 space-y-3 text-sm text-emerald-100/70">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="transition hover:text-white">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-emerald-100/50 md:flex-row">
            <p>© {year} Académie E.S.I.C. — Tous droits réservés.</p>
            <div className="flex items-center gap-5">
              <Link href="/mentions-legales" className="transition hover:text-white">Mentions légales</Link>
              <Link href="/politique-de-confidentialite" className="transition hover:text-white">Confidentialité</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
