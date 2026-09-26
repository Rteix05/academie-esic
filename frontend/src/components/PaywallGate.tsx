'use client';

import { useEffect, useState } from 'react';
import { Lock, Check, FileText, Video, Package, ExternalLink } from 'lucide-react';
import BoutonPaywall from './BoutonPaywall';
import ProtectedVideoPlayer from './ProtectedVideoPlayer';
import { apiFetch, fetchMe } from '@/lib/api';

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
      <section className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 rounded-2xl bg-gray-100 aspect-video animate-pulse" />
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-48 animate-pulse" />
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-10">

      {/* Colonne gauche : vidéo */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="rounded-2xl overflow-hidden bg-black aspect-video relative flex items-center justify-center">
          {mc.videoAvailable ? (
            hasVideo && videoSrc ? (
              <ProtectedVideoPlayer
                src={videoSrc}
                mcId={Number(mc.id)}
                userEmail={userInfo?.email}
                userName={userInfo?.firstName ? `${userInfo.firstName} ${userInfo.lastName ?? ''}`.trim() : undefined}
              />
            ) : (
              <div className="w-full h-full relative flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1610116306796-6ebd30d779c6?q=80&w=800&auto=format&fit=crop"
                  className="w-full h-full object-cover blur-[6px] scale-105 opacity-40 absolute inset-0"
                  alt="Aperçu verrouillé"
                />
                <div className="relative z-10 flex flex-col items-center text-center p-6">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mb-3 shadow-xl">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white font-bold text-sm uppercase tracking-wider">Contenu protégé</p>
                  <p className="text-gray-300 text-xs mt-1">Choisissez une option ci-contre pour débloquer</p>
                </div>
              </div>
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-[#0F291E] flex items-center justify-center">
              <span className="text-xs font-bold text-emerald-300 tracking-wider">Pas de vidéo disponible</span>
            </div>
          )}
        </div>

        {mc.description && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-lg font-black text-[#0F291E] mb-3">À propos de cette masterclass</h2>
            <div
              className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: mc.description }}
            />
          </div>
        )}
      </div>

      {/* Colonne droite */}
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
          {estAchetee ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-emerald-700">Masterclass débloquée</p>
                  <p className="text-xs text-gray-400">Accédez à votre contenu ci-dessous</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                {hasVideo && videoSrc && (
                  <a
                    href={videoSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl transition"
                  >
                    <span className="flex items-center gap-2"><Video className="w-3.5 h-3.5" /> Regarder la vidéo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {hasPdf && mc.pdfAvailable && (
                  <button
                    type="button"
                    onClick={() => downloadPdf(Number(mc.id), mc.title)}
                    className="flex items-center justify-between w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold rounded-xl transition"
                  >
                    <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Télécharger le PDF</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                {options.includes('pack') && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 px-1">
                    <Package className="w-3.5 h-3.5" />
                    <span>Pack Complet — Vidéo + PDF inclus</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-base font-black text-[#0F291E] mb-1">Débloquer cette masterclass</h3>
              <p className="text-xs text-gray-400 mb-4">Choisissez le format qui vous convient :</p>
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
        </div>
      </div>

    </section>
  );
}
