import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, Tag, Clock } from 'lucide-react';
import type { Metadata } from 'next';
import EventInscriptionButton from '@/components/EventInscriptionButton';

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

async function getEvent(id: string): Promise<Event | null> {
  try {
    const res = await fetch((process.env.NEXT_PUBLIC_BACKEND_URL ? process.env.NEXT_PUBLIC_BACKEND_URL + '/api' : '') + `/events/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getEventStatus(id: string): Promise<EventStatus> {
  try {
    const res = await fetch(`http://localhost:8000/api/events/${id}/status`, { cache: 'no-store' });
    if (!res.ok) return { totalRegistered: 0, spotsLeft: null, isFull: false, capacity: null };
    return res.json();
  } catch {
    return { totalRegistered: 0, spotsLeft: null, isFull: false, capacity: null };
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const ev = await getEvent(id);
  return { title: ev ? `${ev.title} — Académie E.S.I.C.` : 'Événement introuvable' };
}

export default async function EvenementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ev, status] = await Promise.all([getEvent(id), getEventStatus(id)]);
  if (!ev) notFound();

  const isFree = ev.price === 0;
  const durationMs = new Date(ev.endDate).getTime() - new Date(ev.startDate).getTime();
  const durationH  = Math.round(durationMs / 36e5);

  return (
    <main className="min-h-screen bg-[#FBFBFA] text-[#1C2C24] font-sans antialiased">

      {/* Hero */}
      <section className="bg-[#0F291E] text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        {(ev.imageFile || ev.imageUrl) && (
          <div className="absolute inset-0">
            <img
              src={ev.imageFile ? `http://localhost:8000/uploads/images/${ev.imageFile}` : ev.imageUrl!}
              alt=""
              className="w-full h-full object-cover opacity-10"
            />
          </div>
        )}
        <div className="relative z-10 max-w-4xl mx-auto">
          <Link href="/evenements" className="inline-flex items-center gap-1.5 text-emerald-300/70 text-sm mb-6 hover:text-white transition">
            ← Tous les événements
          </Link>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full ${isFree ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
              {isFree ? 'Gratuit' : `${ev.price.toFixed(2)} €`}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">{ev.title}</h1>
          <p className="text-emerald-100/60 flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" /> {ev.location}
          </p>
        </div>
      </section>

      {/* Contenu */}
      <section className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Description */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-[#0F291E] mb-4">À propos de cet événement</h2>
          <div
            className="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: ev.description }}
          />
        </div>

        {/* Sidebar — infos + inscription */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#0F291E] mb-4">Informations</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>{formatDate(ev.startDate)}<br /><span className="text-gray-400">{formatTime(ev.startDate)} – {formatTime(ev.endDate)}</span></span>
              </li>
              {durationH > 0 && (
                <li className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  {durationH} heure{durationH > 1 ? 's' : ''}
                </li>
              )}
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                {ev.location}
              </li>
              {ev.capacity && (
                <li className={`flex items-center gap-2.5 font-semibold ${status.isFull ? 'text-red-600' : 'text-gray-600'}`}>
                  <Users className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  {status.isFull
                    ? 'Complet'
                    : status.spotsLeft !== null
                      ? `${status.spotsLeft} place${status.spotsLeft > 1 ? 's' : ''} restante${status.spotsLeft > 1 ? 's' : ''}`
                      : `${ev.capacity} places`}
                </li>
              )}
              <li className="flex items-center gap-2.5 font-bold text-[#0F291E]">
                <Tag className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                {isFree ? 'Gratuit' : `${ev.price.toFixed(2)} €`}
              </li>
            </ul>
          </div>

          {/* Bouton inscription — client component (vérifie isRegistered + isFull) */}
          <EventInscriptionButton eventId={ev.id} price={ev.price} isFull={status.isFull} />
          <p className="text-xs text-gray-400 text-center">Un compte est requis pour s'inscrire.</p>
        </div>
      </section>
    </main>
  );
}
