import { Trash2, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { IconButton, Kpi, TableSkeleton } from "../components/ui/Bits";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { useToast } from "../components/ui/Toast";
import { useApi } from "../hooks/useApi";
import { apiError, fmtDate, fullName, money } from "../lib/format";
import { methodLabels, type Payment, type PaymentMethod } from "../lib/types";
import { api } from "../services/api";
import { useAuth } from "../store/AuthContext";

export function Payments() {
  const toast = useToast();
  const { user } = useAuth();
  const { data, loading, reload } = useApi<{ items: Payment[] }>("/payments");
  const payments = data?.items ?? [];
  const canDelete = user?.role !== "EMPLOYEE";

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thisMonth = payments.filter((payment) => new Date(payment.paidAt) >= monthStart);
  const sum = (list: Payment[]) => list.reduce((total, payment) => total + payment.amount, 0);
  const byMethod = (Object.keys(methodLabels) as PaymentMethod[]).map((method) => ({ method, total: sum(payments.filter((payment) => payment.method === method)) }));
  const grandTotal = sum(payments);

  async function remove(payment: Payment) {
    if (!window.confirm(`Annuler ce paiement de ${money(payment.amount)} ? La facture sera recalculée.`)) return;
    try {
      await api.delete(`/payments/${payment._id}`);
      toast.ok("Paiement annulé.");
      await reload();
    } catch (error) {
      toast.error(apiError(error));
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-7">
      <PageHeader title="Paiements" description="Journal des encaissements, par date et par mode de paiement." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.4fr]">
        <Kpi label="Encaissé ce mois" value={money(sum(thisMonth))} hint={`${thisMonth.length} paiement(s)`} />
        <Kpi label="Total encaissé" value={money(grandTotal)} hint={`${payments.length} paiement(s)`} />
        <div className="rounded-xl border border-hairline bg-white px-5 py-4 shadow-card sm:col-span-2 xl:col-span-1">
          <p className="text-[12.5px] font-medium text-muted">Répartition par mode</p>
          <div className="mt-3 space-y-2">
            {byMethod.map(({ method, total }) => (
              <div key={method} className="flex items-center gap-3 text-[13px]">
                <span className="w-16 text-slate-600">{methodLabels[method]}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span className="block h-full rounded-full bg-sage-600" style={{ width: `${grandTotal ? (total / grandTotal) * 100 : 0}%` }} />
                </span>
                <span className="app-num w-24 text-right font-medium text-ink">{money(total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : payments.length ? (
          <div className="overflow-x-auto">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Facture</th>
                  <th>Mode</th>
                  <th className="hidden md:table-cell">Référence</th>
                  <th className="num">Montant</th>
                  {canDelete && <th />}
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="whitespace-nowrap text-muted">{fmtDate(payment.paidAt)}</td>
                    <td>
                      {payment.client ? (
                        <Link to={`/clients/${payment.client._id}`} className="font-medium text-ink hover:text-sage-700">
                          {fullName(payment.client)}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap text-slate-600">{payment.invoice?.number ?? "—"}</td>
                    <td>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11.5px] font-medium text-slate-600">{methodLabels[payment.method]}</span>
                    </td>
                    <td className="hidden text-muted md:table-cell">{payment.reference || "—"}</td>
                    <td className="num font-medium text-emerald-700">+{money(payment.amount)}</td>
                    {canDelete && (
                      <td>
                        <div className="flex justify-end">
                          <IconButton label="Annuler le paiement" tone="danger" onClick={() => void remove(payment)}>
                            <Trash2 size={14} />
                          </IconButton>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Wallet} title="Aucun paiement" description="Les encaissements enregistrés depuis la facturation apparaissent ici." />
        )}
      </Card>
    </div>
  );
}
