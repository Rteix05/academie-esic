'use client';

import { useEffect, useRef, useState } from 'react';
import { API_URL, apiFetch } from '@/lib/api';

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

  useEffect(() => {
    // Vidéo externe : utilisation directe
    if (isExternal) {
      setStreamUrl(src);
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
  }, [src, mcId, isExternal]);

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
  if (loadError) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <p className="text-red-400 text-xs font-medium">Impossible de charger la vidéo.</p>
      </div>
    );
  }

  if (!streamUrl) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* Lecteur vidéo */}
      <video
        ref={videoRef}
        src={streamUrl}
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        className={`w-full h-full object-cover transition-[filter] duration-300 ${devToolsOpen ? 'blur-2xl' : ''}`}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Filigrane flottant — identifie l'utilisateur */}
      <div
        className="absolute pointer-events-none z-20 transition-all duration-[3000ms] ease-in-out"
        style={{ top: wmPos.top, left: wmPos.left, transform: 'translate(-50%, -50%)' }}
        aria-hidden="true"
      >
        <span
          className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em] select-none"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
        >
          {watermarkText}
        </span>
      </div>

      {/* Overlay DevTools */}
      {devToolsOpen && (
        <div className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center gap-3 p-6">
          <div className="w-12 h-12 bg-red-500/10 border border-red-400/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
          </div>
          <p className="text-white text-sm font-bold text-center">Contenu protégé</p>
          <p className="text-gray-400 text-xs text-center max-w-xs">
            Fermez les outils de développement pour reprendre la lecture.
          </p>
        </div>
      )}
    </div>
  );
}
