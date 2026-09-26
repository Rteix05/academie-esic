import { notFound } from 'next/navigation';
import PaywallGate from '@/components/PaywallGate';

export const dynamic = 'force-dynamic';

async function getMasterclass(id: string) {
  try {
    const res = await fetch(`http://localhost:8000/api/masterclasses/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function MasterclassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mc = await getMasterclass(id);

  if (!mc) notFound();

  return (
    <main className="min-h-screen bg-[#FBFBFA] text-[#1C2C24] font-sans antialiased">

      {/* Hero */}
      <section className="bg-[#0F291E] text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest rounded-full mb-6 border border-emerald-500/30">
            {mc.category || 'Masterclass'}
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">{mc.title}</h1>
          <p className="text-emerald-100/70 text-base">
            Par <span className="font-bold text-white">{mc.expert || mc.speakerName || "L'équipe E.S.I.C."}</span>
          </p>
        </div>
      </section>

      <PaywallGate mc={mc} />

    </main>
  );
}
