import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, CalendarDays, Check, FileText, Globe, Users, Wallet, X } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { Card, CardHeader } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { api } from "../services/api";
import { useAuth } from "../store/AuthContext";

type Stats = { clients: number; employees: number; appointmentsToday: number; revenue: number };
type Appointment = {
  _id: string;
  startAt: string;
  status: string;
  source?: string;
  client?: { firstName: string; lastName: string };
  service?: { name: string };
};
type Invoice = { _id: string; number: string; total: number; paidAmount: number; status: string; createdAt: string; client?: { firstName: string; lastName: string } };

const money = new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 });
const monthFormat = new Intl.DateTimeFormat("fr-FR", { month: "short" });

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [statsRes, apptRes, invRes] = await Promise.allSettled([api.get("/dashboard/stats"), api.get("/appointments"), api.get("/invoices")]);
    if (statsRes.status === "fulfilled") setStats(statsRes.value.data.stats);
    if (apptRes.status === "fulfilled") setAppointments(apptRes.value.data.items);
    if (invRes.status === "fulfilled") setInvoices(invRes.value.data.items);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const requests = useMemo(
    () => appointments.filter((item) => item.status === "pending" && new Date(item.startAt) > new Date()).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
    [appointments]
  );

  async function answer(id: string, status: "confirmed" | "cancelled") {
    await api.patch(`/appointments/${id}/status`, { status }).catch(() => undefined);
    await load();
  }

  const upcoming = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return appointments
      .filter((item) => new Date(item.startAt) >= now && item.status !== "cancelled")
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
      .slice(0, 5);
  }, [appointments]);

  const series = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - (5 - index));
      return { key: `${date.getFullYear()}-${date.getMonth()}`, month: monthFormat.format(date).replace(".", ""), revenue: 0 };
    });
    invoices.forEach((invoice) => {
      const date = new Date(invoice.createdAt);
      const bucket = months.find((item) => item.key === `${date.getFullYear()}-${date.getMonth()}`);
      if (bucket) bucket.revenue += invoice.paidAmount ?? 0;
    });
    return months;
  }, [invoices]);

  const collected = invoices.reduce((sum, invoice) => sum + (invoice.paidAmount ?? 0), 0);
  const outstanding = invoices.reduce((sum, invoice) => sum + Math.max(invoice.total - (invoice.paidAmount ?? 0), 0), 0);
  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <div className="space-y-6 p-4 sm:p-7">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <PageHeader title={`${greeting()}, ${firstName}`} description="Voici l'activité de votre cabinet aujourd'hui." />
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard loading={loading} label="Clients" value={money.format(stats?.clients ?? 0)} hint="Dossiers actifs" icon={Users} />
        <StatCard loading={loading} label="Rendez-vous du jour" value={String(stats?.appointmentsToday ?? 0)} hint={`${upcoming.length} à venir`} icon={CalendarCheck} />
        <StatCard loading={loading} label="Encaissé" value={`${money.format(collected)} MAD`} hint="Paiements reçus" icon={Wallet} />
        <StatCard loading={loading} label="Reste à encaisser" value={`${money.format(outstanding)} MAD`} hint={`${invoices.filter((i) => i.status !== "paid").length} facture(s) ouverte(s)`} icon={FileText} />
      </div>

      {requests.length > 0 && (
        <Card className="overflow-hidden border-amber-200">
          <CardHeader title={`${requests.length} rendez-vous à confirmer`} description="Demandes en attente, dont celles reçues par la réservation en ligne." />
          <ul className="divide-y divide-hairline">
            {requests.slice(0, 5).map((item) => (
              <li key={item._id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {item.client ? `${item.client.firstName} ${item.client.lastName}` : "Client"}
                    {item.source === "online" && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-sage-50 px-2 py-0.5 text-[11px] font-medium text-sage-700">
                        <Globe size={11} /> En ligne
                      </span>
                    )}
                  </p>
                  <p className="text-xs capitalize text-muted">
                    {new Date(item.startAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {new Date(item.startAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} · {item.service?.name ?? "Service"}
                  </p>
                </div>
                <button type="button" onClick={() => void answer(item._id, "confirmed")} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white transition hover:bg-emerald-700">
                  <Check size={14} /> Confirmer
                </button>
                <button type="button" onClick={() => void answer(item._id, "cancelled")} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-hairline bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                  <X size={14} /> Refuser
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader title="Encaissements" description="6 derniers mois, en MAD" />
          <div className="h-72 p-4 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
                <CartesianGrid vertical={false} stroke="#eef1f5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#66716f", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#66716f", fontSize: 12 }} width={56} />
                <Tooltip
                  cursor={{ fill: "rgba(37,99,235,0.06)" }}
                  formatter={(value) => [`${money.format(Number(value))} MAD`, "Encaissé"]}
                  contentStyle={{ borderRadius: 10, border: "1px solid #e4e8ee", boxShadow: "0 12px 32px -12px rgba(15,23,42,0.22)", fontSize: 12 }}
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Prochains rendez-vous"
            action={
              <Link to="/agenda" className="inline-flex items-center gap-1 text-xs font-semibold text-sage-600 hover:text-sage-700">
                Tout voir <ArrowRight size={13} />
              </Link>
            }
          />
          {upcoming.length ? (
            <ul className="divide-y divide-hairline">
              {upcoming.map((item) => {
                const date = new Date(item.startAt);
                return (
                  <li key={item._id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-12 shrink-0 rounded-lg bg-slate-50 py-1.5 text-center">
                      <p className="text-[10px] font-semibold uppercase text-muted">{monthFormat.format(date).replace(".", "")}</p>
                      <p className="app-num text-base font-semibold leading-none text-ink">{date.getDate()}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {item.client ? `${item.client.firstName} ${item.client.lastName}` : "Client"}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} · {item.service?.name ?? "Service"}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={CalendarDays} title="Aucun rendez-vous à venir" description="Les prochains rendez-vous planifiés apparaîtront ici." />
          )}
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Dernières factures"
          action={
            <Link to="/invoices" className="inline-flex items-center gap-1 text-xs font-semibold text-sage-600 hover:text-sage-700">
              Facturation <ArrowRight size={13} />
            </Link>
          }
        />
        {invoices.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-muted">
                  <th className="px-5 py-3 font-medium">Facture</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 text-right font-medium">Montant</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {invoices.slice(0, 5).map((invoice) => (
                  <tr key={invoice._id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-medium text-ink">{invoice.number}</td>
                    <td className="px-5 py-3.5 text-muted">{invoice.client ? `${invoice.client.firstName} ${invoice.client.lastName}` : "—"}</td>
                    <td className="app-num px-5 py-3.5 text-right font-medium text-ink">{money.format(invoice.total)} MAD</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={invoice.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={FileText} title="Aucune facture" description="Les factures émises apparaîtront ici." />
        )}
      </Card>
    </div>
  );
}
