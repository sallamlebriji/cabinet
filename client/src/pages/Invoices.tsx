import { Download, Plus } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function Invoices() {
  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-ink">Facturation</h2>
          <p className="mt-2 text-muted">Factures, statuts de paiement, historique et export PDF.</p>
        </div>
        <Button><Plus size={18} /> Nouvelle facture</Button>
      </div>
      <Card className="mt-6 overflow-hidden">
        {["INV-2026-A18F2C", "INV-2026-B91K3L", "INV-2026-C62Z8Q"].map((invoice, index) => (
          <div key={invoice} className="grid gap-4 border-b border-line px-5 py-5 last:border-b-0 md:grid-cols-[1fr_160px_160px_48px] md:items-center">
            <p className="font-bold text-ink">{invoice}</p>
            <p className="text-muted">{(index + 1) * 3800} MAD</p>
            <span className="w-fit rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">{index === 1 ? "Partiel" : "Payé"}</span>
            <button className="grid h-10 w-10 place-items-center rounded-lg border border-line" aria-label="Exporter PDF">
              <Download size={18} />
            </button>
          </div>
        ))}
      </Card>
    </div>
  );
}
