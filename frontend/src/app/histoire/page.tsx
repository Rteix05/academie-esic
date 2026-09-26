import Link from 'next/link';
import type { Metadata } from 'next';
import { BookOpen, Eye, Compass, Quote, Target, CheckCircle2, GraduationCap, Video, CalendarDays, ArrowUpRight, Sparkles, Award, Flame } from 'lucide-react';

export const metadata: Metadata = {
  title: 'À propos — Académie E.S.I.C.',
  description: 'Découvrez la présentation, la vision, la mission et les valeurs chrétiennes de l\'Académie E.S.I.C. — École du Savoir et de l\'Intelligence Chrétienne.',
};

export default function AProposPage() {
  return (
    <main className="min-h-screen bg-[#FBFBFA] text-[#0F291E] font-sans antialiased overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#0F291E] text-white py-28 px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.04)_1.5px,transparent_1.5px)] bg-[size:26px_26px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#059669]/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-[#059669] text-xs uppercase tracking-[0.2em] font-semibold mb-8">
            <span className="w-8 h-px bg-[#059669]" aria-hidden="true"></span>
            École du Savoir et de l&apos;Intelligence Chrétienne
            <span className="w-8 h-px bg-[#059669]" aria-hidden="true"></span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-6">
            À propos de l&apos;Académie
          </h1>
          <p className="text-emerald-100/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Née d&apos;une conviction simple : la foi grandit quand elle est nourrie, questionnée et mise en pratique.
          </p>
        </div>
      </section>

      {/* ── PRÉSENTATION ─────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <p className="text-[#059669] text-xs font-bold uppercase tracking-[0.22em] mb-5">Présentation</p>
        <p className="font-display text-2xl md:text-3xl font-bold text-[#0F291E] leading-relaxed">
          Un centre de formation chrétienne dédié à l&apos;édification des disciples et à la préparation des serviteurs de Dieu.
        </p>
        <p className="text-[#4B5563] text-base md:text-lg mt-6 leading-relaxed max-w-3xl mx-auto">
          Nous formons des hommes et des femmes profondément enracinés dans les Écritures, transformés par le Saint-Esprit et équipés pour impacter l&apos;Église et la société avec sagesse, excellence et intégrité.
        </p>
      </section>

      {/* ── VISION & MISSION ─────────────────────────────────────────────── */}
      <section className="bg-[#F0FDF4] border-y border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-[#E5E7EB] p-10">
            <div className="w-11 h-11 bg-[#F0FDF4] border border-[#E5E7EB] flex items-center justify-center mb-6">
              <Eye className="w-5 h-5 text-[#059669]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[#0F291E] mb-4">Notre vision</h2>
            <p className="text-[#4B5563] leading-relaxed">
              Former une génération de disciples matures et de leaders spirituels capables de transformer leur génération par la puissance de la Parole de Dieu.
            </p>
          </div>
          <div className="bg-white border border-[#E5E7EB] p-10">
            <div className="w-11 h-11 bg-[#F0FDF4] border border-[#E5E7EB] flex items-center justify-center mb-6">
              <Compass className="w-5 h-5 text-[#059669]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[#0F291E] mb-4">Notre mission</h2>
            <p className="text-[#4B5563] leading-relaxed">
              Transmettre un enseignement biblique solide, développer le caractère de Christ et équiper chaque croyant pour accomplir efficacement son appel et son ministère.
            </p>
          </div>
        </div>
      </section>

      {/* ── VERSET FONDATEUR ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <div className="bg-[#0F291E] px-8 py-16 md:px-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.04)_1.5px,transparent_1.5px)] bg-[size:24px_24px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-[#059669]/10 blur-[110px] rounded-full pointer-events-none" />
          <Quote className="w-7 h-7 text-[#059669] mx-auto mb-6 relative z-10" />
          <p className="relative z-10 font-display text-white text-2xl md:text-3xl font-bold leading-snug max-w-2xl mx-auto mb-5 italic">
            « Afin que l&apos;homme de Dieu soit accompli et propre à toute bonne œuvre. »
          </p>
          <p className="relative z-10 text-[#059669] text-xs font-bold uppercase tracking-widest mb-5">2 Timothée 3:17</p>
          <p className="relative z-10 text-emerald-100/60 text-sm max-w-xl mx-auto">
            Ce verset résume l&apos;objectif de l&apos;Académie : former des croyants accomplis, compétents et prêts à servir.
          </p>
        </div>
      </section>

      {/* ── VALEURS ──────────────────────────────────────────────────────── */}
      <section className="bg-[#F0FDF4] border-y border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-8 py-20">
          <div className="text-center mb-14">
            <p className="text-[#059669] text-xs font-bold uppercase tracking-[0.22em] mb-4">Ce qui nous porte</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0F291E]">Nos valeurs chrétiennes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: <BookOpen className="w-5 h-5 text-[#059669]" />, bg: 'bg-[#F0FDF4]', title: 'Fidélité à la Parole de Dieu',   desc: 'La Bible demeure notre référence absolue pour l\'enseignement et la vie chrétienne.' },
              { icon: <Sparkles className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50',   title: 'Transformation du caractère',   desc: 'Le savoir n\'a de valeur que lorsqu\'il produit une vie semblable à celle de Christ.' },
              { icon: <Award    className="w-5 h-5 text-blue-600"  />, bg: 'bg-blue-50',    title: 'Excellence et discipline',      desc: 'Nous servons Dieu avec rigueur, ordre et professionnalisme.' },
              { icon: <Flame    className="w-5 h-5 text-rose-600"  />, bg: 'bg-rose-50',    title: 'Service et impact',             desc: 'Chaque étudiant est formé pour édifier l\'Église et influencer positivement la société.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-5 p-8 bg-white border border-[#E5E7EB] hover:shadow-md hover:shadow-[#0F291E]/5 transition-all duration-300">
                <div className={`w-11 h-11 flex-shrink-0 ${item.bg} border border-[#E5E7EB] flex items-center justify-center`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#0F291E] mb-1">{item.title}</h3>
                  <p className="text-sm text-[#4B5563] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OBJECTIFS ────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <div className="flex items-start gap-5 mb-12">
          <div className="w-11 h-11 flex-shrink-0 bg-[#F0FDF4] border border-[#E5E7EB] flex items-center justify-center">
            <Target className="w-5 h-5 text-[#059669]" />
          </div>
          <div>
            <p className="text-[#059669] text-xs font-bold uppercase tracking-[0.22em] mb-2">Ce que nous visons</p>
            <h2 className="font-display text-3xl font-bold text-[#0F291E]">Nos objectifs</h2>
          </div>
        </div>
        <div className="bg-white border border-[#E5E7EB] p-10">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5 text-sm text-[#4B5563]">
            {[
              'Former des disciples solides dans leur foi et leur connaissance des Écritures.',
              'Préparer des leaders spirituels compétents pour le service du Royaume de Dieu.',
              'Développer une compréhension théologique saine et équilibrée.',
              'Former des ministres capables d\'enseigner, de conduire et de servir avec excellence.',
              'Accompagner chaque étudiant dans la découverte et le développement de son appel.',
              'Favoriser une croissance spirituelle, intellectuelle et pratique durable.',
              'Promouvoir une culture de discipline, d\'intégrité et de responsabilité chrétienne.',
              'Contribuer à l\'expansion du Royaume de Dieu en formant des ouvriers fidèles.',
            ].map((obj, i) => (
              <li key={i} className="flex gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#059669] mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── APPROCHE PÉDAGOGIQUE ─────────────────────────────────────────── */}
      <section className="bg-[#F0FDF4] border-y border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-8 py-20">
          <div className="text-center mb-14">
            <p className="text-[#059669] text-xs font-bold uppercase tracking-[0.22em] mb-4">Comment nous formons</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0F291E]">Notre approche pédagogique</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {[
              { icon: <GraduationCap className="w-5 h-5 text-[#059669]" />, bg: 'bg-[#F0FDF4]', label: 'Formations',   desc: 'Des modules structurés et progressifs pour approfondir la foi étape par étape.' },
              { icon: <Video        className="w-5 h-5 text-amber-600"  />, bg: 'bg-amber-50',   label: 'Masterclass',  desc: 'Des sessions vidéo animées par des intervenants reconnus, à votre rythme.' },
              { icon: <CalendarDays className="w-5 h-5 text-blue-600"  />, bg: 'bg-blue-50',    label: 'Événements',   desc: 'Des temps en présentiel pour vivre la communauté et grandir ensemble.' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] p-8 hover:shadow-md hover:shadow-[#0F291E]/5 transition-all duration-300">
                <div className={`w-10 h-10 ${item.bg} border border-[#E5E7EB] flex items-center justify-center mb-6`}>
                  {item.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-[#0F291E] mb-2">{item.label}</h3>
                <p className="text-xs text-[#4B5563] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-[#4B5563] leading-relaxed max-w-2xl mx-auto text-center">
            Chaque contenu est conçu pour être accessible à votre rythme, sans prérequis particuliers. Que vous soyez nouveau croyant ou serviteur confirmé, l&apos;Académie vous accueille là où vous en êtes.
          </p>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-8 py-24">
        <div className="bg-[#0F291E] px-8 py-20 md:px-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.04)_1.5px,transparent_1.5px)] bg-[size:24px_24px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#059669]/10 blur-[130px] rounded-full pointer-events-none" />
          <h2 className="relative z-10 font-display text-white text-3xl md:text-5xl font-bold leading-tight mb-5">
            Prêt à commencer votre parcours ?
          </h2>
          <p className="relative z-10 text-emerald-100/70 text-base max-w-xl mx-auto mb-12 leading-relaxed">
            Rejoignez l&apos;Académie E.S.I.C. et grandissez dans votre foi au sein d&apos;une communauté engagée.
          </p>
          <div className="relative z-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#059669] text-[#0F291E] text-xs font-bold uppercase tracking-[0.15em] hover:bg-emerald-400 transition-all w-full sm:w-auto text-center">
              Rejoindre l&apos;Académie <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link href="/formations" className="inline-flex items-center justify-center px-8 py-4 border border-white/20 text-white text-xs font-bold uppercase tracking-[0.15em] hover:bg-white/10 transition-all w-full sm:w-auto text-center">
              Voir les formations
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}


