import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Clock, Plus, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
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

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-ink">Nouveau client</h3>
          <form onSubmit={createClient} className="mt-4 space-y-3">
            <input required className="app-input" placeholder="Prénom" value={clientForm.firstName} onChange={(event) => setClientForm({ ...clientForm, firstName: event.target.value })} />
            <input required className="app-input" placeholder="Nom" value={clientForm.lastName} onChange={(event) => setClientForm({ ...clientForm, lastName: event.target.value })} />
            <input className="app-input" placeholder="Email" value={clientForm.email} onChange={(event) => setClientForm({ ...clientForm, email: event.target.value })} />
            <Button className="w-full" type="submit">
              <Plus size={16} /> Ajouter client
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-ink">Nouveau service</h3>
          <form onSubmit={createService} className="mt-4 space-y-3">
            <input required className="app-input" placeholder="Nom du service" value={serviceForm.name} onChange={(event) => setServiceForm({ ...serviceForm, name: event.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input required min={5} className="app-input" type="number" value={serviceForm.duration} onChange={(event) => setServiceForm({ ...serviceForm, duration: Number(event.target.value) })} />
              <input required min={0} className="app-input" type="number" value={serviceForm.price} onChange={(event) => setServiceForm({ ...serviceForm, price: Number(event.target.value) })} />
            </div>
            <Button className="w-full" type="submit">
              <Plus size={16} /> Ajouter service
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <CalendarPlus size={19} /> Nouveau rendez-vous
          </h3>
          <form onSubmit={createAppointment} className="mt-4 space-y-3">
            <select required disabled={!clients.length} className="app-input" value={form.client} onChange={(event) => setForm({ ...form, client: event.target.value })}>
              <option value="">Client</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.firstName} {client.lastName}
                </option>
              ))}
            </select>
            <select required disabled={!services.length} className="app-input" value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })}>
              <option value="">Service</option>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name} - {service.duration} min
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input required className="app-input" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
              <input required className="app-input" type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} />
            </div>
            <textarea className="app-input" placeholder="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            <Button className="w-full" type="submit" disabled={!canCreateAppointment}>
              <Clock size={16} /> Planifier
            </Button>
          </form>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-4">
        {statuses.map((status) => (
          <Card key={status} className="p-5">
            <div className="flex items-center justify-between">
              <StatusBadge status={status} />
              <span className="app-num text-xs font-semibold text-muted">{appointments.filter((item) => item.status === status).length}</span>
            </div>
            <div className="mt-4 space-y-3">
              {appointments.filter((item) => item.status === status).map((item) => (
                <div key={item._id} className="rounded-lg border border-hairline bg-slate-50/50 p-3">
                  <p className="text-sm font-semibold text-ink">
                    {item.client?.firstName} {item.client?.lastName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{item.service?.name || "Service"} · {new Date(item.startAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</p>
                  <select className="app-input mt-3 h-9" value={item.status} onChange={(event) => void changeStatus(item._id, event.target.value as Appointment["status"])}>
                    {statuses.map((nextStatus) => (
                      <option key={nextStatus} value={nextStatus}>
                        {statusLabels[nextStatus]}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              {!appointments.some((item) => item.status === status) && <p className="py-4 text-center text-xs text-muted">Aucun rendez-vous</p>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
