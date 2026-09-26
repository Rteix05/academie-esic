import Link from 'next/link';
import { ArrowUpRight, BookOpen, Heart, Flame, Quote, Feather, Award } from 'lucide-react';

// TODO(API) : données de démonstration — remplacer par des appels API réels
const temoignagesDemo = [
  { nom: "Ruth M.", formation: "Institut Biblique Théologique", initiales: "RM", citation: "Cette formation a changé ma manière de lire la Bible et de vivre ma foi au quotidien." },
  { nom: "Samuel K.", formation: "École du Ministère et du Leadership", initiales: "SK", citation: "J'ai appris à conduire avec plus de sagesse et de discernement dans mon ministère." },
  { nom: "Naomi T.", formation: "Discipulat", initiales: "NT", citation: "Un accompagnement solide qui m'a aidée à comprendre et à assumer mon appel." },
];

const actualitesDemo = [
  { date: "Septembre 2026", titre: "Ouverture des inscriptions pour la nouvelle session", resume: "Les inscriptions pour l'Institut Biblique Théologique et l'École du Ministère sont désormais ouvertes." },
  { date: "Août 2026", titre: "Nouvelle formation en Leadership chrétien", resume: "Un nouveau programme dédié à la formation de leaders spirituels compétents fait son entrée à l'Académie." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen text-[#0F291E] font-sans antialiased overflow-x-hidden">

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#FBFBFA]">
        <div className="max-w-7xl mx-auto px-8 pt-24 pb-20 md:pt-32 md:pb-28 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">

          {/* Colonne texte */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-3 text-[#059669] text-xs uppercase tracking-[0.2em] font-semibold mb-8">
              <span className="w-8 h-px bg-[#059669]" aria-hidden="true"></span>
              École du Savoir et de l&apos;Intelligence Chrétienne
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-[#0F291E] leading-[1.1] mb-8 w-full">
              Former des disciples accomplis, prêts à{' '}
              <em className="text-[#059669] not-italic">servir avec excellence.</em>
            </h1>

            <p className="text-[#4B5563] text-base md:text-lg max-w-xl mb-6 leading-relaxed">
              L&apos;Académie ESIC est un centre de formation chrétienne dédié à l&apos;édification des disciples et à la préparation des serviteurs de Dieu. Nous formons des hommes et des femmes enracinés dans les Écritures, transformés par le Saint-Esprit et équipés pour impacter l&apos;Église et la société.
            </p>

            <p className="text-xs font-semibold text-[#0F291E] max-w-lg mb-12 leading-relaxed uppercase tracking-[0.12em] border-l-2 border-[#059669] pl-4">
              Former une génération de disciples matures et de leaders spirituels capables de transformer leur génération par la puissance de la Parole de Dieu.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-3 w-full sm:w-auto">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0F291E] text-[#FBFBFA] text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#059669] hover:text-[#0F291E] transition-all w-full sm:w-auto text-center">
                S&apos;inscrire <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link href="/formations" className="inline-flex items-center justify-center px-8 py-4 border border-[#0F291E] text-[#0F291E] text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#F3F4F6] transition-all w-full sm:w-auto text-center">
                Découvrir nos formations
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 border border-[#E5E7EB] text-[#4B5563] text-xs font-bold uppercase tracking-[0.15em] hover:border-[#059669] hover:text-[#059669] transition-all w-full sm:w-auto text-center">
                Nous contacter
              </Link>
            </div>
          </div>

          {/* Colonne visuelle */}
          <div className="relative hidden lg:block h-[480px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(184,146,74,0.10)_1.5px,transparent_1.5px)] bg-[size:22px_22px] rounded-2xl"></div>

            <div className="absolute top-24 right-0 w-64 bg-[#0F291E] p-8 rounded-2xl shadow-2xl -rotate-2 hover:rotate-0 transition-transform duration-300 z-10">
              <Quote className="w-5 h-5 text-[#059669] mb-4" />
              <p className="font-display text-[#F0FDF4] text-sm leading-relaxed mb-4 italic">
                « Afin que l&apos;homme de Dieu soit accompli et propre à toute bonne œuvre. »
              </p>
              <p className="text-[#059669] text-[10px] font-bold uppercase tracking-widest">2 Timothée 3:17</p>
            </div>

            <div className="absolute top-6 left-2 w-52 bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-lg -rotate-6 hover:rotate-0 transition-transform duration-300">
              <div className="w-9 h-9 rounded-lg bg-[#F0FDF4] flex items-center justify-center mb-4">
                <BookOpen className="w-4 h-4 text-[#059669]" />
              </div>
              <p className="text-sm font-bold text-[#0F291E] mb-1">Études Bibliques</p>
              <p className="text-xs text-[#4B5563]">Ancrées dans les Écritures</p>
            </div>

            <div className="absolute bottom-16 left-16 w-48 bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="w-9 h-9 rounded-lg bg-[#F0FDF4] flex items-center justify-center mb-4">
                <Heart className="w-4 h-4 text-[#059669]" />
              </div>
              <p className="text-sm font-bold text-[#0F291E] mb-1">Vie de Disciple</p>
              <p className="text-xs text-[#4B5563]">Un caractère transformé</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. VERSET ───────────────────────────────────────────────────────── */}
      <section className="bg-[#F0FDF4] py-20">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="h-px w-12 bg-[#059669]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
            <span className="h-px w-12 bg-[#059669]"></span>
          </div>
          <p className="font-display text-2xl md:text-3xl text-[#0F291E] font-bold leading-snug italic mb-6">
            « Afin que l&apos;homme de Dieu soit accompli et propre à toute bonne œuvre. »
          </p>
          <p className="text-[#059669] text-xs font-bold uppercase tracking-[0.22em]">2 Timothée 3:17</p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className="h-px w-12 bg-[#059669]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
            <span className="h-px w-12 bg-[#059669]"></span>
          </div>
        </div>
      </section>

      {/* ── 3. VALEURS ──────────────────────────────────────────────────────── */}
      <section className="bg-[#FBFBFA] py-24">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-14">
            <p className="text-[#059669] text-xs font-bold uppercase tracking-[0.22em] mb-3">Nos valeurs</p>
            <h2 className="font-display text-4xl font-bold text-[#0F291E]">Ce qui nous guide</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#E5E7EB]">
            {[
              { icon: <BookOpen className="w-5 h-5 text-[#059669]" />, titre: "Fidélité à la Parole", desc: "La Bible demeure notre référence absolue pour l'enseignement et la vie chrétienne." },
              { icon: <Feather  className="w-5 h-5 text-[#059669]" />, titre: "Transformation",      desc: "Le savoir n'a de valeur que lorsqu'il produit une vie semblable à celle de Christ." },
              { icon: <Award    className="w-5 h-5 text-[#059669]" />, titre: "Excellence",          desc: "Nous servons Dieu avec rigueur, ordre et professionnalisme." },
              { icon: <Flame    className="w-5 h-5 text-[#059669]" />, titre: "Service & Impact",    desc: "Chaque étudiant est formé pour édifier l'Église et influencer la société." },
            ].map((v, i) => (
              <div key={i} className="bg-white p-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-[#F0FDF4] flex items-center justify-center mb-5">
                  {v.icon}
                </div>
                <p className="font-display text-base font-bold text-[#0F291E] mb-3">{v.titre}</p>
                <p className="text-xs text-[#4B5563] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FORMATIONS À LA UNE ──────────────────────────────────────────── */}
      <section className="bg-[#F0FDF4] py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <p className="text-[#059669] text-xs font-bold uppercase tracking-[0.22em] mb-3">Formations à la une</p>
              <h2 className="font-display text-4xl font-bold text-[#0F291E]">Explorez nos parcours d&apos;édification</h2>
            </div>
            <Link href="/formations" className="text-xs font-bold text-[#0F291E] uppercase tracking-wider border-b border-[#0F291E] pb-0.5 hover:text-[#059669] hover:border-[#059669] transition whitespace-nowrap">
              Voir toutes les formations →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: "1", icon: <BookOpen className="w-5 h-5 text-[#059669]" />, titre: "Formation Biblique",          desc: "Plongez dans les Écritures pour en comprendre le contexte historique, spirituel et prophétique." },
              { id: "2", icon: <Heart    className="w-5 h-5 text-[#059669]" />, titre: "Famille & Vie Chrétienne",   desc: "Gérer ses relations, son foyer et son éthique selon le cœur de Dieu." },
              { id: "3", icon: <Flame    className="w-5 h-5 text-[#059669]" />, titre: "Discipulat & Engagement",    desc: "Répondre à son appel, fortifier ses dons et servir sa communauté avec zèle." },
              { id: "4", icon: <Award    className="w-5 h-5 text-[#059669]" />, titre: "Leadership Chrétien",        desc: "Former des leaders spirituels compétents, intègres et servants." },
            ].map((f, i) => (
              <Link href={`/formations/${f.id}`} key={i} className="group bg-white border border-[#E5E7EB] p-8 flex flex-col hover:shadow-lg hover:shadow-[#0F291E]/6 transition-all duration-300">
                <div className="w-10 h-10 bg-[#F0FDF4] flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="font-display text-base font-bold text-[#0F291E] mb-3">{f.titre}</h3>
                <p className="text-xs text-[#4B5563] leading-relaxed mb-6 flex-1">{f.desc}</p>
                <span className="text-[11px] font-bold text-[#059669] uppercase tracking-wider inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  En savoir plus <ArrowUpRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. TÉMOIGNAGES ──────────────────────────────────────────────────── */}
      <section className="bg-[#FBFBFA] py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <p className="text-[#059669] text-xs font-bold uppercase tracking-[0.22em] mb-3">Ils témoignent</p>
              <h2 className="font-display text-4xl font-bold text-[#0F291E]">L&apos;impact de nos formations</h2>
            </div>
            <Link href="/temoignages" className="text-xs font-bold text-[#0F291E] uppercase tracking-wider border-b border-[#0F291E] pb-0.5 hover:text-[#059669] hover:border-[#059669] transition whitespace-nowrap">
              Voir tous les témoignages →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {temoignagesDemo.map((t, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] p-8 flex flex-col hover:shadow-lg hover:shadow-[#0F291E]/6 transition-all duration-300">
                <Quote className="w-5 h-5 text-[#059669] mb-5" />
                <p className="text-sm text-[#4B5563] leading-relaxed mb-8 flex-1 font-display italic">&ldquo;{t.citation}&rdquo;</p>
                <div className="flex items-center gap-3 border-t border-[#F3F4F6] pt-5">
                  <div className="w-9 h-9 bg-[#0F291E] flex items-center justify-center text-[#F0FDF4] text-xs font-bold shrink-0">
                    {t.initiales}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F291E]">{t.nom}</p>
                    <p className="text-xs text-[#4B5563]">{t.formation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. ACTUALITÉS ───────────────────────────────────────────────────── */}
      <section className="bg-[#F0FDF4] py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <p className="text-[#059669] text-xs font-bold uppercase tracking-[0.22em] mb-3">À la une</p>
              <h2 className="font-display text-4xl font-bold text-[#0F291E]">Actualités de l&apos;Académie</h2>
            </div>
            <Link href="/actualites" className="text-xs font-bold text-[#0F291E] uppercase tracking-wider border-b border-[#0F291E] pb-0.5 hover:text-[#059669] hover:border-[#059669] transition whitespace-nowrap">
              Toutes les actualités →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actualitesDemo.map((a, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] p-8 hover:shadow-lg hover:shadow-[#0F291E]/6 transition-all duration-300">
                <p className="text-[#059669] text-xs font-bold uppercase tracking-[0.2em] mb-4">{a.date}</p>
                <h3 className="font-display text-xl font-bold text-[#0F291E] mb-3">{a.titre}</h3>
                <p className="text-sm text-[#4B5563] leading-relaxed">{a.resume}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CTA FINAL ────────────────────────────────────────────────────── */}
      <section className="bg-[#0F291E] py-24">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <p className="text-[#059669] text-xs font-bold uppercase tracking-[0.22em] mb-5">Rejoignez-nous</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[#F0FDF4] leading-tight mb-6">
            Prêt à grandir dans votre marche avec Dieu ?
          </h2>
          <p className="text-[#A7F3D0]/70 text-base max-w-xl mx-auto mb-12 leading-relaxed">
            Rejoignez une communauté d&apos;étudiants engagés et commencez votre parcours de formation dès aujourd&apos;hui.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/register" className="inline-flex items-center gap-2 px-10 py-4 bg-[#059669] text-[#0F291E] text-xs font-bold uppercase tracking-[0.18em] hover:bg-[#D4AF6B] transition-all w-full sm:w-auto justify-center">
              S&apos;inscrire maintenant <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center px-10 py-4 border border-[#059669]/40 text-[#A7F3D0] text-xs font-bold uppercase tracking-[0.18em] hover:border-[#059669] hover:text-[#D4AF6B] transition-all w-full sm:w-auto text-center">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}


