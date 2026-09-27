'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Award, Clock, GraduationCap, Play } from 'lucide-react';
import { ErrorState, Spinner } from '@/components/ui';
import { apiFetch } from '@/lib/api';

interface Formation {
  id: number;
  title: string;
  description: string;
  duration: string;
  level: string;
  category: string;
}

export default function SalleDeCoursPage() {
  const router = useRouter();
  const params = useParams(); // Permet de récupérer l'ID dans l'URL
  const formationId = params.id;

  const [formation, setFormation] = useState<Formation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Accès réservé aux élèves qui possèdent la formation (session via cookie httpOnly)
    apiFetch('/api/mes-formations')
      .then(async (res) => {
        if (res.status === 401) { router.push('/login'); return Promise.reject(null); }
        const owned: { id: number }[] = res.ok ? await res.json() : [];
        if (!owned.some((f) => f.id === Number(formationId))) {
          throw new Error("Vous n'avez pas accès à ce cours.");
        }

        // 2. On récupère les détails de CETTE formation précise
        const detail = await apiFetch(`/api/formations/${formationId}`, {
          headers: { Accept: 'application/ld+json, application/json' },
        });
        if (!detail.ok) throw new Error("Impossible de charger le contenu de ce cours.");
        return detail.json();
      })
      .then((data) => {
        setFormation(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!err) return; // redirection vers /login déjà lancée
        setError(err.message);
        setIsLoading(false);
      });
  }, [formationId, router]);

  if (isLoading) {
    return <Spinner label="Chargement de votre salle de cours…" />;
  }

  if (error || !formation) {
    return (
      <div className="container-page py-24">
        <ErrorState message={error || 'Cours introuvable'} />
        <div className="mt-6 text-center">
          <Link href="/dashboard" className="btn-secondary">Retour à mon espace</Link>
        </div>
      </div>
    );
  }

  const chapitres = [
    { titre: 'Introduction et fondamentaux', actif: true },
    { titre: 'Mise en pratique', actif: false },
    { titre: 'Validation des acquis', actif: false },
  ];

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
          {/* Lecteur (à venir) */}
          <div className="relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-4xl bg-brand-forest shadow-float">
            <div aria-hidden="true" className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
            <div aria-hidden="true" className="absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-brand-emerald/20" />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm">
              <Play className="ml-1 h-8 w-8" aria-hidden="true" />
            </span>
            <p className="relative mt-4 font-display text-sm font-medium text-emerald-100/80">Lecteur vidéo bientôt disponible</p>
          </div>

          <div className="card p-7 sm:p-9">
            <h2 className="font-display text-xl font-semibold text-brand-forest">À propos de ce module</h2>
            <div className="rich-text mt-4" dangerouslySetInnerHTML={{ __html: formation.description }} />
          </div>
        </div>

        {/* Plan du cursus */}
        <aside className="card p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-lg font-semibold text-brand-forest">Plan du cursus</h2>
          <ol className="mt-5 space-y-2">
            {chapitres.map((c, i) => (
              <li key={c.titre} className={`flex items-center gap-3 rounded-2xl p-3 ${c.actif ? 'bg-brand-mint dark:bg-white/5' : ''}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold ${c.actif ? 'bg-brand-forest text-white' : 'bg-gray-100 text-brand-muted dark:bg-white/5'}`}>
                  {i + 1}
                </span>
                <span>
                  <span className="block text-xs text-brand-muted">Chapitre {i + 1}</span>
                  <span className={`block text-sm ${c.actif ? 'font-semibold text-brand-forest' : 'text-brand-ink'}`}>{c.titre}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-6 border-t border-brand-forest/5 pt-6 dark:border-white/10">
            <button disabled className="btn w-full bg-gray-100 py-3 text-brand-muted dark:bg-white/5">
              <Award className="h-4 w-4" aria-hidden="true" /> Obtenir mon certificat
            </button>
            <p className="mt-2 text-center text-xs text-brand-muted">Disponible à la fin du cursus</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
