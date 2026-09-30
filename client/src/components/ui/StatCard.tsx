import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";

export function StatCard({ label, value, hint, icon: Icon, loading }: { label: string; value: string; hint?: string; icon: LucideIcon; loading?: boolean }) {
  return (
    <Card className="p-5 transition hover:shadow-pop">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-sage-50 text-sage-600">
          <Icon size={18} />
        </div>
      </div>
      {loading ? <div className="skeleton mt-3 h-8 w-24" /> : <p className="app-num mt-3 text-3xl font-semibold text-ink">{value}</p>}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </Card>
  );
}
