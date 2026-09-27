'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, LayoutDashboard, LogOut, ChevronDown, Sun, Moon, Menu, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import Logo from './Logo';
import { AUTH_EVENT, fetchMe, logout } from '@/lib/api';

interface UserProfile {
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
}

const NAV_LINKS = [
  { href: '/histoire',    label: 'À propos' },
  { href: '/formations',  label: 'Formations' },
  { href: '/masterclass', label: 'Masterclass' },
  { href: '/evenements',  label: 'Événements' },
  { href: '/temoignages', label: 'Témoignages' },
  { href: '/contact',     label: 'Contact' },
];

export default function Navbar() {
  const router                          = useRouter();
  const pathname                        = usePathname();
  const { theme, toggle: toggleTheme }  = useTheme();
  const [profile, setProfile]           = useState<UserProfile | null>(null);
  const [isChecking, setIsChecking]     = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // État de connexion : lu via /api/me (le cookie httpOnly n'est pas lisible en JS),
  // puis tenu à jour par les événements de connexion / déconnexion / session expirée
  useEffect(() => {
    const refresh = () => fetchMe().then((me) => { setProfile(me as UserProfile | null); setIsChecking(false); });
    const onAuthChanged = (e: Event) => {
      if ((e as CustomEvent<{ authenticated: boolean }>).detail?.authenticated) refresh();
      else setProfile(null);
    };

    refresh();
    window.addEventListener(AUTH_EVENT, onAuthChanged);
    return () => window.removeEventListener(AUTH_EVENT, onAuthChanged);
  }, []);

  // Fermer le dropdown en cliquant en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fermer les menus avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setDropdownOpen(false); setMobileMenuOpen(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    setProfile(null);
    router.push('/');
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const displayName = profile
    ? (profile.firstName || profile.lastName)
      ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
      : profile.email
    : null;

  return (
    <header className="sticky top-0 z-50 bg-brand-cream/85 backdrop-blur-md dark:bg-[#0a1810]/90">
      <nav
        aria-label="Navigation principale"
        className="container-page relative flex h-20 items-center justify-between gap-6"
      >
        <Logo />

        {/* Liens principaux (desktop) */}
        <ul className="hidden items-center gap-1 xl:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive(href) ? 'page' : undefined}
                className={`whitespace-nowrap rounded-full px-4 py-2 font-display text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'bg-brand-sage text-brand-forest dark:bg-emerald-400/10 dark:text-emerald-200'
                    : 'text-brand-muted hover:text-brand-forest dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {/* Mode sombre */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
            className="flex h-10 w-10 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-sage hover:text-brand-forest dark:text-gray-300 dark:hover:bg-emerald-400/10"
          >
            {theme === 'dark'
              ? <Sun  className="h-[18px] w-[18px]" aria-hidden="true" />
              : <Moon className="h-[18px] w-[18px]" aria-hidden="true" />}
          </button>

          {/* Authentification */}
          {isChecking ? (
            <div className="hidden h-11 w-40 animate-pulse rounded-full bg-brand-sage/60 sm:block" aria-hidden="true" />
          ) : displayName ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-controls="user-menu"
                aria-label={`Menu de ${displayName}`}
                className="flex items-center gap-2 rounded-full border border-brand-forest/10 bg-white py-1.5 pl-1.5 pr-4 font-display text-sm font-medium text-brand-forest shadow-card transition hover:border-brand-emerald/40 dark:border-white/10 dark:bg-white/5 dark:text-emerald-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-forest font-display text-xs font-semibold text-white" aria-hidden="true">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-[140px] truncate sm:inline">{displayName}</span>
                <ChevronDown className={`h-4 w-4 text-brand-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {dropdownOpen && (
                <div
                  id="user-menu"
                  role="menu"
                  aria-label="Menu utilisateur"
                  className="absolute right-0 z-50 mt-3 w-60 overflow-hidden rounded-3xl border border-brand-forest/5 bg-white p-2 shadow-float dark:border-white/10 dark:bg-[#18291e]"
                >
                  <div className="mb-1 rounded-2xl bg-brand-mint px-4 py-3 dark:bg-white/5">
                    <p className="font-display text-xs font-medium text-brand-muted">Connecté en tant que</p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-brand-forest dark:text-emerald-100">{profile?.email}</p>
                  </div>
                  <MenuLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} onClick={() => setDropdownOpen(false)}>Mon espace</MenuLink>
                  <MenuLink href="/dashboard/profil" icon={<User className="h-4 w-4" />} onClick={() => setDropdownOpen(false)}>Mon profil</MenuLink>
                  {profile?.roles?.includes('ROLE_ADMIN') && (
                    <a
                      role="menuitem"
                      href="/admin"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                    >
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      Back office
                    </a>
                  )}
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-1 sm:flex">
              <Link href="/login" className="btn-ghost">Connexion</Link>
              <Link href="/register" className="btn-primary">
                S&apos;inscrire
                <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </Link>
            </div>
          )}

          {/* Menu mobile */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-forest shadow-card transition hover:bg-brand-sage xl:hidden dark:bg-white/5 dark:text-emerald-100"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="absolute left-5 right-5 top-full z-40 mt-2 rounded-4xl border border-brand-forest/5 bg-white p-4 shadow-float sm:left-8 sm:right-8 xl:hidden dark:border-white/10 dark:bg-[#0f1f16]"
          >
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive(href) ? 'page' : undefined}
                    className={`block rounded-2xl px-4 py-3 font-display text-sm font-medium transition ${
                      isActive(href) ? 'bg-brand-sage text-brand-forest' : 'text-brand-muted hover:bg-brand-mint hover:text-brand-forest dark:text-gray-300'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {!isChecking && !displayName && (
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-brand-forest/5 pt-3 dark:border-white/10">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary">Connexion</Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary-plain">S&apos;inscrire</Link>
              </div>
            )}
            {!isChecking && displayName && (
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-brand-forest/5 pt-3 dark:border-white/10">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn-secondary">Mon espace</Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="btn rounded-full bg-red-50 px-6 py-3 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">
                  Déconnexion
                </button>
                {profile?.roles?.includes('ROLE_ADMIN') && (
                  <a href="/admin" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className="btn col-span-2 bg-amber-50 px-6 py-3 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400">
                    Back office
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

function MenuLink({ href, icon, onClick, children }: { href: string; icon: React.ReactNode; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      role="menuitem"
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-brand-ink transition hover:bg-brand-mint hover:text-brand-forest dark:text-gray-200 dark:hover:bg-white/5"
    >
      <span aria-hidden="true">{icon}</span>
      {children}
    </Link>
  );
}
