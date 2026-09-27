'use client';

import { useState } from 'react';
import { ArrowRight, Mail, MapPin, Check, Clock } from 'lucide-react';
import { PageHeader } from '@/components/ui';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess]       = useState(false);

  // TODO(API) : l'envoi est SIMULÉ — aucun message n'est réellement transmis.
  // À brancher sur un endpoint backend (ex. POST /api/contact) avant la mise en production.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => { setIsSubmitting(false); setIsSuccess(true); }, 1500);
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
              { icon: Mail,   label: 'Email',            value: 'contact@esic.fr' },
              { icon: MapPin, label: 'Localisation',     value: 'Paris, France' },
              { icon: Clock,  label: 'Délai de réponse', value: 'Sous 48 heures ouvrées' },
            ].map(({ icon: Icon, label, value }) => (
              <li key={label} className="card flex items-center gap-4 p-5">
                <span className="icon-tile h-12 w-12 shrink-0"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <span>
                  <span className="block text-xs text-brand-muted">{label}</span>
                  <span className="block font-display font-semibold text-brand-forest">{value}</span>
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
              <p className="mt-2 text-brand-muted">Nous reviendrons vers vous dans les plus brefs délais.</p>
              <button onClick={() => setIsSuccess(false)} className="btn-secondary mt-8">
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-brand-muted">Les champs suivis d'un astérisque (*) sont obligatoires.</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="name">Nom complet<span aria-hidden="true" className="text-red-700 dark:text-red-400"> *</span></label>
                  <input id="name" type="text" required autoComplete="name" className="field" placeholder="Jean Dupont" />
                </div>
                <div>
                  <label className="field-label" htmlFor="email">Email<span aria-hidden="true" className="text-red-700 dark:text-red-400"> *</span></label>
                  <input id="email" type="email" required autoComplete="email" className="field" placeholder="jean@exemple.com" />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="subject">Sujet</label>
                <select id="subject" className="field">
                  <option>Question sur une formation</option>
                  <option>Problème technique</option>
                  <option>Partenariat</option>
                  <option>Autre</option>
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="message">Message<span aria-hidden="true" className="text-red-700 dark:text-red-400"> *</span></label>
                <textarea id="message" required rows={6} className="field resize-none" placeholder="Comment pouvons-nous vous aider ?" />
              </div>

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
