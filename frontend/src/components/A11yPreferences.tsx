'use client';

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { Accessibility, Minus, Plus, RotateCcw } from 'lucide-react';

/**
 * Préférences d'affichage de l'outil d'accessibilité : taille du texte, liens en gras, texte en gras.
 * Mémorisées dans le navigateur du visiteur et appliquées sur <html> :
 *   --text-scale (échelle typographique, voir tailwind.config.js), classes a11y-bold-links / a11y-bold-text.
 * Le script A11Y_BOOT_SCRIPT les applique avant l'affichage pour éviter un saut au chargement.
 */

export const TEXT_SCALES = [0.9, 1, 1.15, 1.3, 1.5, 1.75, 2] as const;
const DEFAULT_INDEX = 1;
const STORAGE_KEY = 'esic-a11y';

interface Prefs {
  scaleIndex: number;
  boldLinks: boolean;
  boldText: boolean;
}

const DEFAULT_PREFS: Prefs = { scaleIndex: DEFAULT_INDEX, boldLinks: false, boldText: false };

/** Script exécuté avant l'hydratation (layout racine) : même logique que applyPrefs */
export const A11Y_BOOT_SCRIPT = `try{var p=JSON.parse(localStorage.getItem('${STORAGE_KEY}')||'null');if(p){var s=${JSON.stringify(TEXT_SCALES)}[p.scaleIndex];var h=document.documentElement;if(s)h.style.setProperty('--text-scale',String(s));h.classList.toggle('a11y-bold-links',!!p.boldLinks);h.classList.toggle('a11y-bold-text',!!p.boldText);h.classList.toggle('a11y-text-large',p.scaleIndex>${DEFAULT_INDEX});}}catch(e){}`;

function applyPrefs(prefs: Prefs) {
  const html = document.documentElement;
  html.style.setProperty('--text-scale', String(TEXT_SCALES[prefs.scaleIndex] ?? 1));
  html.classList.toggle('a11y-bold-links', prefs.boldLinks);
  html.classList.toggle('a11y-bold-text', prefs.boldText);
  // Texte agrandi : le header passe en mode compact (navigation dans le menu burger)
  html.classList.toggle('a11y-text-large', prefs.scaleIndex > DEFAULT_INDEX);
}

function readPrefs(): Prefs {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<Prefs> | null;
    if (!stored) return DEFAULT_PREFS;
    const scaleIndex = Number.isInteger(stored.scaleIndex) && stored.scaleIndex! >= 0 && stored.scaleIndex! < TEXT_SCALES.length
      ? stored.scaleIndex!
      : DEFAULT_INDEX;
    return { scaleIndex, boldLinks: !!stored.boldLinks, boldText: !!stored.boldText };
  } catch {
    return DEFAULT_PREFS;
  }
}

interface A11yContextValue extends Prefs {
  update: (patch: Partial<Prefs>) => void;
  reset: () => void;
}

const A11yContext = createContext<A11yContextValue>({ ...DEFAULT_PREFS, update: () => {}, reset: () => {} });

export function A11yProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  // Lecture des préférences enregistrées (déjà appliquées au DOM par le script de démarrage)
  useEffect(() => {
    const stored = readPrefs();
    setPrefs(stored);
    applyPrefs(stored);
  }, []);

  const save = useCallback((next: Prefs) => {
    applyPrefs(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Stockage indisponible (navigation privée…) : préférence valable pour la page en cours
    }
    return next;
  }, []);

  const update = useCallback((patch: Partial<Prefs>) => setPrefs((current) => save({ ...current, ...patch })), [save]);
  const reset = useCallback(() => setPrefs(save(DEFAULT_PREFS)), [save]);

  return <A11yContext.Provider value={{ ...prefs, update, reset }}>{children}</A11yContext.Provider>;
}

export const useA11yPrefs = () => useContext(A11yContext);

/** Réglages (panneau du header et menu burger) */
export function A11yControls() {
  const { scaleIndex, boldLinks, boldText, update, reset } = useA11yPrefs();
  const percent = Math.round(TEXT_SCALES[scaleIndex] * 100);
  const isDefault = scaleIndex === DEFAULT_INDEX && !boldLinks && !boldText;
  const sizeLabelId = useId();

  const sizeButton = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand-forest shadow-card transition hover:bg-brand-sage disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/10 dark:text-emerald-100';

  return (
    <div className="space-y-5">
      <div role="group" aria-labelledby={sizeLabelId}>
        <p id={sizeLabelId} className="font-display text-sm font-semibold text-brand-forest dark:text-emerald-100">Taille du texte</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => update({ scaleIndex: scaleIndex - 1 })}
            disabled={scaleIndex === 0}
            aria-label="Réduire la taille du texte"
            className={sizeButton}
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          {/* Taille annoncée aux lecteurs d'écran à chaque changement */}
          <output aria-live="polite" className="font-display text-base font-semibold text-brand-forest dark:text-emerald-100">
            <span className="sr-only">Taille du texte : </span>{percent} %
          </output>
          <button
            type="button"
            onClick={() => update({ scaleIndex: scaleIndex + 1 })}
            disabled={scaleIndex === TEXT_SCALES.length - 1}
            aria-label="Agrandir la taille du texte"
            className={sizeButton}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Switch label="Liens en gras" checked={boldLinks} onChange={(v) => update({ boldLinks: v })} />
        <Switch label="Texte en gras" checked={boldText} onChange={(v) => update({ boldText: v })} />
      </div>

      <button
        type="button"
        onClick={reset}
        disabled={isDefault}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-brand-forest/15 px-4 py-2.5 font-display text-sm font-medium text-brand-forest transition hover:border-brand-emerald disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:text-emerald-100"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Réinitialiser l&apos;affichage
      </button>
    </div>
  );
}

function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 w-full items-center justify-between gap-4 rounded-2xl px-3 py-2 text-left text-sm font-medium text-brand-ink transition hover:bg-brand-mint dark:text-gray-200 dark:hover:bg-white/5"
    >
      {label}
      <span
        aria-hidden="true"
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors ${
          checked ? 'border-brand-emerald bg-brand-emerald' : 'border-brand-muted bg-white dark:border-gray-400 dark:bg-transparent'
        }`}
      >
        <span className={`h-4 w-4 rounded-full shadow transition-transform ${checked ? 'translate-x-[22px] bg-white' : 'translate-x-0.5 bg-brand-muted dark:bg-gray-300'}`} />
      </span>
    </button>
  );
}

/** Bouton du header ouvrant le panneau de réglages (tablette et bureau) */
export function A11yMenuButton({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const outside = (e: Event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); }
    };
    document.addEventListener('mousedown', outside);
    document.addEventListener('focusin', outside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('focusin', outside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Réglages d'affichage : taille du texte, gras"
        title="Réglages d'affichage"
        className="flex h-11 w-11 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-sage hover:text-brand-forest dark:text-gray-300 dark:hover:bg-emerald-400/10"
      >
        <Accessibility className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 z-50 mt-3 w-80 max-w-[calc(100vw-2.5rem)] rounded-3xl border border-brand-forest/5 bg-white p-5 shadow-float dark:border-white/10 dark:bg-[#18291e]"
        >
          <p className="mb-4 font-display text-base font-semibold text-brand-forest dark:text-emerald-100">Réglages d&apos;affichage</p>
          <A11yControls />
        </div>
      )}
    </div>
  );
}
