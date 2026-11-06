/**
 * Sommaire du catalogue : liens vers chaque catégorie (ancres), sur plusieurs lignes si besoin.
 */
export default function CategoryNav({ rows }: { rows: { id: string; title: string; count: number }[] }) {
  if (rows.length < 2) return null;

  return (
    <nav aria-label="Catégories du catalogue" className="category-nav">
      <ul className="flex flex-wrap gap-2">
        {rows.map((row) => (
          <li key={row.id}>
            <a
              href={`#${row.id}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand-forest/15 px-4 text-base text-brand-forest transition-colors hover:border-brand-forest/40 hover:bg-brand-forest/[0.04] dark:border-white/15 dark:text-emerald-100"
            >
              {row.title}
              <span className="text-sm text-brand-muted">{row.count}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
