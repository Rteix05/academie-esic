'use client';

import { useEffect, useState } from 'react';
import { Lock, Check, FileText, Video, Package, ExternalLink } from 'lucide-react';
import BoutonPaywall from './BoutonPaywall';
import ProtectedVideoPlayer from './ProtectedVideoPlayer';
import { apiFetch, fetchMe, uploadUrl } from '@/lib/api';


interface Purchase {
  id: number;
  options: string[];
  /** Lien vidéo — renvoyé par l'API uniquement pour l'option vidéo/pack */
  video?: string | null;
  pdfAvailable?: boolean;
}

// Le PDF est servi par une route protégée (cookie de session) : on le récupère en blob puis on déclenche le téléchargement
async function downloadPdf(mcId: number, title: string) {
  const res = await apiFetch(`/api/content/masterclass/${mcId}/pdf`, {
    headers: { Accept: 'application/pdf' },
  });
  if (!res.ok) {
    alert('Impossible de télécharger le PDF pour le moment.');
    return;
  }
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title || 'masterclass'}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

interface PaywallGateProps {
  mc: any;
}

export default function PaywallGate({ mc }: PaywallGateProps) {
  const [purchase, setPurchase] = useState<Purchase | null | false>(null);
  const [userInfo, setUserInfo]   = useState<{ email: string; firstName?: string; lastName?: string } | null>(null);

  useEffect(() => {
    // Récupère les infos utilisateur pour le filigrane (null si non connecté)
    fetchMe().then((me) => { if (me) setUserInfo({ email: me.email, firstName: me.firstName ?? undefined, lastName: me.lastName ?? undefined }); });

    // Non connecté : 401 → aucun achat
    apiFetch('/api/mes-masterclasses')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Purchase[]) => {
        const found = data.find((p) => p.id === Number(mc.id));
        setPurchase(found ?? false);
      })
      .catch(() => setPurchase(false));
  }, [mc.id]);

  const loading = purchase === null;
  const estAchetee = purchase !== null && purchase !== false;
  const options: string[] = estAchetee ? (purchase as Purchase).options : [];
  const hasVideo = options.includes('video') || options.includes('pack');
  const hasPdf   = options.includes('pdf')   || options.includes('pack');
  const videoSrc = estAchetee ? (purchase as Purchase).video ?? null : null;

  if (loading) {
    return (
      <section id="acces" className="container-page mt-12 grid scroll-mt-28 grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="aspect-video animate-pulse rounded-4xl bg-brand-sage/50 lg:col-span-2" />
        <div className="card h-56 animate-pulse" />
      </section>
    );
  }

  return (
    <section id="acces" className="container-page mt-12 grid scroll-mt-28 grid-cols-1 items-start gap-8 lg:grid-cols-3">

      {/* Colonne gauche : vidéo + description */}
      <div className="flex flex-col gap-6 lg:col-span-2">
        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-4xl bg-brand-forest shadow-float">
          {mc.videoAvailable ? (
            hasVideo && videoSrc ? (
              <ProtectedVideoPlayer
                  src={videoSrc}
                  mcId={Number(mc.id)}
                  userEmail={userInfo?.email}
                  userName={userInfo?.firstName ? `${userInfo.firstName} ${userInfo.lastName ?? ''}`.trim() : undefined}
                />
            ) : (
              <div className="relative flex h-full w-full items-center justify-center">
                {mc.imagePreview && (
                  <img src={uploadUrl(mc.imagePreview)} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-30 blur-[6px]" />
                )}
                <div aria-hidden="true" className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
                <div className="relative z-10 flex flex-col items-center p-6 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md">
                    <Lock className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <p className="mt-4 font-display text-base font-semibold text-white">Contenu protégé</p>
                  <p className="mt-1 text-sm text-emerald-100/70">Choisissez une option pour débloquer la vidéo</p>
                </div>
              </div>
            )
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-emerald-200/80">
              <Video className="h-8 w-8" aria-hidden="true" />
              <span className="font-display text-sm font-medium">Pas de vidéo pour cette masterclass</span>
            </div>
          )}
        </div>

        {mc.description && (
          <div className="card p-7 sm:p-9">
            <h2 className="font-display text-xl font-semibold text-brand-forest">À propos de cette masterclass</h2>
            <div className="rich-text mt-4" dangerouslySetInnerHTML={{ __html: mc.description }} />
          </div>
        )}
      </div>

      {/* Colonne droite : accès / achat */}
      <aside className="card p-6 lg:sticky lg:top-28">
        {estAchetee ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 rounded-3xl bg-brand-mint p-4 dark:bg-white/5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-forest text-white">
                <Check className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-sm font-semibold text-brand-forest">Masterclass débloquée</p>
                <p className="text-xs text-brand-muted">Accédez à votre contenu ci-dessous</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {hasVideo && videoSrc && (
                <a href={videoSrc} target="_blank" rel="noopener noreferrer" className="btn-primary justify-between">
                  <span className="flex items-center gap-2"><Video className="h-4 w-4" aria-hidden="true" /> Ouvrir dans un nouvel onglet</span>
                  <span className="btn-icon"><ExternalLink className="h-4 w-4" aria-hidden="true" /></span>
                </a>
              )}
              {hasPdf && mc.pdfAvailable && (
                <button type="button" onClick={() => downloadPdf(Number(mc.id), mc.title)} className="btn-secondary justify-between">
                  <span className="flex items-center gap-2"><FileText className="h-4 w-4" aria-hidden="true" /> Télécharger le PDF</span>
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              {options.includes('pack') && (
                <p className="mt-1 flex items-center gap-2 px-1 text-xs text-brand-muted">
                  <Package className="h-4 w-4 text-brand-emerald" aria-hidden="true" />
                  Pack complet — vidéo + PDF inclus
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <h3 className="font-display text-lg font-semibold text-brand-forest">Débloquer cette masterclass</h3>
            <p className="mb-5 mt-1 text-sm text-brand-muted">Choisissez le format qui vous convient :</p>
            <BoutonPaywall
              masterclassId={Number(mc.id)}
              prices={{
                pdf: mc.pricePdf ?? null,
                video: mc.priceVideo ?? null,
                pack: mc.pricePack ?? null,
              }}
            />
          </>
        )}
      </aside>
    </section>
  );
}
