import { useRef, useState } from "react";
import { ArrowLeft, CalendarPlus, Download, FileText, FolderOpen, KeyRound, Mail, MapPin, Pencil, Phone, Receipt, RefreshCw, Trash2, Upload, Wallet } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppointmentModal } from "../components/AppointmentModal";
import { BillingFormModal, PaymentModal } from "../components/BillingModals";
import { ClientFormModal } from "../components/ClientFormModal";
import { Avatar, IconButton, Kpi, Tabs } from "../components/ui/Bits";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useToast } from "../components/ui/Toast";
import { useApi } from "../hooks/useApi";
import { apiError, fmtDate, fmtDateTime, fullName, money } from "../lib/format";
import { methodLabels, type Appointment, type Client, type DocumentFile, type Invoice, type Payment, type Quote } from "../lib/types";
import { api, apiOrigin, downloadFile } from "../services/api";
import { useAuth } from "../store/AuthContext";

type Overview = {
  client: Client;
  appointments: Appointment[];
  documents: DocumentFile[];
  invoices: Invoice[];
  quotes: Quote[];
  payments: Payment[];
  canBilling: boolean;
  totals: { billed: number; paid: number; balance: number; visits: number };
};

type Tab = "overview" | "appointments" | "billing" | "documents";

export function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { data, loading, error, reload } = useApi<Overview>(`/clients/${id}/overview`);
  const [tab, setTab] = useState<Tab>("overview");
  const [editing, setEditing] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null | "new">(null);
  const [billing, setBilling] = useState<"quote" | "invoice" | null>(null);
  const [paying, setPaying] = useState<Invoice | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  if (loading) return <div className="p-7 text-sm text-muted">Chargement…</div>;
  if (error || !data) {
    return (
      <div className="p-7">
        <EmptyState icon={FolderOpen} title="Client introuvable" description={error} />
      </div>
    );
  }

  const { client, appointments, documents, invoices, quotes, payments, canBilling, totals } = data;
  const name = fullName(client);
  const upcoming = appointments.filter((item) => new Date(item.startAt) > new Date() && item.status !== "cancelled").reverse();
  const canDelete = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN_TENANT";

  async function remove() {
    if (!window.confirm(`Supprimer définitivement le dossier de ${name} ?`)) return;
    try {
      await api.delete(`/clients/${client._id}`);
      toast.ok("Client supprimé.");
      navigate("/clients");
    } catch (err) {
      toast.error(apiError(err));
    }
  }

  async function regenerateCode() {
    if (!window.confirm("Générer un nouveau code ? L'ancien ne fonctionnera plus.")) return;
    try {
      await api.post(`/clients/${client._id}/portal-code`);
      toast.ok("Nouveau code généré.");
      await reload();
    } catch (err) {
      toast.error(apiError(err));
    }
  }

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    body.append("client", client._id);
    body.append("title", file.name);
    try {
      await api.post("/documents", body);
      toast.ok("Document ajouté.");
      await reload();
    } catch (err) {
      toast.error(apiError(err, "Format non accepté (PDF, image, Word, Excel — 10 Mo max)."));
    }
  }

  async function removeDocument(document: DocumentFile) {
    if (!window.confirm(`Supprimer « ${document.title} » ?`)) return;
    try {
      await api.delete(`/documents/${document._id}`);
      await reload();
    } catch (err) {
      toast.error(apiError(err));
    }
  }

  const tabs: { value: Tab; label: string; count?: number }[] = [
    { value: "overview", label: "Aperçu" },
    { value: "appointments", label: "Rendez-vous", count: appointments.length },
    ...(canBilling ? [{ value: "billing" as Tab, label: "Facturation", count: invoices.length + quotes.length }] : []),
    { value: "documents", label: "Documents", count: documents.length }
  ];

  return (
    <div className="space-y-6 p-4 sm:p-7">
      <Link to="/clients" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink">
        <ArrowLeft size={15} /> Clients
      </Link>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <Avatar name={name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-[26px] font-medium leading-tight text-navy">{name}</h2>
              {client.tags?.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-slate-600">
              {client.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" /> {client.phone}
                </span>
              )}
              {client.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" /> {client.email}
                </span>
              )}
              {client.address && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" /> {client.address}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setAppointment("new")}>
              <CalendarPlus size={16} /> Rendez-vous
            </Button>
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <Pencil size={15} /> Modifier
            </Button>
            {canDelete && (
              <IconButton label="Supprimer le client" tone="danger" className="h-9 w-9 rounded-[10px]" onClick={() => void remove()}>
                <Trash2 size={15} />
              </IconButton>
            )}
          </div>
        </div>
      </Card>

      <div className={`grid gap-4 sm:grid-cols-2 ${canBilling ? "xl:grid-cols-4" : ""}`}>
        <Kpi label="Visites terminées" value={totals.visits} />
        <Kpi label="Rendez-vous à venir" value={upcoming.length} hint={upcoming[0] ? `Prochain : ${fmtDateTime(upcoming[0].startAt)}` : undefined} />
        {canBilling && <Kpi label="Total facturé" value={money(totals.billed)} hint={`${money(totals.paid)} encaissé`} />}
        {canBilling && <Kpi label="Solde dû" value={<span className={totals.balance > 0 ? "text-red-600" : "text-emerald-600"}>{money(totals.balance)}</span>} />}
      </div>

      <div>
        <Tabs tabs={tabs} value={tab} onChange={setTab} />

        {tab === "overview" && (
          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-5">
              <Card>
                <CardHeader title="Notes internes" />
                <p className="whitespace-pre-line p-5 text-sm text-slate-600">{client.notes || "Aucune note pour ce client."}</p>
              </Card>
              <Card>
                <CardHeader title="Prochains rendez-vous" />
                {upcoming.length ? <AppointmentRows items={upcoming.slice(0, 4)} onOpen={setAppointment} /> : <EmptyState icon={CalendarPlus} title="Aucun rendez-vous à venir" />}
              </Card>
            </div>
            <div className="space-y-5">
              <Card>
                <CardHeader title="Informations" />
                <dl className="space-y-3 p-5 text-sm">
                  <Info label="Date de naissance" value={client.birthDate ? fmtDate(client.birthDate) : "—"} />
                  <Info label="Client depuis" value={client.createdAt ? fmtDate(client.createdAt) : "—"} />
                  <Info label="Adresse" value={client.address || "—"} />
                </dl>
              </Card>
              <Card>
                <CardHeader title="Portail patient" description="À communiquer au client pour accéder à son espace." />
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-[13px] text-muted">
                      <KeyRound size={15} /> Code d'accès
                    </span>
                    <span className="app-num font-mono text-lg font-semibold tracking-[0.2em] text-navy">{client.portalCode}</span>
                  </div>
                  <p className="mt-3 text-xs text-muted">{client.phone ? `Identifiant : ${client.phone}` : "Ajoutez un téléphone : il sert d'identifiant au portail."}</p>
                  <button type="button" onClick={() => void regenerateCode()} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-sage-600 hover:text-sage-700">
                    <RefreshCw size={14} /> Générer un nouveau code
                  </button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === "appointments" && (
          <Card className="mt-5 overflow-hidden">
            {appointments.length ? <AppointmentRows items={appointments} onOpen={setAppointment} /> : <EmptyState icon={CalendarPlus} title="Aucun rendez-vous" description="Planifiez le premier rendez-vous de ce client." />}
          </Card>
        )}

        {tab === "billing" && canBilling && (
          <div className="mt-5 space-y-5">
            <Card className="overflow-hidden">
              <CardHeader
                title="Factures"
                action={
                  <Button variant="secondary" className="h-8 px-3 text-xs" onClick={() => setBilling("invoice")}>
                    <Receipt size={14} /> Nouvelle facture
                  </Button>
                }
              />
              {invoices.length ? (
                <div className="overflow-x-auto">
                  <table className="app-table">
                    <thead>
                      <tr>
                        <th>Facture</th>
                        <th>Date</th>
                        <th className="num">Montant</th>
                        <th className="num">Payé</th>
                        <th>Statut</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice._id}>
                          <td className="whitespace-nowrap font-medium text-ink">{invoice.number}</td>
                          <td className="whitespace-nowrap text-muted">{fmtDate(invoice.createdAt)}</td>
                          <td className="num font-medium">{money(invoice.total)}</td>
                          <td className="num text-muted">{money(invoice.paidAmount)}</td>
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
                              <IconButton label="Télécharger le PDF" onClick={() => void downloadFile(api, `/invoices/${invoice._id}/pdf`, `${invoice.number}.pdf`)}>
                                <Download size={14} />
                              </IconButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon={Receipt} title="Aucune facture" />
              )}
            </Card>

            <div className="grid gap-5 xl:grid-cols-2">
              <Card className="overflow-hidden">
                <CardHeader
                  title="Devis"
                  action={
                    <Button variant="secondary" className="h-8 px-3 text-xs" onClick={() => setBilling("quote")}>
                      <FileText size={14} /> Nouveau devis
                    </Button>
                  }
                />
                {quotes.length ? (
                  <table className="app-table">
                    <tbody>
                      {quotes.map((quote) => (
                        <tr key={quote._id}>
                          <td className="font-medium text-ink">{quote.number}</td>
                          <td className="num">{money(quote.total)}</td>
                          <td>
                            <StatusBadge status={quote.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <EmptyState icon={FileText} title="Aucun devis" />
                )}
              </Card>
              <Card className="overflow-hidden">
                <CardHeader title="Paiements" />
                {payments.length ? (
                  <table className="app-table">
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment._id}>
                          <td className="whitespace-nowrap text-muted">{fmtDate(payment.paidAt)}</td>
                          <td className="text-slate-600">
                            {methodLabels[payment.method]} · {payment.invoice?.number}
                          </td>
                          <td className="num font-medium text-emerald-700">+{money(payment.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <EmptyState icon={Wallet} title="Aucun paiement" />
                )}
              </Card>
            </div>
          </div>
        )}

        {tab === "documents" && (
          <Card className="mt-5 overflow-hidden">
            <CardHeader
              title="Documents"
              description="PDF, images, Word ou Excel — 10 Mo maximum."
              action={
                <>
                  <input ref={fileInput} type="file" hidden accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx" onChange={(event) => void upload(event)} />
                  <Button variant="secondary" className="h-8 px-3 text-xs" onClick={() => fileInput.current?.click()}>
                    <Upload size={14} /> Ajouter
                  </Button>
                </>
              }
            />
            {documents.length ? (
              <ul className="divide-y divide-hairline">
                {documents.map((document) => (
                  <li key={document._id} className="flex items-center gap-3 px-5 py-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sage-50 text-sage-600">
                      <FileText size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <a href={`${apiOrigin}${document.fileUrl}`} target="_blank" rel="noreferrer" className="block truncate text-sm font-medium text-ink hover:text-sage-700">
                        {document.title}
                      </a>
                      <p className="text-xs text-muted">
                        {fmtDate(document.createdAt)} · {Math.max(1, Math.round(document.size / 1024))} Ko
                      </p>
                    </div>
                    <IconButton label="Supprimer le document" tone="danger" onClick={() => void removeDocument(document)}>
                      <Trash2 size={14} />
                    </IconButton>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={FolderOpen} title="Aucun document" description="Ajoutez une ordonnance, un compte rendu ou une pièce justificative." />
            )}
          </Card>
        )}
      </div>

      <ClientFormModal open={editing} client={client} onClose={() => setEditing(false)} onSaved={() => void reload()} />
      <AppointmentModal open={appointment !== null} appointment={appointment === "new" ? null : appointment} clientId={client._id} onClose={() => setAppointment(null)} onSaved={() => void reload()} />
      <BillingFormModal kind={billing ?? "invoice"} open={billing !== null} clientId={client._id} onClose={() => setBilling(null)} onSaved={() => void reload()} />
      <PaymentModal invoice={paying} onClose={() => setPaying(null)} onSaved={() => void reload()} />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

function AppointmentRows({ items, onOpen }: { items: Appointment[]; onOpen: (appointment: Appointment) => void }) {
  return (
    <ul className="divide-y divide-hairline">
      {items.map((item) => (
        <li key={item._id}>
          <button type="button" onClick={() => onOpen(item)} className="flex w-full items-center gap-4 px-5 py-3 text-left transition hover:bg-slate-50/70">
            <div className="w-12 shrink-0 rounded-lg bg-slate-50 py-1.5 text-center">
              <p className="text-[10px] font-semibold uppercase text-muted">{new Date(item.startAt).toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")}</p>
              <p className="app-num text-base font-semibold leading-none text-ink">{new Date(item.startAt).getDate()}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{item.service?.name ?? "Service"}</p>
              <p className="text-xs text-muted">{fmtDateTime(item.startAt)}</p>
            </div>
            <StatusBadge status={item.status} />
          </button>
        </li>
      ))}
    </ul>
  );
}
