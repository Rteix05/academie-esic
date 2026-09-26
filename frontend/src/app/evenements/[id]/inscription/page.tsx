'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, Tag, CheckCircle, Loader2 } from 'lucide-react';
import PaymentSuccessPopup from '@/components/PaymentSuccessPopup';
import { apiFetch } from '@/lib/api';

interface Event {
  id: number;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  capacity: number | null;
  imageFile: string | null;
  imageUrl: string | null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function InscriptionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [event, setEvent]         = useState<Event | null>(null);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);
  const [isFull, setIsFull]       = useState(false);

  useEffect(() => {
    const fetchEvent = apiFetch(`/api/events/${id}`, { headers: { Accept: 'application/ld+json' } })
      .then(r => r.ok ? r.json() : Promise.reject('Événement introuvable.'));

    // Le cookie de session (s'il existe) permet de savoir si l'utilisateur est déjà inscrit
    const fetchStatus = apiFetch(`/api/events/${id}/status`)
      .then(r => r.ok ? r.json() : {}).catch(() => ({} as Record<string, never>));

    Promise.all([fetchEvent, fetchStatus])
      .then(([data, status]: [Event, Partial<{ isRegistered: boolean; spotsLeft: number | null; isFull: boolean }>]) => {
        setEvent(data);
        if (status.isRegistered) setAlreadyRegistered(true);
        if (status.spotsLeft !== undefined && status.spotsLeft !== null) setSpotsLeft(status.spotsLeft);
        if (status.isFull) setIsFull(true);
        setLoading(false);
      })
      .catch(err => { setError(String(err)); setLoading(false); });
  }, [id]);

  const handleRegister = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/events/${id}/register`, { method: 'POST' });
      if (res.status === 401) { router.push('/login'); return; }

      let data: { success?: boolean; url?: string; message?: string; alreadyRegistered?: boolean };
      try { data = await res.json(); } catch { throw new Error('Réponse invalide du serveur.'); }

      if (data.alreadyRegistered) { setAlreadyRegistered(true); return; }
      if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'inscription.');

      // Payant → redirection Stripe
      if (data.url) { window.location.href = data.url; return; }

      // Gratuit → succès
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">{error}</p>
        <Link href="/evenements" className="px-5 py-2.5 bg-[#0F291E] text-white text-xs font-bold uppercase rounded-full">Retour aux événements</Link>
      </div>
    );
  }

  if (!event) return null;

  const isFree = event.price === 0;
  const imageUrl = event.imageFile
    ? `http://localhost:8000/uploads/images/${event.imageFile}`
    : event.imageUrl ?? null;

  return (
    <main className="min-h-screen bg-[#FBFBFA] text-[#1C2C24] font-sans antialiased pb-20">
      <Suspense fallback={null}>
        <PaymentSuccessPopup />
      </Suspense>

      {/* Hero mini */}
      <section className="bg-[#0F291E] text-white py-14 px-6 relative overflow-hidden">
        {imageUrl && (
          <div className="absolute inset-0">
            <img src={imageUrl} alt="" className="w-full h-full object-cover opacity-10" />
          </div>
        )}
        <div className="relative z-10 max-w-3xl mx-auto">
          <Link href={`/evenements/${id}`} className="inline-flex items-center gap-1.5 text-emerald-300/70 text-sm mb-4 hover:text-white transition">
            ← Retour à l'événement
          </Link>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight">{event.title}</h1>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-6">

        {/* Récapitulatif */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#0F291E] mb-4 uppercase tracking-wider">Récapitulatif</h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>
                {formatDate(event.startDate)}<br />
                <span className="text-gray-400">{formatTime(event.startDate)} – {formatTime(event.endDate)}</span>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              {event.location}
            </li>
            {event.capacity && (
              <li className="flex items-center gap-3">
                <Users className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                {event.capacity} places disponibles
              </li>
            )}
            <li className="flex items-center gap-3 font-bold text-[#0F291E]">
              <Tag className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              {isFree ? 'Gratuit' : `${event.price.toFixed(2)} €`}
            </li>
            {spotsLeft !== null && (
              <li className={`flex items-center gap-3 text-sm font-semibold ${isFull ? 'text-red-600' : 'text-gray-600'}`}>
                <Users className="w-4 h-4 flex-shrink-0" />
                {isFull ? 'Événement complet' : `${spotsLeft} place${spotsLeft > 1 ? 's' : ''} restante${spotsLeft > 1 ? 's' : ''}`}
              </li>
            )}
          </ul>
        </div>

        {/* Événement complet */}
        {isFull && !alreadyRegistered && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
            <Users className="w-7 h-7 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-red-700">Événement complet</p>
              <p className="text-sm text-red-600 mt-1">Il n'y a plus de places disponibles pour cet événement.</p>
            </div>
          </div>
        )}

        {/* État : déjà inscrit */}
        {alreadyRegistered && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center gap-4">
            <CheckCircle className="w-7 h-7 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-800">Vous êtes déjà inscrit !</p>
              <p className="text-sm text-emerald-700 mt-1">Votre inscription à cet événement est déjà enregistrée.</p>
            </div>
          </div>
        )}

        {/* État : succès inscription gratuite */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
            <div>
              <p className="text-xl font-black text-emerald-800">Inscription confirmée !</p>
              <p className="text-sm text-emerald-700 mt-1">Un email de confirmation vous a été envoyé. À bientôt !</p>
            </div>
            <Link href="/dashboard" className="mt-2 px-6 py-3 bg-[#0F291E] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-emerald-900 transition">
              Voir mon espace
            </Link>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Bouton d'action */}
        {!success && !alreadyRegistered && !isFull && (
          <button
            onClick={handleRegister}
            disabled={submitting}
            className={`w-full py-4 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition shadow-md ${
              submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0F291E] hover:bg-emerald-900'
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {isFree ? 'Inscription en cours...' : 'Redirection vers le paiement...'}
              </span>
            ) : (
              isFree ? "Confirmer mon inscription gratuite" : `Procéder au paiement — ${event.price.toFixed(2)} €`
            )}
          </button>
        )}

        {!success && !alreadyRegistered && !isFull && (
          <p className="text-xs text-center text-gray-400">
            {isFree ? 'Un email de confirmation vous sera envoyé.' : 'Paiement 100 % sécurisé via Stripe.'}
          </p>
        )}

      </section>
    </main>
  );
}
