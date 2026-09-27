'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Calendar, MapPin, Users, Tag, CheckCircle, Loader2 } from 'lucide-react';
import PaymentSuccessPopup from '@/components/PaymentSuccessPopup';
import { ErrorState, PageHeader, Spinner } from '@/components/ui';
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
    return <Spinner label="Chargement de l'événement…" />;
  }

  if (error && !event) {
    return (
      <div className="container-page py-24">
        <ErrorState message={error} />
        <div className="mt-6 text-center">
          <Link href="/evenements" className="btn-secondary">Retour aux événements</Link>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const isFree = event.price === 0;

  return (
    <div className="pb-8">
      <Suspense fallback={null}>
        <PaymentSuccessPopup />
      </Suspense>

      <PageHeader eyebrow={isFree ? 'Inscription gratuite' : 'Réservation'} title={event.title}>
        <Link href={`/evenements/${id}`} className="btn-ghost">← Retour à l&apos;événement</Link>
      </PageHeader>

      <section className="container-page mt-12">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          {/* Récapitulatif */}
          <div className="card p-7">
            <h2 className="font-display text-lg font-semibold text-brand-forest">Récapitulatif</h2>
            <ul className="mt-5 space-y-4 text-sm text-brand-muted">
              <Row icon={<Calendar className="h-4 w-4" />}>
                <span className="capitalize text-brand-ink">{formatDate(event.startDate)}</span>
                <span className="block text-xs">{formatTime(event.startDate)} – {formatTime(event.endDate)}</span>
              </Row>
              <Row icon={<MapPin className="h-4 w-4" />}>{event.location}</Row>
              {spotsLeft !== null ? (
                <Row icon={<Users className="h-4 w-4" />}>
                  <span className={isFull ? 'font-semibold text-red-600' : ''}>
                    {isFull ? 'Événement complet' : `${spotsLeft} place${spotsLeft > 1 ? 's' : ''} restante${spotsLeft > 1 ? 's' : ''}`}
                  </span>
                </Row>
              ) : event.capacity ? (
                <Row icon={<Users className="h-4 w-4" />}>{event.capacity} places</Row>
              ) : null}
              <Row icon={<Tag className="h-4 w-4" />}>
                <span className="font-display text-base font-semibold text-brand-forest">{isFree ? 'Gratuit' : `${event.price.toFixed(2)} €`}</span>
              </Row>
            </ul>
          </div>

          {isFull && !alreadyRegistered && (
            <Notice tone="red" icon={<Users className="h-6 w-6" />} title="Événement complet">
              Il n&apos;y a plus de places disponibles pour cet événement.
            </Notice>
          )}

          {alreadyRegistered && (
            <Notice tone="green" icon={<CheckCircle className="h-6 w-6" />} title="Vous êtes déjà inscrit !">
              Votre inscription à cet événement est déjà enregistrée.
            </Notice>
          )}

          {success && (
            <div className="card flex flex-col items-center p-10 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                <CheckCircle className="h-8 w-8" aria-hidden="true" />
              </span>
              <p className="mt-4 font-display text-2xl font-semibold text-brand-forest">Inscription confirmée !</p>
              <p className="mt-2 text-sm text-brand-muted">Un email de confirmation vous a été envoyé. À bientôt !</p>
              <Link href="/dashboard" className="btn-primary mt-6">
                Voir mon espace
                <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </Link>
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-700">{error}</p>
          )}

          {!success && !alreadyRegistered && !isFull && (
            <>
              <button onClick={handleRegister} disabled={submitting} className="btn-primary w-full justify-between py-4">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    {isFree ? 'Inscription en cours…' : 'Redirection vers le paiement…'}
                  </span>
                ) : (
                  isFree ? 'Confirmer mon inscription gratuite' : `Procéder au paiement — ${event.price.toFixed(2)} €`
                )}
                <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </button>
              <p className="-mt-2 text-center text-xs text-brand-muted">
                {isFree ? 'Un email de confirmation vous sera envoyé.' : 'Paiement 100 % sécurisé via Stripe.'}
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-mint text-brand-emerald dark:bg-white/5" aria-hidden="true">{icon}</span>
      <span>{children}</span>
    </li>
  );
}

function Notice({ tone, icon, title, children }: { tone: 'red' | 'green'; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  const styles = tone === 'red' ? 'bg-red-50 text-red-700' : 'bg-brand-sage text-brand-forest';
  return (
    <div className={`flex items-center gap-4 rounded-3xl p-6 ${styles}`}>
      <span className="shrink-0" aria-hidden="true">{icon}</span>
      <div>
        <p className="font-display font-semibold">{title}</p>
        <p className="mt-1 text-sm opacity-90">{children}</p>
      </div>
    </div>
  );
}
