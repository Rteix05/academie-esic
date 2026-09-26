'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users } from 'lucide-react';

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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function EvenementsPage() {
  const [events, setEvents]   = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch((process.env.NEXT_PUBLIC_BACKEND_URL ? process.env.NEXT_PUBLIC_BACKEND_URL + '/api' : '') + '/events', {
      headers: { Accept: 'application/ld+json, application/json' },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(`Erreur ${r.status}`)))
      .then((data) => {
        setEvents(data['hydra:member'] || data['member'] || (Array.isArray(data) ? data : []));
        setLoading(false);
      })
      .catch((err) => { setError(String(err)); setLoading(false); });
  }, []);

  return (
    <main className="min-h-screen bg-[#FBFBFA] text-[#1C2C24] font-sans antialiased">

      {/* Hero */}
      <section className="bg-[#0F291E] text-white py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white/80 text-xs font-bold uppercase tracking-widest rounded-full mb-6 border border-white/20">
            <Calendar className="w-3.5 h-3.5" />
            Agenda
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">Événements & Ateliers</h1>
          <p className="text-emerald-100/70 text-base md:text-lg max-w-2xl mx-auto">
            Sessions en direct, ateliers pratiques et conférences. Inscrivez-vous et rejoignez la communauté E.S.I.C.
          </p>
        </div>
      </section>

      {/* Liste */}
      <section className="max-w-5xl mx-auto px-6 py-20">

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-red-500 text-sm">{error}</div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Aucun événement à venir pour le moment.<br />Repassez très bientôt !</p>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {events.map((ev) => (
            <div key={ev.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row">

              {ev.imageFile || ev.imageUrl ? (
                <div className="w-full md:w-64 flex-shrink-0">
                  <img
                    src={
                      ev.imageFile
                        ? `http://localhost:8000/uploads/images/${ev.imageFile}`
                        : ev.imageUrl!
                    }
                    alt={ev.title}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full md:w-64 flex-shrink-0 bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center h-48 md:h-auto">
                  <Calendar className="w-12 h-12 text-emerald-400/40" />
                </div>
              )}

              <div className="flex flex-col justify-between p-7 flex-1">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${ev.price === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {ev.price === 0 ? 'Gratuit' : `${ev.price.toFixed(2)} €`}
                    </span>
                    {ev.capacity && (
                      <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-gray-500 bg-gray-50 rounded-full uppercase tracking-widest">
                        <Users className="w-3 h-3" /> {ev.capacity} places
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-[#0F291E] mb-3">{ev.title}</h2>
                  <div
                    className="text-sm text-gray-500 line-clamp-2 mb-4"
                    dangerouslySetInnerHTML={{ __html: ev.description }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-50">
                  <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      {formatDate(ev.startDate)} — {formatTime(ev.startDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {ev.location}
                    </span>
                  </div>
                  <Link
                    href={`/evenements/${ev.id}`}
                    className="px-5 py-2.5 bg-[#0F291E] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-emerald-900 transition whitespace-nowrap"
                  >
                    {ev.price === 0 ? "S'inscrire gratuitement" : "Voir & S'inscrire"}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
