'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Play, PlayCircle } from 'lucide-react';
import { API_URL, apiFetch } from '@/lib/api';
import { resolvePcloudFile, resolveVideoSource } from '@/lib/videoSource';
import { PROVIDER_PRIVACY_URL, hasVideoConsent, rememberVideoConsent } from '@/lib/videoConsent';

/** Démarrage automatique après le clic de consentement (YouTube et Vimeo le permettent) */
function withAutoplay(url: string): string {
  try {
    const u = new URL(url);
    if (/youtube(-nocookie)?\.com$|vimeo\.com$/.test(u.hostname)) u.searchParams.set('autoplay', '1');
    return u.toString();
  } catch {
    return url;
  }
}

interface Props {
  /** URL externe (http...) ou nom de fichier local */
  src: string;
  /** ID de la masterclass — nécessaire pour les vidéos locales */
  mcId?: number;
  /** Affiché en filigrane */
  userEmail?: string;
  userName?: string;
}

export default function ProtectedVideoPlayer({ src, mcId, userEmail, userName }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const [streamUrl, setStreamUrl]       = useState<string | null>(null);
  const [loadError, setLoadError]       = useState(false);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [wmPos, setWmPos]               = useState({ top: '18%', left: '28%' });

  const watermarkText = userName || userEmail || 'ACADÉMIE E.S.I.C.';

  // ─── Résolution de l'URL source ──────────────────────────────────────────
  const isExternal = src.startsWith('http://') || src.startsWith('https://');
  // Lien externe : lecteur intégré (YouTube, Vimeo, Drive), fichier (Dropbox, .mp4), pCloud ou lien simple
  const source = useMemo(() => (isExternal ? resolveVideoSource(src) : null), [src, isExternal]);
  const [fallback, setFallback] = useState(false);

  // ─── Consentement aux lecteurs tiers (cookies YouTube, Google, Vimeo) ────
  // Le lecteur n'est chargé qu'après un clic, sauf accord mémorisé pour ce service
  const [thirdPartyAllowed, setThirdPartyAllowed] = useState(() => {
    const s = isExternal ? resolveVideoSource(src) : null;
    return s?.kind === 'iframe' && hasVideoConsent(s.provider);
  });
  const [startedByClick, setStartedByClick] = useState(false);
  const [rememberChoice, setRememberChoice] = useState(false);
  const consentId = useId();

  useEffect(() => {
    if (source) {
      if (source.kind === 'file') {
        setStreamUrl(source.src);
      } else if (source.kind === 'pcloud') {
        // Lien de partage pCloud → lien de fichier direct (temporaire), sinon ouverture externe
        resolvePcloudFile(source.code, source.apiHost)
          .then(setStreamUrl)
          .catch(() => setFallback(true));
      } else if (source.kind === 'external') {
        setFallback(true);
      }
      return;
    }

    // Vidéo locale : demande d'une URL signée au backend
    if (!mcId) {
      setStreamUrl(src);
      return;
    }

    // Session via cookie httpOnly ; l'URL signée renvoyée est ensuite lisible par la balise <video>
    apiFetch(`/api/video-url/${mcId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (data?.streamUrl) {
          setStreamUrl(`${API_URL}${data.streamUrl}`);
        } else {
          setLoadError(true);
        }
      })
      .catch(() => setLoadError(true));
  }, [src, mcId, source]);

  // ─── Filigrane dynamique (change de position toutes les 30 s) ────────────
  useEffect(() => {
    const move = () =>
      setWmPos({
        top:  `${Math.random() * 60 + 8}%`,
        left: `${Math.random() * 60 + 8}%`,
      });
    const id = setInterval(move, 30_000);
    return () => clearInterval(id);
  }, []);

  // ─── Blocage des raccourcis clavier dangereux ─────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (
        e.key === 'F12' ||
        (ctrl && ['s', 'u', 'p'].includes(e.key.toLowerCase())) ||
        (ctrl && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', handler, { capture: true });
    return () => document.removeEventListener('keydown', handler, { capture: true });
  }, []);

  // ─── Détection DevTools (heuristique taille de fenêtre) ──────────────────
  useEffect(() => {
    const detect = () => {
      const widthThreshold  = window.outerWidth  - window.innerWidth  > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      setDevToolsOpen(widthThreshold || heightThreshold);
    };
    window.addEventListener('resize', detect);
    detect();
    return () => window.removeEventListener('resize', detect);
  }, []);

  // ─── Désactivation du clic droit sur la vidéo ────────────────────────────
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const prevent = (e: MouseEvent) => e.preventDefault();
    el.addEventListener('contextmenu', prevent);
    return () => el.removeEventListener('contextmenu', prevent);
  }, [streamUrl]);

  // ─── Rendu ───────────────────────────────────────────────────────────────
  // Filigrane flottant (identifie l'utilisateur) et voile « outils de développement »,
  // communs au lecteur intégré et à la balise <video>
  const overlays = (
    <>
      <div
        className="pointer-events-none absolute z-20 transition-all duration-[3000ms] ease-in-out"
        style={{ top: wmPos.top, left: wmPos.left, transform: 'translate(-50%, -50%)' }}
        aria-hidden="true"
      >
        <span className="select-none text-[length:calc(10px*var(--text-scale,1))] font-bold uppercase tracking-[0.2em] text-white/25" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
          {watermarkText}
        </span>
      </div>

      {devToolsOpen && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/90 p-6">
          <p className="font-display text-sm font-semibold text-white">Contenu protégé</p>
          <p className="max-w-xs text-center text-xs text-gray-400">Fermez les outils de développement pour reprendre la lecture.</p>
        </div>
      )}
    </>
  );

  // Hébergeur non intégrable (ou fichier refusé) : ouverture dans un nouvel onglet
  if (source && fallback) {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-brand-forest">
        <div aria-hidden="true" className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
        <div aria-hidden="true" className="absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-brand-emerald/20" />
        <div className="relative z-10 flex flex-col items-center p-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand-emerald shadow-float">
            <PlayCircle className="h-8 w-8" aria-hidden="true" />
          </span>
          <p className="mt-4 font-display text-lg font-semibold text-white">Votre vidéo est prête</p>
          <p className="mt-1 text-sm text-emerald-100/75">Hébergée sur {source.provider}, elle s&apos;ouvre dans un nouvel onglet.</p>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="btn mt-6 bg-white py-3 pl-6 pr-2 text-brand-forest shadow-soft hover:-translate-y-0.5"
          >
            Regarder la vidéo<span className="sr-only"> (nouvelle fenêtre)</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-emerald text-white"><ExternalLink className="h-4 w-4" aria-hidden="true" /></span>
          </a>
        </div>
      </div>
    );
  }

  // Lecteur tiers pas encore autorisé : aucune requête vers le service tant que l'utilisateur n'a pas cliqué
  if (source?.kind === 'iframe' && !thirdPartyAllowed) {
    const privacyUrl = PROVIDER_PRIVACY_URL[source.provider];
    const start = () => {
      if (rememberChoice) rememberVideoConsent(source.provider);
      setStartedByClick(true);
      setThirdPartyAllowed(true);
    };

    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-y-auto bg-brand-forest p-5 sm:p-8">
        <div aria-hidden="true" className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
        <div className="relative z-10 flex max-w-md flex-col items-center text-center">
          {/* Raccourci souris ; au clavier et au lecteur d'écran, c'est le bouton « Lancer la vidéo » ci-dessous */}
          <button
            type="button"
            onClick={start}
            tabIndex={-1}
            aria-hidden="true"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand-forest shadow-float transition hover:scale-105"
          >
            <Play className="ml-1 h-7 w-7" aria-hidden="true" />
          </button>
          <p className="mt-4 font-display text-base font-semibold text-white">Vidéo hébergée par {source.provider}</p>
          <p className="mt-2 text-sm text-emerald-50">
            En lançant la vidéo, vous acceptez que {source.provider} dépose des cookies et collecte des données de
            navigation, conformément à{' '}
            {privacyUrl ? (
              <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline underline-offset-4">
                sa politique de confidentialité<span className="sr-only"> (nouvelle fenêtre)</span>
              </a>
            ) : 'sa politique de confidentialité'}.
            {' '}
            <Link href="/politique-de-confidentialite#cookies" className="font-semibold text-white underline underline-offset-4">En savoir plus</Link>
          </p>
          <div className="mt-4 flex items-center gap-2">
            <input
              id={consentId}
              type="checkbox"
              checked={rememberChoice}
              onChange={(e) => setRememberChoice(e.target.checked)}
              className="h-4 w-4 shrink-0 cursor-pointer rounded accent-brand-emerald"
            />
            <label htmlFor={consentId} className="text-sm text-emerald-50">
              Mémoriser mon choix pour {source.provider} (6 mois)
            </label>
          </div>
          <button type="button" onClick={start} className="btn mt-5 bg-white px-6 py-3 text-brand-forest shadow-soft hover:-translate-y-0.5">
            Lancer la vidéo
          </button>
        </div>
      </div>
    );
  }

  // Lecteur officiel de l'hébergeur (YouTube, Vimeo, Google Drive), après consentement
  if (source?.kind === 'iframe') {
    return (
      <div className="relative h-full w-full select-none overflow-hidden bg-black">
        <iframe
          src={startedByClick ? withAutoplay(source.src) : source.src}
          title={`Lecteur vidéo ${source.provider}`}
          className={`absolute inset-0 h-full w-full border-0 transition-[filter] duration-300 ${devToolsOpen ? 'blur-2xl' : ''}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
        />
        {overlays}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <p className="text-xs font-medium text-red-400">Impossible de charger la vidéo.</p>
      </div>
    );
  }

  if (!streamUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black" role="status">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        <span className="sr-only">Chargement de la vidéo…</span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={streamUrl}
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        className={`h-full w-full object-contain transition-[filter] duration-300 ${devToolsOpen ? 'blur-2xl' : ''}`}
        onContextMenu={(e) => e.preventDefault()}
        // Fichier externe refusé (lien expiré, format non lisible…) : repli sur l'ouverture externe
        onError={() => (source ? setFallback(true) : setLoadError(true))}
      />
      {overlays}
    </div>
  );
}
