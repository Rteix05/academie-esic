'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileText, PlayCircle, Sparkles, Video } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { masterclassToItem, type CatalogItem, type MasterclassDto } from '@/lib/catalog';
import Carousel, { assignSharedIds } from '@/components/catalog/Carousel';
import CategoryNav from '@/components/catalog/CategoryNav';

interface Purchase {
  id: number;
  options: string[];
}

interface Row {
  key: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  items: CatalogItem[];
  featureFirst?: boolean;
  action?: { href: string; label: string };
}

/**
 * Catalogue des masterclass organisé en rangées horizontales (façon plateforme de streaming).
 * La lecture et l'achat se font depuis la page détail de chaque masterclass.
 */
export default function MasterclassesList({ masterclasses, featuredKey }: { masterclasses: MasterclassDto[]; featuredKey?: string | null }) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    // Non connecté : 401 → aucun achat
    apiFetch('/api/mes-masterclasses')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Purchase[]) => setPurchases(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const { rows, sharing } = useMemo(() => {
    const byDate = [...masterclasses].sort((a, b) => (b.scheduledAt ?? '').localeCompare(a.scheduledAt ?? ''));
    const items = byDate.map(masterclassToItem);
    const purchasedIds = new Set(purchases.map((p) => p.id));

    // Une rangée par format n'a d'intérêt que si elle filtre réellement le catalogue
    const formatRow = (key: string, title: string, icon: React.ReactNode, predicate: (mc: MasterclassDto) => boolean): Row | null => {
      const ids = new Set(byDate.filter(predicate).map((mc) => mc.id));
      const subset = items.filter((i) => ids.has(i.id));
      return subset.length > 0 && subset.length < items.length ? { key, title, icon, items: subset } : null;
    };

    const allRows = [
      {
        key: 'mine',
        title: 'Continuer mes masterclasses',
        subtitle: 'Les enseignements que vous avez débloqués',
        icon: <PlayCircle className="h-5 w-5" />,
        items: items.filter((i) => purchasedIds.has(i.id)),
        action: { href: '/dashboard', label: 'Mon espace' },
      },
      {
        key: 'nouveautes',
        title: 'Nouveautés',
        subtitle: 'Les derniers enseignements publiés',
        icon: <Sparkles className="h-5 w-5" />,
        // Hors masterclass déjà mise en avant dans le bandeau « À la une »
        items: items.filter((i) => `${i.kind}-${i.id}` !== featuredKey),
        featureFirst: items.length >= 4,
      },
      formatRow('video', 'Enseignements vidéo', <Video className="h-5 w-5" />, (mc) => !!mc.videoAvailable),
      formatRow('pdf', "Avec livret d'étude", <FileText className="h-5 w-5" />, (mc) => !!mc.pdfAvailable),
    ].filter((r): r is Row => !!r && r.items.length > 0);

    return { rows: allRows, sharing: assignSharedIds(allRows, featuredKey ? [featuredKey] : []) };
  }, [masterclasses, purchases, featuredKey]);

  return (
    <>
      <CategoryNav rows={rows.map((r) => ({ id: `rangee-${r.key}`, title: r.title, count: r.items.length }))} />
      <div className="mt-6 space-y-10">
        {rows.map((row) => (
          <Carousel
            key={row.key}
            id={`rangee-${row.key}`}
            title={row.title}
            subtitle={row.subtitle}
            icon={row.icon}
            items={row.items}
            featureFirst={row.featureFirst}
            action={row.action}
            sharedIds={sharing.get(row.key)}
          />
        ))}
      </div>
    </>
  );
}
