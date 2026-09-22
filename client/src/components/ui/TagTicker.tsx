/**
 * Bandeau de petites pastilles qui défilent — le même procédé que la liste de symptômes
 * ("Postacne spots · Wrinkles · Redness...") qui défile sur lovi.care, ici pour les motifs de
 * consultation. Registre plus discret que <Ticker/> (grande typographie), pensé comme rythme
 * secondaire entre deux sections.
 */
export function TagTicker({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  return (
    <div aria-hidden className="overflow-hidden">
      <div className={`marquee-track fast ${reverse ? "reverse" : ""}`}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center gap-3 pr-3">
            {items.map((item) => (
              <span
                key={`${copy}-${item}`}
                className="whitespace-nowrap rounded-full border border-line bg-white/70 px-4 py-2 text-xs font-bold text-muted"
              >
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
