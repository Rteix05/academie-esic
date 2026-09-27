/**
 * Navigation rapide entre les rangées d'un catalogue (ancres), défilable horizontalement.
 */
export default function CategoryNav({ rows }: { rows: { id: string; title: string; count: number }[] }) {
  if (rows.length < 2) return null;

  return (
    <nav aria-label="Catégories du catalogue" className="sticky top-20 z-30 -mx-5 bg-brand-cream/90 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8 dark:bg-[#0a1810]/90">
      <ul className="no-scrollbar flex gap-2 overflow-x-auto">
        {rows.map((row) => (
          <li key={row.id} className="shrink-0">
            <a
              href={`#${row.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-display text-sm font-medium text-brand-muted shadow-card transition hover:bg-brand-forest hover:text-white dark:bg-white/5 dark:text-gray-300"
            >
              {row.title}
              <span className="text-xs opacity-70">{row.count}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
