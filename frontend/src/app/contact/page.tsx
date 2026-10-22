'use client';

import { useState } from 'react';
import { ArrowRight, Mail, MapPin, Check, Clock } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { CONTACT_EMAIL } from '@/lib/contact';
import { apiFetch } from '@/lib/api';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess]       = useState(false);
  const [error, setError]               = useState<string | null>(null);

  // Envoi à l'API : notification à l'Académie + accusé de réception par email au visiteur
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          subject: data.get('subject'),
          message: data.get('message'),
          website: data.get('website'), // champ piège anti-robots, toujours vide pour un humain
        }),
      });
      const body: { message?: string } = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Votre message n'a pas pu être envoyé.");
      form.reset();
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Votre message n'a pas pu être envoyé.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-x-hidden">
      <PageHeader
        eyebrow="Nous contacter"
        title="Comment pouvons-nous vous aider ?"
        lead="Une question sur nos formations, besoin d'aide avec votre compte ou une proposition de partenariat : notre équipe est là pour vous répondre."
      />

      <section className="container-page grid items-start gap-10 py-20 lg:grid-cols-[0.8fr_1.2fr]">
        {/* Coordonnées */}
        <div>
          <span className="eyebrow">Coordonnées</span>
          <h2 className="section-title mt-4">Écrivez-nous</h2>
          <p className="section-lead">Nous lisons chaque message avec attention et nous nous efforçons de répondre dans les meilleurs délais.</p>

          <ul className="mt-10 space-y-4">
            {[
              { icon: Mail,   label: 'Email',            value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
              { icon: MapPin, label: 'Localisation',     value: 'Paris, France' },
              { icon: Clock,  label: 'Délai de réponse', value: 'Sous 48 heures ouvrées' },
            ].map(({ icon: Icon, label, value, href }: { icon: typeof Mail; label: string; value: string; href?: string }) => (
              <li key={label} className="card flex items-center gap-4 p-5">
                <span className="icon-tile h-12 w-12 shrink-0"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <span className="min-w-0">
                  <span className="block text-xs text-brand-muted">{label}</span>
                  {href ? (
                    <a href={href} className="block break-all font-display font-semibold text-brand-forest underline decoration-brand-emerald/40 underline-offset-4 hover:text-brand-emerald dark:text-emerald-100">{value}</a>
                  ) : (
                    <span className="block font-display font-semibold text-brand-forest">{value}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Formulaire */}
        <div className="card p-8 sm:p-10">
          {isSuccess ? (
            <div className="flex flex-col items-center py-10 text-center" role="status">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                <Check className="h-8 w-8" aria-hidden="true" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold text-brand-forest">Message envoyé !</h2>
              <p className="mt-2 text-brand-muted">Un accusé de réception vient de vous être envoyé par email. Nous vous répondrons dans les meilleurs délais.</p>
              <button type="button" onClick={() => setIsSuccess(false)} className="btn-secondary mt-8">
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative space-y-5">
              <p className="text-sm text-brand-muted">Les champs suivis d'un astérisque (*) sont obligatoires.</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="name">Nom complet<span aria-hidden="true" className="text-red-700 dark:text-red-400"> *</span></label>
                  <input id="name" name="name" type="text" required maxLength={100} autoComplete="name" className="field" placeholder="Jean Dupont" />
                </div>
                <div>
                  <label className="field-label" htmlFor="email">Email<span aria-hidden="true" className="text-red-700 dark:text-red-400"> *</span></label>
                  <input id="email" name="email" type="email" required maxLength={180} autoComplete="email" className="field" placeholder="jean@exemple.com" />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="subject">Sujet</label>
                <select id="subject" name="subject" className="field" defaultValue="formation">
                  <option value="formation">Question sur une formation</option>
                  <option value="technique">Problème technique</option>
                  <option value="partenariat">Partenariat</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="message">Message<span aria-hidden="true" className="text-red-700 dark:text-red-400"> *</span></label>
                <textarea id="message" name="message" required minLength={10} maxLength={5000} rows={6} className="field resize-none" placeholder="Comment pouvons-nous vous aider ?" />
              </div>

              {/* Champ piège anti-robots : invisible et ignoré par les humains et les lecteurs d'écran */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="website">Ne pas remplir ce champ</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              {error && (
                <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-900/30 dark:text-red-200">{error}</p>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-between py-4">
                {isSubmitting ? 'Envoi en cours…' : 'Envoyer le message'}
                <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
