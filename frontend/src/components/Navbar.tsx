'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, LayoutDashboard, LogOut, ChevronDown, Sun, Moon, Menu, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import Logo from './Logo';
import { A11yControls, A11yMenuButton } from './A11yPreferences';
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
  // Témoignages : page conservée mais masquée jusqu'à la réception de vrais avis
  { href: '/contact',     label: 'Contact' },
];

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function Navbar() {
  const router                          = useRouter();
  const pathname                        = usePathname();
  const { theme, toggle: toggleTheme }  = useTheme();
  const [profile, setProfile]           = useState<UserProfile | null>(null);
  const [isChecking, setIsChecking]     = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const dropdownRef   = useRef<HTMLDivElement>(null);
  const dropdownBtn   = useRef<HTMLButtonElement>(null);
  const drawerRef     = useRef<HTMLDivElement>(null);
  const burgerRef     = useRef<HTMLButtonElement>(null);

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

  // Menu du compte : fermeture au clic extérieur et quand le focus en sort
  useEffect(() => {
    if (!dropdownOpen) return;
    const outside = (e: Event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', outside);
    document.addEventListener('focusin', outside);
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('focusin', outside);
    };
  }, [dropdownOpen]);

  const closeDrawer = useCallback((restoreFocus = true) => {
    setDrawerOpen(false);
    if (restoreFocus) burgerRef.current?.focus();
  }, []);

  // Échap : ferme le menu ouvert et rend le focus au bouton qui l'a ouvert
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (drawerOpen) closeDrawer();
      else if (dropdownOpen) { setDropdownOpen(false); dropdownBtn.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen, dropdownOpen, closeDrawer]);

  // Menu burger ouvert : défilement de la page bloqué, focus placé dans le panneau et maintenu à l'intérieur
  useEffect(() => {
    if (!drawerOpen) return;
    const panel = drawerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    // Passage en affichage bureau pendant que le menu est ouvert : on le ferme
    const desktop = window.matchMedia('(min-width: 1280px)');
    // (sauf texte agrandi : le menu burger reste alors la navigation principale)
    const onDesktop = () => {
      if (desktop.matches && !document.documentElement.classList.contains('a11y-text-large')) setDrawerOpen(false);
    };

    document.addEventListener('keydown', trap);
    desktop.addEventListener('change', onDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', trap);
      desktop.removeEventListener('change', onDesktop);
    };
  }, [drawerOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setDrawerOpen(false);
    await logout();
    setProfile(null);
    router.push('/');
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const isAdmin = profile?.roles?.includes('ROLE_ADMIN') ?? false;

  const displayName = profile
    ? (profile.firstName || profile.lastName)
      ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
      : profile.email
    : null;

  const themeLabel = theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre';
  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  return (
    <>
    <header className="sticky top-0 z-50 bg-brand-cream/90 backdrop-blur-md dark:bg-[#0a1810]/90">
      <div className="container-page flex min-h-16 items-center justify-between gap-4 py-2 sm:min-h-20">
        <Logo />

        {/* Navigation principale (bureau) */}
        <nav aria-label="Navigation principale" className="nav-desktop hidden xl:block">
          <ul className="flex items-center gap-1">
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
        </nav>

        <div className="flex items-center gap-2">
          {/* Réglages d'affichage (sur mobile : dans le menu burger) */}
          <A11yMenuButton className="hidden sm:block" />

          {/* Mode sombre (également proposé dans le menu burger) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
            className="hidden h-11 w-11 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-sage hover:text-brand-forest sm:flex dark:text-gray-300 dark:hover:bg-emerald-400/10"
          >
            <ThemeIcon className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>

          {/* Compte (tablette et bureau ; sur mobile, dans le menu burger) */}
          {isChecking ? (
            <div className="nav-auth hidden h-11 w-40 animate-pulse rounded-full bg-brand-sage/60 md:block" aria-hidden="true" />
          ) : displayName ? (
            <div className="nav-auth relative hidden md:block" ref={dropdownRef}>
              <button
                ref={dropdownBtn}
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                aria-expanded={dropdownOpen}
                aria-controls="user-menu"
                className="flex items-center gap-2 rounded-full border border-brand-forest/10 bg-white py-1.5 pl-1.5 pr-4 font-display text-sm font-medium text-brand-forest shadow-card transition hover:border-brand-emerald/40 dark:border-white/10 dark:bg-white/5 dark:text-emerald-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-forest font-display text-xs font-semibold text-white" aria-hidden="true">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[140px] truncate">{displayName}</span>
                <span className="sr-only"> : menu du compte</span>
                <ChevronDown className={`h-4 w-4 text-brand-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {dropdownOpen && (
                <div
                  id="user-menu"
                  className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-3xl border border-brand-forest/5 bg-white p-2 shadow-float dark:border-white/10 dark:bg-[#18291e]"
                >
                  <p className="mb-1 rounded-2xl bg-brand-mint px-4 py-3 dark:bg-white/5">
                    <span className="block font-display text-xs font-medium text-brand-muted">Connecté en tant que</span>
                    <span className="mt-0.5 block truncate text-sm font-semibold text-brand-forest dark:text-emerald-100">{profile?.email}</span>
                  </p>
                  <ul>
                    <li><MenuLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} onClick={() => setDropdownOpen(false)}>Mon espace</MenuLink></li>
                    <li><MenuLink href="/dashboard/profil" icon={<User className="h-4 w-4" />} onClick={() => setDropdownOpen(false)}>Mon profil</MenuLink></li>
                    {isAdmin && (
                      <li>
                        <a
                          href="/admin"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-amber-800 transition hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                        >
                          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                          Back office<span className="sr-only"> (nouvelle fenêtre)</span>
                        </a>
                      </li>
                    )}
                    <li>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        Déconnexion
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-auth hidden items-center gap-1 md:flex">
              <Link href="/login" className="btn-ghost">Connexion</Link>
              <Link href="/register" className="btn-primary">
                S&apos;inscrire
                <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </Link>
            </div>
          )}

          {/* Bouton du menu burger (mobile et tablette) */}
          <button
            ref={burgerRef}
            type="button"
            className="nav-burger flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand-forest shadow-card transition hover:bg-brand-sage xl:hidden dark:bg-white/5 dark:text-emerald-100"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            aria-controls="menu-mobile"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>

      {/* Menu burger : panneau latéral modal (hors du header : son flou d'arrière-plan
          enfermerait un élément position:fixed dans la hauteur du header) */}
      <div className={`nav-drawer fixed inset-0 z-[60] xl:hidden ${drawerOpen ? '' : 'pointer-events-none invisible'}`}>
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-brand-forest/40 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => closeDrawer()}
        />
        <div
          ref={drawerRef}
          id="menu-mobile"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto bg-brand-cream shadow-float transition-transform duration-300 motion-reduce:transition-none dark:bg-[#0f1f16] ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex h-16 shrink-0 items-center justify-between px-5 sm:h-20 sm:px-8">
            <span className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-brand-muted" aria-hidden="true">Menu</span>
            <button
              type="button"
              onClick={() => closeDrawer()}
              aria-label="Fermer le menu"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-forest shadow-card transition hover:bg-brand-sage dark:bg-white/5 dark:text-emerald-100"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Navigation principale" className="px-5 sm:px-8">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => closeDrawer(false)}
                    aria-current={isActive(href) ? 'page' : undefined}
                    className={`flex min-h-12 items-center rounded-2xl px-4 py-3 font-display text-lg font-medium transition ${
                      isActive(href)
                        ? 'bg-brand-sage text-brand-forest dark:bg-emerald-400/10 dark:text-emerald-200'
                        : 'text-brand-ink hover:bg-brand-mint hover:text-brand-forest dark:text-gray-200 dark:hover:bg-white/5'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="menu-affichage" className="mx-5 mt-6 rounded-3xl bg-white p-5 shadow-card sm:mx-8 dark:bg-white/5">
            <h2 id="menu-affichage" className="mb-4 font-display text-base font-semibold text-brand-forest dark:text-emerald-100">Affichage</h2>
            <A11yControls />
          </section>

          <div className="mt-auto space-y-3 border-t border-brand-forest/10 px-5 py-6 sm:px-8 dark:border-white/10">
            {!isChecking && !displayName && (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => closeDrawer(false)} className="btn-secondary">Connexion</Link>
                <Link href="/register" onClick={() => closeDrawer(false)} className="btn-primary-plain">S&apos;inscrire</Link>
              </div>
            )}
            {!isChecking && displayName && (
              <>
                <p className="px-1 text-sm text-brand-muted">
                  Connecté en tant que <span className="font-semibold text-brand-forest dark:text-emerald-100">{displayName}</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/dashboard" onClick={() => closeDrawer(false)} className="btn-secondary">Mon espace</Link>
                  <Link href="/dashboard/profil" onClick={() => closeDrawer(false)} className="btn-secondary">Mon profil</Link>
                  {isAdmin && (
                    <a href="/admin" target="_blank" rel="noopener noreferrer" onClick={() => closeDrawer(false)} className="btn col-span-2 bg-amber-50 px-6 py-3 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400">
                      Back office<span className="sr-only"> (nouvelle fenêtre)</span>
                    </a>
                  )}
                  <button type="button" onClick={handleLogout} className="btn col-span-2 rounded-full bg-red-50 px-6 py-3 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">
                    <LogOut className="h-4 w-4" aria-hidden="true" /> Déconnexion
                  </button>
                </div>
              </>
            )}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 py-3 font-display text-sm font-medium text-brand-muted transition hover:bg-brand-mint hover:text-brand-forest dark:text-gray-300 dark:hover:bg-white/5"
            >
              <ThemeIcon className="h-4 w-4" aria-hidden="true" />
              {themeLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function MenuLink({ href, icon, onClick, children }: { href: string; icon: React.ReactNode; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-brand-ink transition hover:bg-brand-mint hover:text-brand-forest dark:text-gray-200 dark:hover:bg-white/5"
    >
      <span aria-hidden="true">{icon}</span>
      {children}
    </Link>
  );
}
