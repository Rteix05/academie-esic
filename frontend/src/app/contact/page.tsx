'use client';

import { useState } from 'react';
import { Mail, MapPin, Check } from 'lucide-react';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess]       = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => { setIsSubmitting(false); setIsSuccess(true); }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#FBFBFA] text-[#0F291E] font-sans antialiased overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#0F291E] text-white py-28 px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.04)_1.5px,transparent_1.5px)] bg-[size:26px_26px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#059669]/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-[#059669] text-xs uppercase tracking-[0.2em] font-semibold mb-8">
            <span className="w-8 h-px bg-[#059669]" aria-hidden="true"></span>
            Nous contacter
            <span className="w-8 h-px bg-[#059669]" aria-hidden="true"></span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-6">
            Comment pouvons-nous vous aider ?
          </h1>
          <p className="text-emerald-100/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Une question sur nos formations, besoin d&apos;aide avec votre compte ou une proposition de partenariat — notre équipe est là pour vous répondre.
          </p>
        </div>
      </section>

      {/* ── CONTENU ──────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

        {/* Informations */}
        <div>
          <p className="text-[#059669] text-xs font-bold uppercase tracking-[0.22em] mb-6">Coordonnées</p>
          <h2 className="font-display text-3xl font-bold text-[#0F291E] mb-8">Écrivez-nous</h2>
          <p className="text-[#4B5563] leading-relaxed mb-12">
            Nous lisons chaque message avec attention et nous nous efforçons de répondre dans les meilleurs délais.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-[#F0FDF4] border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-[#059669]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#4B5563] uppercase tracking-widest mb-1">Email</p>
                <p className="font-bold text-[#0F291E]">contact@esic.fr</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-[#F0FDF4] border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#059669]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#4B5563] uppercase tracking-widest mb-1">Localisation</p>
                <p className="font-bold text-[#0F291E]">Paris, France</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white border border-[#E5E7EB] p-10">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 bg-[#F0FDF4] border border-[#E5E7EB] flex items-center justify-center mb-2">
                <Check className="w-8 h-8 text-[#059669]" />
              </div>
              <h2 className="font-display text-2xl font-bold text-[#0F291E]">Message envoyé !</h2>
              <p className="text-[#4B5563]">Nous reviendrons vers vous dans les plus brefs délais.</p>
              <button
                onClick={() => setIsSuccess(false)}
                className="mt-6 px-6 py-3 border border-[#E5E7EB] text-[#0F291E] text-xs font-bold uppercase tracking-widest hover:bg-[#F0FDF4] transition"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-[#4B5563] uppercase tracking-widest mb-2">Nom complet</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-[#FBFBFA] border border-[#E5E7EB] focus:border-[#059669] focus:ring-0 outline-none text-sm text-[#0F291E] placeholder:text-[#4B5563]/40 transition"
                    placeholder="Jean Dupont"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#4B5563] uppercase tracking-widest mb-2">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 bg-[#FBFBFA] border border-[#E5E7EB] focus:border-[#059669] focus:ring-0 outline-none text-sm text-[#0F291E] placeholder:text-[#4B5563]/40 transition"
                    placeholder="jean@exemple.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#4B5563] uppercase tracking-widest mb-2">Sujet</label>
                <select className="w-full px-4 py-3 bg-[#FBFBFA] border border-[#E5E7EB] focus:border-[#059669] focus:ring-0 outline-none text-sm text-[#0F291E] transition">
                  <option>Question sur une formation</option>
                  <option>Problème technique</option>
                  <option>Partenariat</option>
                  <option>Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#4B5563] uppercase tracking-widest mb-2">Message</label>
                <textarea
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-[#FBFBFA] border border-[#E5E7EB] focus:border-[#059669] focus:ring-0 outline-none text-sm text-[#0F291E] placeholder:text-[#4B5563]/40 resize-none transition"
                  placeholder="Comment pouvons-nous vous aider ?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#0F291E] text-[#FBFBFA] text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#059669] hover:text-[#0F291E] transition disabled:opacity-50"
              >
                {isSubmitting ? 'Envoi en cours…' : 'Envoyer le message'}
              </button>
            </form>
          )}
        </div>

      </div>
    </main>
  );
}


