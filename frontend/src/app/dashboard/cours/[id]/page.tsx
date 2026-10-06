'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, Download, FileText, GraduationCap, Loader2, PlayCircle, Video } from 'lucide-react';
import ProtectedVideoPlayer from '@/components/ProtectedVideoPlayer';
import { ErrorState, Spinner } from '@/components/ui';
import { apiFetch, fetchMe } from '@/lib/api';

interface Formation {
  id: number;
  title: string;
  description: string;
  duration: string;
  level: string;
  category: string;
}

/** Contenu payant, communiqué uniquement aux élèves ayant accès à la formation */
interface CourseContent {
  video: string | null;
  pdfAvailable: boolean;
}

export default function SalleDeCoursPage() {
  const router = useRouter();
  const params = useParams(); // Permet de récupérer l'ID dans l'URL
  const formationId = params.id;

  const [formation, setFormation] = useState<Formation | null>(null);
  const [content, setContent] = useState<CourseContent | null>(null);
  const [viewer, setViewer] = useState<{ email: string; name?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Contenu du cours : le backend vérifie l'accès (formation acquise ou accès complet à l'institut)
    apiFetch(`/api/content/formation/${formationId}`)
      .then(async (res) => {
        if (res.status === 401) { router.push('/login'); return Promise.reject(null); }
        if (res.status === 403) throw new Error("Vous n'avez pas accès à ce cours.");
        if (!res.ok) throw new Error('Impossible de charger le contenu de ce cours.');
        const courseContent: CourseContent = await res.json();

        // 2. Présentation de la formation (catalogue public)
        const detail = await apiFetch(`/api/formations/${formationId}`, {
          headers: { Accept: 'application/ld+json, application/json' },
        });
        if (!detail.ok) throw new Error('Impossible de charger le contenu de ce cours.');
        return [courseContent, await detail.json()] as const;
      })
      .then(([courseContent, data]) => {
        setContent(courseContent);
        setFormation(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!err) return; // redirection vers /login déjà lancée
        setError(err.message);
        setIsLoading(false);
      });

    // Filigrane du lecteur vidéo
    fetchMe().then((me) => {
      if (me) setViewer({ email: me.email, name: [me.firstName, me.lastName].filter(Boolean).join(' ') || undefined });
    });
  }, [formationId, router]);

  if (isLoading) {
    return <Spinner label="Chargement de votre salle de cours…" />;
  }

  if (error || !formation || !content) {
    return (
      <div className="container-page py-24">
        <ErrorState message={error || 'Cours introuvable'} />
        <div className="mt-6 text-center">
          <Link href="/dashboard" className="btn-secondary">Retour à mon espace</Link>
        </div>
      </div>
    );
  }

  const hasMaterials = !!content.video || content.pdfAvailable;

  return (
    <div className="pb-8">
      <section className="container-page pt-4">
        <div className="relative overflow-hidden rounded-5xl bg-brand-mint px-6 py-10 sm:px-12 dark:bg-[#10231a]">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-sage/60 dark:bg-emerald-400/5" />
          <nav aria-label="Fil d'Ariane" className="relative flex flex-wrap items-center gap-2 text-sm text-brand-muted">
            <Link href="/dashboard" className="font-medium transition hover:text-brand-emerald">Mon espace</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="max-w-[260px] truncate font-medium text-brand-forest">{formation.title}</span>
          </nav>
          {formation.category && <span className="chip relative mt-6 bg-white dark:bg-white/5">{formation.category}</span>}
          <h1 className="relative mt-4 font-display text-3xl font-semibold text-brand-forest sm:text-4xl">{formation.title}</h1>
          <div className="relative mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-muted">
            {formation.duration && <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand-emerald" aria-hidden="true" /> {formation.duration}</span>}
            {formation.level && <span className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-brand-emerald" aria-hidden="true" /> Niveau : {formation.level}</span>}
          </div>
        </div>
      </section>

      <section className="container-page mt-10 grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {content.video ? (
            <div className="relative aspect-video overflow-hidden rounded-4xl bg-brand-forest shadow-float">
              <ProtectedVideoPlayer src={content.video} userEmail={viewer?.email} userName={viewer?.name} />
            </div>
          ) : (
            <div className="relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-4xl bg-brand-forest px-6 text-center shadow-float">
              <div aria-hidden="true" className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
              <div aria-hidden="true" className="absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-brand-emerald/20" />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white"><Video className="h-7 w-7" aria-hidden="true" /></span>
              <p className="relative mt-4 font-display text-sm font-medium text-emerald-100/80">
                {content.pdfAvailable ? 'Ce cours se suit à partir de son support PDF.' : 'Les supports de ce cours seront bientôt disponibles.'}
              </p>
            </div>
          )}

          <div className="card p-7 sm:p-9">
            <h2 className="font-display text-xl font-semibold text-brand-forest">À propos de ce module</h2>
            <div className="rich-text mt-4" dangerouslySetInnerHTML={{ __html: formation.description }} />
          </div>
        </div>

        {/* Supports du cours */}
        <aside className="card p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-lg font-semibold text-brand-forest">Supports du cours</h2>
          {hasMaterials ? (
            <ul className="mt-5 space-y-3">
              {content.video && (
                <li className="flex items-center gap-3 rounded-2xl bg-brand-mint p-3 dark:bg-white/5">
                  <span className="icon-tile h-10 w-10 shrink-0 bg-white dark:bg-white/10"><PlayCircle className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="text-sm font-medium text-brand-forest">Vidéo du cours</span>
                </li>
              )}
              {content.pdfAvailable && (
                <li><PdfDownload formationId={formation.id} title={formation.title} /></li>
              )}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-brand-muted">Les supports de ce cours seront bientôt disponibles.</p>
          )}
        </aside>
      </section>
    </div>
  );
}

/** Support PDF servi par une route protégée (cookie de session) : récupéré en blob puis téléchargé */
function PdfDownload({ formationId, title }: { formationId: number; title: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch(`/api/content/formation/${formationId}/pdf`, { headers: { Accept: 'application/pdf' } });
      if (!res.ok) throw new Error('Impossible de télécharger le support pour le moment.');
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'support'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de télécharger le support pour le moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={download} disabled={loading} className="flex w-full items-center gap-3 rounded-2xl bg-brand-mint p-3 text-left transition hover:bg-brand-sage dark:bg-white/5 dark:hover:bg-white/10">
        <span className="icon-tile h-10 w-10 shrink-0 bg-white dark:bg-white/10"><FileText className="h-5 w-5" aria-hidden="true" /></span>
        <span className="flex-1 text-sm font-medium text-brand-forest">Support PDF</span>
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-brand-muted" aria-hidden="true" /> : <Download className="h-4 w-4 text-brand-muted" aria-hidden="true" />}
      </button>
      {error && <p role="alert" className="mt-2 text-xs text-red-700 dark:text-red-300">{error}</p>}
    </>
  );
}
