import { cn } from "../../utils/cn";

type TickerProps = {
  items: string[];
  reverse?: boolean;
  /** `filled` = texte plein, `outline` = contour fin. */
  variant?: "filled" | "outline";
  className?: string;
};

/** Bandeau défilant. Le contenu est dupliqué : `translateX(-50%)` boucle sans à-coup. */
export function Ticker({ items, reverse = false, variant = "filled", className }: TickerProps) {
  return (
    <div aria-hidden className={cn("overflow-hidden", className)}>
      <div className={cn("marquee-track", reverse && "reverse")}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {items.map((item) => (
              <span key={`${copy}-${item}`} className={cn("display flex items-center whitespace-nowrap px-6 text-5xl md:text-7xl", variant === "outline" ? "outline-text" : "text-ink/85")}>
                {item}
                <span className="ml-12 text-2xl text-sage-500 md:text-3xl">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
