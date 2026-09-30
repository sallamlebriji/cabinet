import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Clock, Plus, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { api } from "../services/api";
import { useAuth } from "../store/AuthContext";

type Client = { _id: string; firstName: string; lastName: string; email?: string };
type Service = { _id: string; name: string; duration: number; price: number };
type Appointment = {
  _id: string;
  startAt: string;
  endAt: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  client?: Client;
  service?: Service;
  notes?: string;
};
type Tenant = { _id: string; name: string };

const statuses: Appointment["status"][] = ["pending", "confirmed", "completed", "cancelled"];
const statusLabels: Record<Appointment["status"], string> = { pending: "En attente", confirmed: "Confirmé", completed: "Terminé", cancelled: "Annulé" };

export function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    client: "",
    service: "",
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    notes: ""
  });
  const [clientForm, setClientForm] = useState({ firstName: "", lastName: "", email: "" });
  const [serviceForm, setServiceForm] = useState({ name: "", duration: 30, price: 300 });

  async function load() {
    const params = selectedTenant ? `?tenantId=${selectedTenant}` : "";
    const [appointmentsResponse, clientsResponse, servicesResponse] = await Promise.all([
      api.get(`/appointments${params}`),
      api.get(`/clients${selectedTenant ? `${params}&limit=100` : "?limit=100"}`),
      api.get(`/services${params}`)
    ]);
    setAppointments(appointmentsResponse.data.items);
    setClients(clientsResponse.data.items);
    setServices(servicesResponse.data.items);
  }

  useEffect(() => {
    if (user?.role === "SUPER_ADMIN") {
      api.get("/tenants").then(({ data }) => {
        setTenants(data.items);
        setSelectedTenant((current) => current || data.items[0]?._id || "");
      });
      return;
    }
    void load();
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === "SUPER_ADMIN" && selectedTenant) void load();
  }, [selectedTenant, user?.role]);

  const canCreateAppointment = useMemo(() => clients.length > 0 && services.length > 0, [clients.length, services.length]);

  async function createClient(event: React.FormEvent) {
    event.preventDefault();
    await api.post("/clients", { ...clientForm, tenantId: selectedTenant || undefined });
    setClientForm({ firstName: "", lastName: "", email: "" });
    setMessage("Client ajouté.");
    await load();
  }

  async function createService(event: React.FormEvent) {
    event.preventDefault();
    await api.post("/services", { ...serviceForm, tenantId: selectedTenant || undefined });
    setServiceForm({ name: "", duration: 30, price: 300 });
    setMessage("Service ajouté.");
    await load();
  }

  async function createAppointment(event: React.FormEvent) {
    event.preventDefault();
    const service = services.find((item) => item._id === form.service);
    const startAt = new Date(`${form.date}T${form.time}:00`);
    const endAt = new Date(startAt.getTime() + (service?.duration ?? 30) * 60_000);
    await api.post("/appointments", { client: form.client, service: form.service, startAt, endAt, notes: form.notes, tenantId: selectedTenant || undefined });
    setForm((current) => ({ ...current, notes: "" }));
    setMessage("Rendez-vous créé.");
    await load();
  }

  async function changeStatus(id: string, status: Appointment["status"]) {
    await api.patch(`/appointments/${id}/status`, { status });
    await load();
  }

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <PageHeader
        title="Rendez-vous"
        description="Planification et suivi des rendez-vous par statut."
        actions={
          <Button type="button" variant="secondary" onClick={() => void load()}>
            <RefreshCw size={16} /> Actualiser
          </Button>
        }
      />

      {message && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</p>}

      {user?.role === "SUPER_ADMIN" && (
        <Card className="p-5">
          <label className="block max-w-xl">
            <span className="app-label">Cabinet à administrer</span>
            <select className="app-input" value={selectedTenant} onChange={(event) => setSelectedTenant(event.target.value)}>
              <option value="">Sélectionner un cabinet</option>
              {tenants.map((tenant) => (
                <option key={tenant._id} value={tenant._id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </label>
        </Card>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {statuses.map((status) => {
            const column = appointments.filter((item) => item.status === status);
            return (
              <div key={status} className="rounded-xl border border-hairline bg-slate-100/60 p-3">
                <div className="flex items-center justify-between px-1 pb-3">
                  <StatusBadge status={status} />
                  <span className="app-num grid h-5 min-w-5 place-items-center rounded-full bg-white px-1.5 text-[11px] font-semibold text-muted ring-1 ring-hairline">{column.length}</span>
                </div>
                <div className="space-y-2.5">
                  {column.map((item) => (
                    <div key={item._id} className="rounded-lg border border-hairline bg-white p-3 shadow-card">
                      <p className="text-sm font-semibold text-ink">
                        {item.client?.firstName} {item.client?.lastName}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">{item.service?.name || "Service"}</p>
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-ink/70">
                        <Clock size={13} className="text-muted" />
                        {new Date(item.startAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <select
                        aria-label="Changer le statut"
                        className="app-input mt-3 h-8 px-2 text-xs"
                        value={item.status}
                        onChange={(event) => void changeStatus(item._id, event.target.value as Appointment["status"])}
                      >
                        {statuses.map((nextStatus) => (
                          <option key={nextStatus} value={nextStatus}>
                            {statusLabels[nextStatus]}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  {!column.length && <p className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-xs text-muted">Aucun rendez-vous</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Nouveau rendez-vous" description="Choisissez un client, un service et un créneau." />
            <form onSubmit={createAppointment} className="space-y-3 p-5">
              <label className="block">
                <span className="app-label">Client</span>
                <select required disabled={!clients.length} className="app-input" value={form.client} onChange={(event) => setForm({ ...form, client: event.target.value })}>
                  <option value="">Sélectionner</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="app-label">Service</span>
                <select required disabled={!services.length} className="app-input" value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })}>
                  <option value="">Sélectionner</option>
                  {services.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.name} · {service.duration} min
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="app-label">Date</span>
                  <input required className="app-input" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
                </label>
                <label className="block">
                  <span className="app-label">Heure</span>
                  <input required className="app-input" type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} />
                </label>
              </div>
              <label className="block">
                <span className="app-label">Notes</span>
                <textarea className="app-input min-h-20" placeholder="Optionnel" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
              </label>
              <Button className="w-full" type="submit" disabled={!canCreateAppointment}>
                <CalendarPlus size={16} /> Planifier
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Ajout rapide" description="Créez un client ou un service sans quitter la page." />
            <form onSubmit={createClient} className="space-y-3 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Client</p>
              <div className="grid grid-cols-2 gap-3">
                <input required aria-label="Prénom" className="app-input" placeholder="Prénom" value={clientForm.firstName} onChange={(event) => setClientForm({ ...clientForm, firstName: event.target.value })} />
                <input required aria-label="Nom" className="app-input" placeholder="Nom" value={clientForm.lastName} onChange={(event) => setClientForm({ ...clientForm, lastName: event.target.value })} />
              </div>
              <input aria-label="Email" className="app-input" type="email" placeholder="Email (optionnel)" value={clientForm.email} onChange={(event) => setClientForm({ ...clientForm, email: event.target.value })} />
              <Button className="w-full" variant="secondary" type="submit">
                <Plus size={16} /> Ajouter le client
              </Button>
            </form>
            <form onSubmit={createService} className="space-y-3 border-t border-hairline p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Service</p>
              <input required aria-label="Nom du service" className="app-input" placeholder="Nom du service" value={serviceForm.name} onChange={(event) => setServiceForm({ ...serviceForm, name: event.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="app-label">Durée (min)</span>
                  <input required min={5} className="app-input" type="number" value={serviceForm.duration} onChange={(event) => setServiceForm({ ...serviceForm, duration: Number(event.target.value) })} />
                </label>
                <label className="block">
                  <span className="app-label">Prix (MAD)</span>
                  <input required min={0} className="app-input" type="number" value={serviceForm.price} onChange={(event) => setServiceForm({ ...serviceForm, price: Number(event.target.value) })} />
                </label>
              </div>
              <Button className="w-full" variant="secondary" type="submit">
                <Plus size={16} /> Ajouter le service
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
