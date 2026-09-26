'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LayoutDashboard, LogOut, ChevronDown, Sun, Moon, Menu, X, ShieldCheck } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { AUTH_EVENT, fetchMe, logout } from '@/lib/api';

interface UserProfile {
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
}

export default function Navbar() {
  const router                          = useRouter();
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

  // Fermer le dropdown avec Escape
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

  const displayName = profile
    ? (profile.firstName || profile.lastName)
      ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
      : profile.email
    : null;

  return (
    <div className="sticky top-0 z-50">
    <nav
      role="navigation"
      aria-label="Navigation principale"
      className="bg-white/95 dark:bg-[#0a1810]/95 backdrop-blur-md border-b border-gray-100 dark:border-[#1a3022] px-8 py-4 flex justify-between items-center transition-colors duration-200 relative"
    >
      {/* Logo */}
      <Link
        href="/"
        className="font-display text-lg font-bold tracking-tight text-[#0F291E] dark:text-emerald-100 focus-visible:outline-none rounded"
        aria-label="Académie E.S.I.C. — Accueil"
      >
        ACADÉMIE E.S.I.C.
      </Link>

      {/* Liens principaux (desktop) */}
      <div
        role="list"
        className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300"
      >
        <Link role="listitem" href="/histoire"    className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">À propos</Link>
        <Link role="listitem" href="/formations"  className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">Formations</Link>
        <Link role="listitem" href="/temoignages" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">Témoignages</Link>
        <Link role="listitem" href="/contact"     className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">Contact</Link>
      </div>

      <div className="flex items-center gap-3">

        {/* Bouton Dark Mode */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-[#2d4a35] bg-gray-50 dark:bg-[#142018] text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition"
        >
          {theme === 'dark'
            ? <Sun  className="w-4 h-4" aria-hidden="true" />
            : <Moon className="w-4 h-4" aria-hidden="true" />
          }
        </button>

        {/* Authentification */}
        {isChecking ? (
          <div className="w-32 h-9 bg-gray-100 dark:bg-[#1a2e22] rounded-full animate-pulse" aria-hidden="true" />
        ) : displayName ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              aria-controls="user-menu"
              aria-label={`Menu de ${displayName}`}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#142018] border border-gray-200 dark:border-[#2d4a35] rounded-full text-sm font-bold text-[#0F291E] dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-200 transition"
            >
              <div
                className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
              >
                <User className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <span className="max-w-[130px] truncate">{displayName}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {dropdownOpen && (
              <div
                id="user-menu"
                role="menu"
                aria-label="Menu utilisateur"
                className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#18291e] border border-gray-100 dark:border-[#2d4a35] rounded-2xl shadow-xl shadow-gray-200/60 dark:shadow-black/40 py-2 z-50"
              >
                <div className="px-4 py-2 border-b border-gray-50 dark:border-[#243b2b] mb-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mon compte</p>
                  <p className="text-xs font-semibold text-[#0F291E] dark:text-emerald-100 truncate mt-0.5">{profile?.email}</p>
                </div>
                <Link
                  role="menuitem"
                  href="/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-800 transition"
                >
                  <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                  Mon espace
                </Link>
                <Link
                  role="menuitem"
                  href="/dashboard/profil"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-800 transition"
                >
                  <User className="w-4 h-4" aria-hidden="true" />
                  Mon profil
                </Link>
                {profile?.roles?.includes('ROLE_ADMIN') && (
                  <a
                    role="menuitem"
                    href="/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition"
                  >
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                    Back office
                  </a>
                )}
                <div className="border-t border-gray-50 dark:border-[#243b2b] mt-1 pt-1">
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#0F291E] dark:hover:text-white transition"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-[#0F291E] text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition rounded-full"
            >
              S'inscrire
            </Link>
          </>
        )}

        {/* Bouton hamburger (mobile) */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-[#2d4a35] bg-gray-50 dark:bg-[#142018] text-gray-600 dark:text-gray-300 hover:bg-emerald-50 transition"
          onClick={() => setMobileMenuOpen((o) => !o)}
          aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-[#0a1810] border-b border-gray-100 dark:border-[#1a3022] shadow-lg z-40 px-8 py-4 flex flex-col gap-1">
          {[
            { href: '/histoire',    label: 'À propos' },
            { href: '/formations',  label: 'Formations' },
            { href: '/temoignages', label: 'Témoignages' },
            { href: '/contact',     label: 'Contact' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-[#1a3022] last:border-0 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
            >
              {label}
            </Link>
          ))}
          {!isChecking && !displayName && (
            <div className="flex gap-3 pt-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2.5 border border-[#E5E7EB] text-sm font-bold text-[#0F291E] hover:bg-[#F0FDF4] transition">
                Connexion
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2.5 bg-[#0F291E] text-sm font-bold text-[#FBFBFA] hover:bg-[#059669] transition">
                S'inscrire
              </Link>
            </div>
          )}
          {!isChecking && displayName && (
            <div className="flex flex-col gap-2 pt-3">
              <div className="flex gap-3">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2.5 border border-gray-200 dark:border-[#2d4a35] rounded-full text-sm font-bold text-[#0F291E] dark:text-emerald-100 hover:bg-gray-50 transition">
                  Mon espace
                </Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex-1 text-center py-2.5 bg-red-50 dark:bg-red-900/20 rounded-full text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-100 transition">
                  Déconnexion
                </button>
              </div>
              {profile?.roles?.includes('ROLE_ADMIN') && (
                <a
                  href="/admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-full text-sm font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition"
                >
                  Back office
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
    </div>
  );
}
