import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";

export function StatCard({ label, value, trend, icon: Icon }: { label: string; value: string; trend: string; icon: LucideIcon }) {
  return (
    <Card className="p-5 transition hover:-translate-y-0.5 hover:border-gold-200 hover:shadow-premium">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 font-serif text-3xl font-bold tracking-normal text-ink">{value}</p>
        </div>
        <div className="rounded-lg bg-petrol-50 p-3 text-petrol-600">
          <Icon size={22} />
        </div>
      </div>
      <p className="mt-5 text-sm font-medium text-emerald-500">{trend}</p>
    </Card>
  );
}
