import { useState } from "react";
import { Download, Plus, Receipt, Trash2, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { BillingFormModal, PaymentModal } from "../components/BillingModals";
import { IconButton, Kpi, Segmented, TableSkeleton } from "../components/ui/Bits";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useToast } from "../components/ui/Toast";
import { useApi } from "../hooks/useApi";
import { apiError, fmtDate, fullName, money } from "../lib/format";
import type { Invoice } from "../lib/types";
import { api, downloadFile } from "../services/api";

type Filter = "all" | Invoice["status"];

export function Invoices() {
  const toast = useToast();
  const { data, loading, reload } = useApi<{ items: Invoice[] }>("/invoices");
  const [filter, setFilter] = useState<Filter>("all");
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState<Invoice | null>(null);
  const invoices = data?.items ?? [];
  const visible = filter === "all" ? invoices : invoices.filter((invoice) => invoice.status === filter);
  const total = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paid = invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);

  async function remove(invoice: Invoice) {
    if (!window.confirm(`Supprimer la facture ${invoice.number} ?`)) return;
    try {
      await api.delete(`/invoices/${invoice._id}`);
      toast.ok("Facture supprimée.");
      await reload();
    } catch (error) {
      toast.error(apiError(error));
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-7">
      <PageHeader
        title="Facturation"
        description="Factures émises, encaissements et export PDF."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} /> Nouvelle facture
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Total facturé" value={money(total)} hint={`${invoices.length} facture(s)`} />
        <Kpi label="Encaissé" value={money(paid)} hint={total ? `${Math.round((paid / total) * 100)} % du facturé` : undefined} />
        <Kpi label="Reste à encaisser" value={money(Math.max(total - paid, 0))} hint={`${invoices.filter((invoice) => invoice.status !== "paid").length} facture(s) ouverte(s)`} />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-hairline p-3">
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "Toutes" },
              { value: "unpaid", label: "Impayées" },
              { value: "partial", label: "Partielles" },
              { value: "paid", label: "Payées" }
            ]}
          />
        </div>
        {loading ? (
          <TableSkeleton />
        ) : visible.length ? (
          <div className="overflow-x-auto">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Facture</th>
                  <th>Client</th>
                  <th className="hidden md:table-cell">Date</th>
                  <th className="num">Montant</th>
                  <th className="num hidden sm:table-cell">Reste dû</th>
                  <th>Statut</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((invoice) => (
                  <tr key={invoice._id}>
                    <td className="whitespace-nowrap font-medium text-ink">{invoice.number}</td>
                    <td>
                      {invoice.client ? (
                        <Link to={`/clients/${invoice.client._id}`} className="text-slate-700 hover:text-sage-700">
                          {fullName(invoice.client)}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="hidden whitespace-nowrap text-muted md:table-cell">{fmtDate(invoice.createdAt)}</td>
                    <td className="num font-medium">{money(invoice.total)}</td>
                    <td className="num hidden text-muted sm:table-cell">{money(Math.max(invoice.total - invoice.paidAmount, 0))}</td>
                    <td>
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td>
                      <div className="flex justify-end gap-1.5">
                        {invoice.status !== "paid" && (
                          <Button variant="secondary" className="h-8 px-2.5 text-xs" onClick={() => setPaying(invoice)}>
                            <Wallet size={14} /> Encaisser
                          </Button>
                        )}
                        <IconButton label="Télécharger le PDF" onClick={() => void downloadFile(api, `/invoices/${invoice._id}/pdf`, `${invoice.number}.pdf`).catch((error) => toast.error(apiError(error)))}>
                          <Download size={14} />
                        </IconButton>
                        {invoice.paidAmount === 0 && (
                          <IconButton label="Supprimer" tone="danger" onClick={() => void remove(invoice)}>
                            <Trash2 size={14} />
                          </IconButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Receipt} title="Aucune facture" description="Aucune facture ne correspond à ce filtre." />
        )}
      </Card>

      <BillingFormModal kind="invoice" open={creating} onClose={() => setCreating(false)} onSaved={() => void reload()} />
      <PaymentModal invoice={paying} onClose={() => setPaying(null)} onSaved={() => void reload()} />
    </div>
  );
}
