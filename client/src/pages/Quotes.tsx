import { useState } from "react";
import { Download, FileText, Plus, Receipt, Send, Trash2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { BillingFormModal } from "../components/BillingModals";
import { IconButton, Kpi, Segmented, TableSkeleton } from "../components/ui/Bits";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useToast } from "../components/ui/Toast";
import { useApi } from "../hooks/useApi";
import { apiError, fmtDate, fullName, money } from "../lib/format";
import type { Quote } from "../lib/types";
import { api, downloadFile } from "../services/api";

type Filter = "all" | Quote["status"];

export function Quotes() {
  const toast = useToast();
  const { data, loading, reload } = useApi<{ items: Quote[] }>("/quotes");
  const [filter, setFilter] = useState<Filter>("all");
  const [creating, setCreating] = useState(false);
  const quotes = data?.items ?? [];
  const visible = filter === "all" ? quotes : quotes.filter((quote) => quote.status === filter);
  const open = quotes.filter((quote) => quote.status === "draft" || quote.status === "sent");
  const decided = quotes.filter((quote) => quote.status === "accepted" || quote.status === "refused");

  async function run(action: () => Promise<unknown>, message: string) {
    try {
      await action();
      toast.ok(message);
      await reload();
    } catch (error) {
      toast.error(apiError(error));
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-7">
      <PageHeader
        title="Devis"
        description="Propositions chiffrées, suivi des réponses et conversion en facture."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} /> Nouveau devis
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="En attente de réponse" value={open.length} hint={money(open.reduce((sum, quote) => sum + quote.total, 0))} />
        <Kpi label="Acceptés" value={quotes.filter((quote) => quote.status === "accepted").length} />
        <Kpi label="Taux d'acceptation" value={decided.length ? `${Math.round((decided.filter((quote) => quote.status === "accepted").length / decided.length) * 100)} %` : "—"} hint="Sur les devis ayant reçu une réponse" />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-hairline p-3">
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "Tous" },
              { value: "draft", label: "Brouillons" },
              { value: "sent", label: "Envoyés" },
              { value: "accepted", label: "Acceptés" },
              { value: "refused", label: "Refusés" }
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
                  <th>Devis</th>
                  <th>Client</th>
                  <th className="hidden md:table-cell">Créé le</th>
                  <th className="hidden lg:table-cell">Validité</th>
                  <th className="num">Montant</th>
                  <th>Statut</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((quote) => (
                  <tr key={quote._id}>
                    <td className="whitespace-nowrap font-medium text-ink">{quote.number}</td>
                    <td>
                      {quote.client ? (
                        <Link to={`/clients/${quote.client._id}`} className="text-slate-700 hover:text-sage-700">
                          {fullName(quote.client)}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="hidden whitespace-nowrap text-muted md:table-cell">{fmtDate(quote.createdAt)}</td>
                    <td className="hidden whitespace-nowrap text-muted lg:table-cell">{quote.validUntil ? fmtDate(quote.validUntil) : "—"}</td>
                    <td className="num font-medium">{money(quote.total)}</td>
                    <td>
                      <StatusBadge status={quote.status} />
                      {quote.invoice && <span className="ml-2 text-xs text-muted">→ {quote.invoice.number}</span>}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1.5">
                        {!quote.invoice && quote.status === "draft" && (
                          <IconButton label="Marquer comme envoyé" onClick={() => void run(() => api.patch(`/quotes/${quote._id}/status`, { status: "sent" }), "Devis marqué comme envoyé.")}>
                            <Send size={14} />
                          </IconButton>
                        )}
                        {!quote.invoice && quote.status !== "refused" && (
                          <Button
                            variant="secondary"
                            className="h-8 px-2.5 text-xs"
                            onClick={() => window.confirm(`Convertir ${quote.number} en facture ?`) && void run(() => api.post(`/quotes/${quote._id}/convert`), "Facture créée à partir du devis.")}
                          >
                            <Receipt size={14} /> Facturer
                          </Button>
                        )}
                        {!quote.invoice && quote.status === "sent" && (
                          <IconButton label="Marquer comme refusé" onClick={() => void run(() => api.patch(`/quotes/${quote._id}/status`, { status: "refused" }), "Devis marqué comme refusé.")}>
                            <XCircle size={14} />
                          </IconButton>
                        )}
                        <IconButton label="Télécharger le PDF" onClick={() => void downloadFile(api, `/quotes/${quote._id}/pdf`, `${quote.number}.pdf`).catch((error) => toast.error(apiError(error)))}>
                          <Download size={14} />
                        </IconButton>
                        {!quote.invoice && (
                          <IconButton label="Supprimer" tone="danger" onClick={() => window.confirm(`Supprimer ${quote.number} ?`) && void run(() => api.delete(`/quotes/${quote._id}`), "Devis supprimé.")}>
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
          <EmptyState icon={FileText} title="Aucun devis" description="Créez un devis pour chiffrer une prestation avant de la facturer." />
        )}
      </Card>

      <BillingFormModal kind="quote" open={creating} onClose={() => setCreating(false)} onSaved={() => void reload()} />
    </div>
  );
}
