import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-500">
        <Icon size={20} />
      </div>
      <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-xs text-xs text-muted">{description}</p>}
    </div>
  );
}
