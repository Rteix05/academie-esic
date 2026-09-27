import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, Tag, Clock } from 'lucide-react';
import type { Metadata } from 'next';
import EventInscriptionButton from '@/components/EventInscriptionButton';
import { SERVER_API_URL, uploadUrl } from '@/lib/api';

export const dynamic = 'force-dynamic';

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

interface EventStatus {
  totalRegistered: number;
  spotsLeft: number | null;
  isFull: boolean;
  capacity: number | null;
}

// Rendu côté serveur : adresse interne du backend (cf. SERVER_API_URL)
async function getEvent(id: string): Promise<Event | null> {
  try {
    const res = await fetch(`${SERVER_API_URL}/api/events/${id}`, { cache: 'no-store', headers: { Accept: 'application/ld+json' } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getEventStatus(id: string): Promise<EventStatus> {
  const fallback = { totalRegistered: 0, spotsLeft: null, isFull: false, capacity: null };
  try {
    const res = await fetch(`${SERVER_API_URL}/api/events/${id}/status`, { cache: 'no-store' });
    return res.ok ? res.json() : fallback;
  } catch {
    return fallback;
  }
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const formatTime = (d: string) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const ev = await getEvent(id);
  return { title: ev ? ev.title : 'Événement introuvable' };
}

export default async function EvenementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ev, status] = await Promise.all([getEvent(id), getEventStatus(id)]);
  if (!ev) notFound();

  const isFree = ev.price === 0;
  const durationH = Math.round((new Date(ev.endDate).getTime() - new Date(ev.startDate).getTime()) / 36e5);
  const image = ev.imageFile ? uploadUrl(ev.imageFile) : ev.imageUrl;

  const places = status.isFull
    ? 'Complet'
    : status.spotsLeft !== null
      ? `${status.spotsLeft} place${status.spotsLeft > 1 ? 's' : ''} restante${status.spotsLeft > 1 ? 's' : ''}`
      : `${ev.capacity} places`;

  return (
    <div className="pb-8">
      {/* En-tête */}
      <section className="container-page pt-4">
        <div className="relative overflow-hidden rounded-5xl bg-brand-mint px-6 py-12 sm:px-12 sm:py-16 dark:bg-[#10231a]">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-sage/60 dark:bg-emerald-400/5" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-2 text-sm text-brand-muted">
                <Link href="/evenements" className="font-medium transition hover:text-brand-emerald">Événements</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page" className="max-w-[260px] truncate font-medium text-brand-forest">{ev.title}</span>
              </nav>
              <span className={`chip mt-8 ${isFree ? 'bg-white dark:bg-white/5' : 'bg-amber-100 text-amber-800'}`}>
                {isFree ? 'Gratuit' : `${ev.price.toFixed(2)} €`}
              </span>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-brand-forest sm:text-5xl">{ev.title}</h1>
              <p className="mt-6 flex items-center gap-2 text-sm text-brand-muted">
                <MapPin className="h-4 w-4 text-brand-emerald" aria-hidden="true" /> {ev.location}
              </p>
            </div>
            {image && (
              <div className="hidden overflow-hidden rounded-4xl shadow-float lg:block">
                <img src={image} alt="" className="h-64 w-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container-page mt-12 grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        {/* Description */}
        <div className="card p-7 sm:p-9 lg:col-span-2">
          <h2 className="font-display text-xl font-semibold text-brand-forest">À propos de cet événement</h2>
          <div className="rich-text mt-4" dangerouslySetInnerHTML={{ __html: ev.description }} />
        </div>

        {/* Informations + inscription */}
        <aside className="card flex flex-col gap-6 p-6 lg:sticky lg:top-28">
          <ul className="space-y-4 text-sm text-brand-muted">
            <InfoRow icon={<Calendar className="h-4 w-4" />}>
              <span className="capitalize text-brand-ink">{formatDate(ev.startDate)}</span>
              <span className="block text-xs">{formatTime(ev.startDate)} – {formatTime(ev.endDate)}</span>
            </InfoRow>
            {durationH > 0 && <InfoRow icon={<Clock className="h-4 w-4" />}>{durationH} heure{durationH > 1 ? 's' : ''}</InfoRow>}
            <InfoRow icon={<MapPin className="h-4 w-4" />}>{ev.location}</InfoRow>
            {ev.capacity && (
              <InfoRow icon={<Users className="h-4 w-4" />}>
                <span className={status.isFull ? 'font-semibold text-red-600' : ''}>{places}</span>
              </InfoRow>
            )}
            <InfoRow icon={<Tag className="h-4 w-4" />}>
              <span className="font-display text-base font-semibold text-brand-forest">{isFree ? 'Gratuit' : `${ev.price.toFixed(2)} €`}</span>
            </InfoRow>
          </ul>

          {/* Composant client : vérifie l'inscription et la capacité en direct */}
          <EventInscriptionButton eventId={ev.id} price={ev.price} isFull={status.isFull} />
          <p className="-mt-2 text-center text-xs text-brand-muted">Un compte est requis pour s&apos;inscrire.</p>
        </aside>
      </section>
    </div>
  );
}

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-mint text-brand-emerald dark:bg-white/5" aria-hidden="true">{icon}</span>
      <span>{children}</span>
    </li>
  );
}
