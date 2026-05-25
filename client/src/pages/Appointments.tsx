import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Clock, Plus, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
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
    setMessage("Client ajoute.");
    await load();
  }

  async function createService(event: React.FormEvent) {
    event.preventDefault();
    await api.post("/services", { ...serviceForm, tenantId: selectedTenant || undefined });
    setServiceForm({ name: "", duration: 30, price: 300 });
    setMessage("Service ajoute.");
    await load();
  }

  async function createAppointment(event: React.FormEvent) {
    event.preventDefault();
    const service = services.find((item) => item._id === form.service);
    const startAt = new Date(`${form.date}T${form.time}:00`);
    const endAt = new Date(startAt.getTime() + (service?.duration ?? 30) * 60_000);
    await api.post("/appointments", { client: form.client, service: form.service, startAt, endAt, notes: form.notes, tenantId: selectedTenant || undefined });
    setForm((current) => ({ ...current, notes: "" }));
    setMessage("Rendez-vous cree.");
    await load();
  }

  async function changeStatus(id: string, status: Appointment["status"]) {
    await api.patch(`/appointments/${id}/status`, { status });
    await load();
  }

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-ink">Rendez-vous</h2>
          <p className="mt-2 text-muted">Creation, planning et suivi des statuts branches sur l'API.</p>
        </div>
        <Button type="button" onClick={() => void load()}>
          <RefreshCw size={18} /> Actualiser
        </Button>
      </div>

      {message && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p>}

      {user?.role === "SUPER_ADMIN" && (
        <Card className="p-5">
          <label className="block max-w-xl">
            <span className="text-sm font-semibold text-ink">Tenant a administrer</span>
            <select className="mt-2 h-11 w-full rounded-lg border border-line px-3 outline-none" value={selectedTenant} onChange={(event) => setSelectedTenant(event.target.value)}>
              <option value="">Selectionner un tenant</option>
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
          <h3 className="font-bold text-ink">Nouveau client</h3>
          <form onSubmit={createClient} className="mt-4 space-y-3">
            <input required className="h-11 w-full rounded-lg border border-line px-3 outline-none" placeholder="Prenom" value={clientForm.firstName} onChange={(event) => setClientForm({ ...clientForm, firstName: event.target.value })} />
            <input required className="h-11 w-full rounded-lg border border-line px-3 outline-none" placeholder="Nom" value={clientForm.lastName} onChange={(event) => setClientForm({ ...clientForm, lastName: event.target.value })} />
            <input className="h-11 w-full rounded-lg border border-line px-3 outline-none" placeholder="Email" value={clientForm.email} onChange={(event) => setClientForm({ ...clientForm, email: event.target.value })} />
            <Button className="w-full" type="submit">
              <Plus size={18} /> Ajouter client
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-ink">Nouveau service</h3>
          <form onSubmit={createService} className="mt-4 space-y-3">
            <input required className="h-11 w-full rounded-lg border border-line px-3 outline-none" placeholder="Nom du service" value={serviceForm.name} onChange={(event) => setServiceForm({ ...serviceForm, name: event.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input required min={5} className="h-11 rounded-lg border border-line px-3 outline-none" type="number" value={serviceForm.duration} onChange={(event) => setServiceForm({ ...serviceForm, duration: Number(event.target.value) })} />
              <input required min={0} className="h-11 rounded-lg border border-line px-3 outline-none" type="number" value={serviceForm.price} onChange={(event) => setServiceForm({ ...serviceForm, price: Number(event.target.value) })} />
            </div>
            <Button className="w-full" type="submit">
              <Plus size={18} /> Ajouter service
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <h3 className="flex items-center gap-2 font-bold text-ink">
            <CalendarPlus size={19} /> Nouveau rendez-vous
          </h3>
          <form onSubmit={createAppointment} className="mt-4 space-y-3">
            <select required disabled={!clients.length} className="h-11 w-full rounded-lg border border-line px-3 outline-none" value={form.client} onChange={(event) => setForm({ ...form, client: event.target.value })}>
              <option value="">Client</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.firstName} {client.lastName}
                </option>
              ))}
            </select>
            <select required disabled={!services.length} className="h-11 w-full rounded-lg border border-line px-3 outline-none" value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })}>
              <option value="">Service</option>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name} - {service.duration} min
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input required className="h-11 rounded-lg border border-line px-3 outline-none" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
              <input required className="h-11 rounded-lg border border-line px-3 outline-none" type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} />
            </div>
            <textarea className="min-h-20 w-full rounded-lg border border-line p-3 outline-none" placeholder="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            <Button className="w-full" type="submit" disabled={!canCreateAppointment}>
              <Clock size={18} /> Planifier
            </Button>
          </form>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-4">
        {statuses.map((status) => (
          <Card key={status} className="p-5">
            <h3 className="capitalize font-bold text-ink">{status}</h3>
            <div className="mt-4 space-y-3">
              {appointments.filter((item) => item.status === status).map((item) => (
                <div key={item._id} className="rounded-lg border border-line p-3">
                  <p className="font-semibold text-ink">
                    {item.client?.firstName} {item.client?.lastName}
                  </p>
                  <p className="text-sm text-muted">{item.service?.name || "Service"} - {new Date(item.startAt).toLocaleString()}</p>
                  <select className="mt-3 h-9 w-full rounded-lg border border-line px-2 text-sm outline-none" value={item.status} onChange={(event) => void changeStatus(item._id, event.target.value as Appointment["status"])}>
                    {statuses.map((nextStatus) => (
                      <option key={nextStatus} value={nextStatus}>
                        {nextStatus}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              {!appointments.some((item) => item.status === status) && <p className="text-sm text-muted">Aucun rendez-vous.</p>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
