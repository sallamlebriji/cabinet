import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { api } from "../services/api";

type Invoice = {
  _id: string;
  number: string;
  total: number;
  paidAmount: number;
  status: "paid" | "unpaid" | "partial";
  createdAt: string;
  client?: { firstName: string; lastName: string };
};

const money = new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 });
const filters = [
  { value: "all", label: "Toutes" },
  { value: "paid", label: "Payées" },
  { value: "partial", label: "Partielles" },
  { value: "unpaid", label: "Impayées" }
];

export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState("");

  useEffect(() => {
    api
      .get("/invoices")
      .then(({ data }) => setInvoices(data.items))
      .finally(() => setLoading(false));
  }, []);

  async function downloadPdf(invoice: Invoice) {
    setDownloading(invoice._id);
    try {
      const { data } = await api.get(`/invoices/${invoice._id}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoice.number}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading("");
    }
  }

  const visible = filter === "all" ? invoices : invoices.filter((invoice) => invoice.status === filter);
  const total = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paid = invoices.reduce((sum, invoice) => sum + (invoice.paidAmount ?? 0), 0);

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <PageHeader title="Facturation" description="Suivi des factures, des paiements et export PDF." />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total facturé", value: total },
          { label: "Encaissé", value: paid },
          { label: "Reste à encaisser", value: Math.max(total - paid, 0) }
        ].map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-sm font-medium text-muted">{item.label}</p>
            <p className="app-num mt-2 text-2xl font-semibold text-ink">
              {money.format(item.value)} <span className="text-sm font-medium text-muted">MAD</span>
            </p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-1.5 border-b border-hairline p-3">
          {filters.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${filter === item.value ? "bg-sage-50 text-sage-700" : "text-muted hover:bg-slate-100 hover:text-ink"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2].map((row) => (
              <div key={row} className="skeleton h-10 w-full" />
            ))}
          </div>
        ) : visible.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-xs text-muted">
                  <th className="px-5 py-3 font-medium">Facture</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 text-right font-medium">Montant</th>
                  <th className="px-5 py-3 text-right font-medium">Payé</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {visible.map((invoice) => (
                  <tr key={invoice._id} className="transition hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-3.5 font-medium text-ink">{invoice.number}</td>
                    <td className="px-5 py-3.5 text-muted">{invoice.client ? `${invoice.client.firstName} ${invoice.client.lastName}` : "—"}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-muted">{new Date(invoice.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td className="app-num whitespace-nowrap px-5 py-3.5 text-right font-medium text-ink">{money.format(invoice.total)} MAD</td>
                    <td className="app-num whitespace-nowrap px-5 py-3.5 text-right text-muted">{money.format(invoice.paidAmount ?? 0)} MAD</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button variant="secondary" className="h-8 px-3 text-xs" disabled={downloading === invoice._id} onClick={() => void downloadPdf(invoice)}>
                        <Download size={14} /> PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={FileText} title="Aucune facture" description="Aucune facture ne correspond à ce filtre." />
        )}
      </Card>
    </div>
  );
}
