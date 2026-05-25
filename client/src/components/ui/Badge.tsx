import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full border border-gold-200 bg-gold-50 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-petrol-900", className)}
      {...props}
    />
  );
}
