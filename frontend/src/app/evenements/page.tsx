'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { apiFetch, uploadUrl } from '@/lib/api';
import { EmptyState, ErrorState, PageHeader, Spinner } from '@/components/ui';

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  capacity: number | null;
  imageUrl: string | null;
  imageFile: string | null;
}

const day   = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit' });
const month = (d: string) => new Date(d).toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
const longDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const time  = (d: string) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export default function EvenementsPage() {
  const [events, setEvents]   = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    apiFetch('/api/events', { headers: { Accept: 'application/ld+json, application/json' } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Erreur serveur (${r.status})`))))
      .then((data) => setEvents(data['hydra:member'] || data['member'] || (Array.isArray(data) ? data : [])))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="overflow-x-hidden">
      <PageHeader
        eyebrow="Agenda"
        title="Événements & ateliers"
        lead="Sessions en direct, ateliers pratiques et conférences. Inscrivez-vous et rejoignez la communauté E.S.I.C."
      />

      <section className="container-page py-16">
        {loading && <Spinner label="Chargement des événements…" />}
        {error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && events.length === 0 && (
          <EmptyState icon={<Calendar className="h-6 w-6" />} title="Aucun événement à venir">
            Repassez très bientôt !
          </EmptyState>
        )}

        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          {events.map((ev) => {
            const image = ev.imageFile ? uploadUrl(ev.imageFile) : ev.imageUrl;
            return (
              <article key={ev.id} className="card-hover group relative flex flex-col gap-6 p-4 md:flex-row md:items-stretch">
                {/* Visuel + date */}
                <div className="relative h-52 w-full shrink-0 overflow-hidden rounded-3xl bg-brand-forest md:h-auto md:w-72">
                  {image ? (
                    <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <>
                      <div aria-hidden="true" className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
                      <div aria-hidden="true" className="absolute -bottom-10 -right-6 h-36 w-36 rounded-full bg-brand-emerald/25" />
                    </>
                  )}
                  <div className="absolute left-4 top-4 flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-white text-center shadow-card">
                    <span className="font-display text-xl font-semibold leading-none text-brand-forest">{day(ev.startDate)}</span>
                    <span className="mt-1 text-[11px] font-medium uppercase text-brand-emerald">{month(ev.startDate)}</span>
                  </div>
                </div>

                {/* Détails */}
                <div className="flex flex-1 flex-col justify-between gap-5 p-2 md:py-4 md:pr-4">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`chip ${ev.price === 0 ? 'bg-brand-sage' : 'bg-amber-100 text-amber-800'}`}>
                        {ev.price === 0 ? 'Gratuit' : `${ev.price.toFixed(2)} €`}
                      </span>
                      {ev.capacity && (
                        <span className="chip"><Users className="h-3.5 w-3.5" aria-hidden="true" /> {ev.capacity} places</span>
                      )}
                    </div>
                    <h2 className="mt-4 font-display text-xl font-semibold text-brand-forest transition-colors group-hover:text-brand-emerald">
                      <Link href={`/evenements/${ev.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">{ev.title}</Link>
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brand-muted">
                      {(ev.description || '').replace(/<[^>]*>/g, '').trim()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <ul className="space-y-1.5 text-sm text-brand-muted">
                      <li className="flex items-center gap-2 capitalize"><Calendar className="h-4 w-4 text-brand-emerald" aria-hidden="true" /> {longDate(ev.startDate)}</li>
                      <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand-emerald" aria-hidden="true" /> {time(ev.startDate)}</li>
                      <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-emerald" aria-hidden="true" /> {ev.location}</li>
                    </ul>
                    <span className="btn-primary pointer-events-none shrink-0" aria-hidden="true">
                      {ev.price === 0 ? "S'inscrire" : 'Voir & réserver'}
                      <span className="btn-icon"><ArrowRight className="h-4 w-4" /></span>
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
