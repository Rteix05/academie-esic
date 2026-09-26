import Link from 'next/link';
import { Quote, ArrowUpRight } from 'lucide-react';

// TODO(API) : remplacer temoignagesDemo par l'appel à l'API Symfony (ex: GET /api/temoignages)
const temoignagesDemo = [
  {
    nom: "Ruth M.",
    initiales: "RM",
    formation: "Institut Biblique Théologique",
    citation: "Cette formation a changé ma manière de lire la Bible et de vivre ma foi au quotidien. Chaque enseignement m'a rapprochée de Dieu et de ma vocation.",
  },
  {
    nom: "Samuel K.",
    initiales: "SK",
    formation: "École du Ministère et du Leadership",
    citation: "J'ai appris à conduire avec plus de sagesse et de discernement dans mon ministère. Un encadrement exigeant mais qui porte du fruit.",
  },
  {
    nom: "Naomi T.",
    initiales: "NT",
    formation: "Discipulat",
    citation: "Un accompagnement solide qui m'a aidée à comprendre et à assumer mon appel. Je recommande cette académie à quiconque veut grandir sérieusement dans sa foi.",
  },
  {
    nom: "David A.",
    initiales: "DA",
    formation: "Formation biblique",
    citation: "Des enseignants passionnés et un enseignement biblique rigoureux. J'ai gagné en assurance pour partager ma foi autour de moi.",
  },
];

export default function TemoignagesPage() {
  return (
    <main className="min-h-screen bg-[#FBFBFA] text-[#0F291E] font-sans antialiased overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#0F291E] text-white py-28 px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.04)_1.5px,transparent_1.5px)] bg-[size:26px_26px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#059669]/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-[#059669] text-xs uppercase tracking-[0.2em] font-semibold mb-8">
            <span className="w-8 h-px bg-[#059669]" aria-hidden="true"></span>
            Ils témoignent
            <span className="w-8 h-px bg-[#059669]" aria-hidden="true"></span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-6">
            L&apos;impact de nos formations
          </h1>
          <p className="text-emerald-100/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Des récits d&apos;étudiants qui témoignent de l&apos;impact des formations sur leur parcours personnel, spirituel et ministériel.
          </p>
        </div>
      </section>

      {/* ── GRILLE DES TÉMOIGNAGES ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {temoignagesDemo.map((t, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] p-10 flex flex-col hover:shadow-md hover:shadow-[#0F291E]/5 transition-all duration-300">
              <Quote className="w-6 h-6 text-[#059669] mb-6" />
              <p className="font-display text-lg text-[#0F291E] leading-relaxed mb-8 flex-1 italic">
                &ldquo;{t.citation}&rdquo;
              </p>
              <div className="flex items-center gap-4 border-t border-[#E5E7EB] pt-6">
                <div className="w-10 h-10 bg-[#0F291E] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
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
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#F0FDF4] border-t border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-8 py-20 text-center">
          <p className="text-[#059669] text-xs font-bold uppercase tracking-[0.22em] mb-5">Rejoindre l&apos;aventure</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0F291E] mb-5">
            Écrivez votre propre témoignage
          </h2>
          <p className="text-[#4B5563] text-base max-w-xl mx-auto mb-10 leading-relaxed">
            Rejoignez une communauté de croyants engagés et commencez un parcours de formation qui transformera votre vie.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0F291E] text-[#FBFBFA] text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#059669] hover:text-[#0F291E] transition-all w-full sm:w-auto text-center">
              Rejoindre l&apos;Académie <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link href="/formations" className="inline-flex items-center justify-center px-8 py-4 border border-[#0F291E] text-[#0F291E] text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#F3F4F6] transition-all w-full sm:w-auto text-center">
              Voir les formations
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}


// TODO(API) : remplacer temoignagesDemo par l'appel à l'API Symfony (ex: GET /api/temoignages)
// et par le DTO TypeScript correspondant dès qu'il sera fourni.
