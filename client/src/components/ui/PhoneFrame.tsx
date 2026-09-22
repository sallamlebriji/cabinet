import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/** Chrome de téléphone réutilisable (encoche, contour, home indicator) — les écrans se glissent dedans. */
export function PhoneFrame({ children, className, dark = false }: { children: ReactNode; className?: string; dark?: boolean }) {
  return (
    <div className={cn("relative aspect-[9/18.5] w-full rounded-[2rem] border-[6px] border-ink bg-ink p-1.5 shadow-premium", className)}>
      <span className="absolute left-1/2 top-2.5 z-10 h-1.5 w-14 -translate-x-1/2 rounded-full bg-ink" />
      <div className={cn("relative h-full w-full overflow-hidden rounded-[1.4rem]", dark ? "bg-ink" : "bg-ivory")}>{children}</div>
      <span className={cn("absolute bottom-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full", dark ? "bg-white/50" : "bg-ink/25")} />
    </div>
  );
}
