import { Calendar } from 'lucide-react';

// TODO(API) : remplacer actualitesDemo par l'appel à l'API Symfony (ex: GET /api/actualites)
// et par le DTO TypeScript correspondant dès qu'il sera fourni.

const actualitesDemo = [
  {
    date: "Septembre 2026",
    titre: "Ouverture des inscriptions pour la nouvelle session",
    resume:
      "Les inscriptions pour l'Institut Biblique Théologique et l'École du Ministère sont désormais ouvertes. Places limitées pour un accompagnement de qualité.",
  },
  {
    date: "Août 2026",
    titre: "Nouvelle formation en Leadership chrétien",
    resume:
      "Un nouveau programme dédié à la formation de leaders spirituels compétents fait son entrée à l'Académie dès la rentrée.",
  },
  {
    date: "Juillet 2026",
    titre: "Session de graduation 2026",
    resume:
      "Retour en images sur la cérémonie de graduation qui a célébré l'engagement de nos étudiants tout au long de l'année.",
  },
];

export default function ActualitesPage() {
  return (
    <main className="min-h-screen bg-[#FBFBFA] text-[#1C2C24] font-sans antialiased overflow-x-hidden">

      {/* EN-TÊTE */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center">
        <h2 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">À la une</h2>
        <h1 className="text-4xl sm:text-5xl font-black text-[#0F291E] tracking-tight mb-6">
          Actualités de l&apos;Académie
        </h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Suivez les dernières nouvelles, sessions et temps forts de l&apos;Académie E.S.I.C.
        </p>
      </section>

      {/* LISTE DES ACTUALITÉS */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        {/* TODO(API) : remplacer actualitesDemo par les actualités renvoyées par l'API */}
        <div className="flex flex-col gap-6">
          {actualitesDemo.map((a, i) => (
            <article key={i} className="p-8 rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-widest md:w-40 shrink-0">
                <Calendar className="w-4 h-4" />
                {a.date}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0F291E] mb-2">{a.titre}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{a.resume}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

    </main>
  );
}