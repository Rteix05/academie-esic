import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0F291E] text-emerald-50 mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-16">

        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-12 mb-14">

          {/* Identité */}
          <div>
            <p className="font-display text-2xl font-bold tracking-tight text-white mb-1">
              ACADÉMIE ESIC
            </p>
            <p className="text-emerald-400 text-[11px] uppercase tracking-[0.22em] font-medium mb-6">
              École du Savoir et de l&apos;Intelligence Chrétienne
            </p>
            <p className="text-emerald-200/60 text-sm leading-relaxed max-w-xs">
              Un centre de formation chrétienne dédié à l&apos;édification des disciples
              et à la préparation des serviteurs de Dieu.
            </p>
            <p className="mt-6 text-emerald-400/80 text-xs italic leading-relaxed">
              « Afin que l&apos;homme de Dieu soit accompli » — 2 Tm 3:17
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.22em] mb-5">Navigation</p>
            <ul className="space-y-3 text-sm text-emerald-100/70">
              <li><Link href="/"            className="hover:text-white transition">Accueil</Link></li>
              <li><Link href="/histoire"    className="hover:text-white transition">À propos</Link></li>
              <li><Link href="/formations"  className="hover:text-white transition">Formations</Link></li>
              <li><Link href="/temoignages" className="hover:text-white transition">Témoignages</Link></li>
              <li><Link href="/contact"     className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          {/* Compte & légal */}
          <div>
            <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.22em] mb-5">Mon compte</p>
            <ul className="space-y-3 text-sm text-emerald-100/70 mb-8">
              <li><Link href="/login"            className="hover:text-white transition">Connexion</Link></li>
              <li><Link href="/register"         className="hover:text-white transition">Inscription</Link></li>
              <li><Link href="/dashboard"        className="hover:text-white transition">Mon espace</Link></li>
              <li><Link href="/dashboard/profil" className="hover:text-white transition">Mon profil</Link></li>
            </ul>

            <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.22em] mb-5">Légal</p>
            <ul className="space-y-3 text-sm text-emerald-100/70">
              <li><Link href="/mentions-legales"             className="hover:text-white transition">Mentions légales</Link></li>
              <li><Link href="/politique-de-confidentialite" className="hover:text-white transition">Confidentialité</Link></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-emerald-200/40">
            © {year} Académie E.S.I.C. — Tous droits réservés.
          </p>
          <div className="flex items-center gap-5 text-xs text-emerald-200/40">
            <Link href="/mentions-legales"              className="hover:text-emerald-200 transition">Mentions légales</Link>
            <span>·</span>
            <Link href="/politique-de-confidentialite"  className="hover:text-emerald-200 transition">Confidentialité</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
