import { useCallback, useEffect, useState } from "react";
import { CalendarDays, CalendarPlus, Download, LogOut, Receipt } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Bits";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { apiError, fmtDate, money } from "../../lib/format";
import type { AppointmentStatus } from "../../lib/types";
import { downloadFile, publicApi } from "../../services/api";
import { DEFAULT_CABINET, PublicShell, cabinetSlug } from "./PublicShell";

type PortalData = {
  client: { firstName: string; lastName: string };
  cabinet: { cabinetName: string; phone?: string } | null;
  appointments: { _id: string; startAt: string; status: AppointmentStatus; service?: { name: string; duration: number } }[];
  invoices: { _id: string; number: string; total: number; paidAmount: number; status: string; createdAt: string }[];
};

const TOKEN_KEY = "portalToken";

export function Portal() {
  const slug = cabinetSlug();
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) ?? "");
  const [data, setData] = useState<PortalData | null>(null);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken("");
    setData(null);
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const response = await publicApi.get("/portal/me", { headers: { Authorization: `Bearer ${token}` } });
      setData(response.data);
    } catch {
      logout();
      setError("Votre session a expiré. Reconnectez-vous.");
    }
  }, [token, logout]);

  useEffect(() => {
    void load();
  }, [load]);

  async function login(loginPhone: string, loginCode: string) {
    setBusy(true);
    setError("");
    try {
      const response = await publicApi.post("/portal/login", { slug, phone: loginPhone, code: loginCode });
      sessionStorage.setItem(TOKEN_KEY, response.data.token);
      setToken(response.data.token);
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      setError(status === 429 ? "Trop de tentatives. Réessayez dans quelques minutes." : status === 422 ? "Saisissez votre numéro et le code à 6 chiffres." : apiError(err));
    } finally {
      setBusy(false);
    }
  }

  async function cancel(id: string) {
    if (!window.confirm("Annuler ce rendez-vous ?")) return;
    try {
      await publicApi.post(`/portal/appointments/${id}/cancel`, null, { headers: { Authorization: `Bearer ${token}` } });
      await load();
    } catch (err) {
      setError(apiError(err));
    }
  }

  if (!token || !data) {
    return (
      <PublicShell
        aside={
          <Link to={`/rdv?cabinet=${slug}`} className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-ink">
            Prendre rendez-vous
          </Link>
        }
      >
        <div className="mx-auto max-w-sm">
          <h1 className="font-heading text-[28px] font-medium leading-tight text-navy">Espace patient</h1>
          <p className="mt-1 text-sm text-muted">Consultez vos rendez-vous et vos factures.</p>
          <form
            className="mt-6 space-y-4 rounded-[14px] border border-hairline bg-white p-5 shadow-card"
            onSubmit={(event) => {
              event.preventDefault();
              void login(phone, code);
            }}
          >
            <Field label="Numéro de téléphone">
              <input required type="tel" autoComplete="tel" placeholder="06 12 34 56 78" className="app-input h-11" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </Field>
            <Field label="Code d'accès" hint="Code à 6 chiffres remis par votre cabinet.">
              <input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" className="app-input h-11 font-mono tracking-[0.3em]" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} />
            </Field>
            {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{error}</p>}
            <Button type="submit" className="h-11 w-full" disabled={busy}>
              {busy ? "Connexion…" : "Accéder à mon espace"}
            </Button>
          </form>
          {slug === DEFAULT_CABINET && (
            <button type="button" disabled={busy} onClick={() => void login("+212 661 11 22 33", "123456")} className="mt-4 w-full rounded-xl border border-dashed border-slate-300 px-4 py-3 text-left text-[13px] text-slate-600 transition hover:border-sage-500 hover:bg-white">
              <span className="font-semibold text-ink">Compte de démonstration</span>
              <span className="block text-xs text-muted">Se connecter comme Amina El Fassi</span>
            </button>
          )}
        </div>
      </PublicShell>
    );
  }

  const now = new Date();
  const upcoming = data.appointments.filter((item) => new Date(item.startAt) > now && item.status !== "cancelled").reverse();
  const past = data.appointments.filter((item) => !(new Date(item.startAt) > now && item.status !== "cancelled"));
  const balance = data.invoices.reduce((sum, invoice) => sum + Math.max(invoice.total - invoice.paidAmount, 0), 0);

  return (
    <PublicShell
      cabinetName={data.cabinet?.cabinetName}
      aside={
        <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-ink">
          <LogOut size={15} /> Déconnexion
        </button>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-[28px] font-medium leading-tight text-navy">Bonjour, {data.client.firstName}</h1>
          <p className="mt-1 text-sm text-muted">
            {upcoming.length ? `${upcoming.length} rendez-vous à venir` : "Aucun rendez-vous à venir"} · {balance > 0 ? `${money(balance)} restant à régler` : "aucun solde à régler"}
          </p>
        </div>
        <Link to={`/rdv?cabinet=${slug}`} className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-sage-600 px-4 text-sm font-medium text-white shadow-card transition hover:bg-sage-700">
          <CalendarPlus size={16} /> Prendre rendez-vous
        </Link>
      </div>

      {error && <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{error}</p>}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="overflow-hidden rounded-[14px] border border-hairline bg-white shadow-card">
          <h2 className="flex items-center gap-2 border-b border-hairline px-5 py-4 text-[14.5px] font-semibold text-ink">
            <CalendarDays size={16} className="text-sage-600" /> Mes rendez-vous
          </h2>
          {data.appointments.length ? (
            <ul className="divide-y divide-hairline">
              {[...upcoming, ...past].map((item) => {
                const date = new Date(item.startAt);
                const cancellable = date > now && (item.status === "pending" || item.status === "confirmed");
                return (
                  <li key={item._id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{item.service?.name ?? "Rendez-vous"}</p>
                      <p className="text-xs capitalize text-muted">
                        {date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} à {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                    {cancellable && (
                      <button type="button" onClick={() => void cancel(item._id)} className="text-xs font-medium text-red-600 hover:underline">
                        Annuler
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-muted">Vous n'avez pas encore de rendez-vous.</p>
          )}
        </section>

        <section className="overflow-hidden rounded-[14px] border border-hairline bg-white shadow-card">
          <h2 className="flex items-center gap-2 border-b border-hairline px-5 py-4 text-[14.5px] font-semibold text-ink">
            <Receipt size={16} className="text-sage-600" /> Mes factures
          </h2>
          {data.invoices.length ? (
            <ul className="divide-y divide-hairline">
              {data.invoices.map((invoice) => (
                <li key={invoice._id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{invoice.number}</p>
                    <p className="text-xs text-muted">
                      {fmtDate(invoice.createdAt)} · {money(invoice.total)}
                    </p>
                  </div>
                  <StatusBadge status={invoice.status} />
                  <button
                    type="button"
                    onClick={() => void downloadFile(publicApi, `/portal/invoices/${invoice._id}/pdf`, `${invoice.number}.pdf`, token).catch(() => setError("Téléchargement impossible."))}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-hairline text-slate-600 hover:bg-slate-50"
                    aria-label={`Télécharger ${invoice.number}`}
                    title="Télécharger le PDF"
                  >
                    <Download size={14} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-muted">Aucune facture pour le moment.</p>
          )}
        </section>
      </div>
    </PublicShell>
  );
}
