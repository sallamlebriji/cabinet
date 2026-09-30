import { cn } from "../../utils/cn";

const tones: Record<string, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  confirmed: { label: "Confirmé", className: "bg-sage-50 text-sage-700 ring-sage-200" },
  completed: { label: "Terminé", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  cancelled: { label: "Annulé", className: "bg-slate-100 text-slate-600 ring-slate-200" },
  paid: { label: "Payée", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  partial: { label: "Partielle", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  unpaid: { label: "Impayée", className: "bg-red-50 text-red-700 ring-red-200" },
  active: { label: "Actif", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  suspended: { label: "Suspendu", className: "bg-red-50 text-red-700 ring-red-200" }
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = tones[status] ?? { label: status, className: "bg-slate-100 text-slate-600 ring-slate-200" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", tone.className, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {tone.label}
    </span>
  );
}
