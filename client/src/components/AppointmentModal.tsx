import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/Button";
import { Field } from "./ui/Bits";
import { Modal } from "./ui/Modal";
import { useToast } from "./ui/Toast";
import { apiError, fullName, toDateInput, toTimeInput } from "../lib/format";
import { appointmentStatusLabels, type Appointment, type AppointmentStatus, type Client, type Service } from "../lib/types";
import { api } from "../services/api";
import { cn } from "../utils/cn";

const statuses: AppointmentStatus[] = ["pending", "confirmed", "completed", "cancelled"];

export function AppointmentModal({
  open,
  onClose,
  onSaved,
  appointment,
  initialStart,
  clientId
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  appointment?: Appointment | null;
  initialStart?: Date | null;
  clientId?: string;
}) {
  const toast = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({ client: "", service: "", date: "", time: "09:00", notes: "" });
  const [status, setStatus] = useState<AppointmentStatus>("confirmed");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const start = appointment ? new Date(appointment.startAt) : initialStart ?? new Date();
    setForm({
      client: appointment?.client?._id ?? clientId ?? "",
      service: appointment?.service?._id ?? "",
      date: toDateInput(start),
      time: appointment || initialStart ? toTimeInput(start) : "09:00",
      notes: appointment?.notes ?? ""
    });
    setStatus(appointment?.status ?? "confirmed");
    Promise.all([api.get("/clients", { params: { limit: 200 } }), api.get("/services")])
      .then(([clientsResponse, servicesResponse]) => {
        setClients(clientsResponse.data.items);
        setServices(servicesResponse.data.items.filter((service: Service) => service.isActive !== false));
      })
      .catch((error) => toast.error(apiError(error)));
  }, [open, appointment, initialStart, clientId, toast]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const service = services.find((item) => item._id === form.service);
    const startAt = new Date(`${form.date}T${form.time}:00`);
    const endAt = new Date(startAt.getTime() + (service?.duration ?? 30) * 60_000);
    setSaving(true);
    try {
      const payload = { client: form.client, service: form.service, startAt, endAt, notes: form.notes };
      if (appointment) {
        await api.put(`/appointments/${appointment._id}`, payload);
        if (status !== appointment.status) await api.patch(`/appointments/${appointment._id}/status`, { status });
      } else {
        await api.post("/appointments", { ...payload, status });
      }
      toast.ok(appointment ? "Rendez-vous mis à jour." : "Rendez-vous planifié.");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!appointment || !window.confirm("Supprimer ce rendez-vous ?")) return;
    try {
      await api.delete(`/appointments/${appointment._id}`);
      toast.ok("Rendez-vous supprimé.");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(apiError(error, "Suppression non autorisée."));
    }
  }

  const noService = open && !services.length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={appointment ? "Rendez-vous" : "Nouveau rendez-vous"}
      description={appointment?.source === "online" ? "Demande reçue via la réservation en ligne." : undefined}
      footer={
        <>
          {appointment && (
            <Button variant="danger" type="button" onClick={() => void remove()} className="mr-auto">
              <Trash2 size={15} /> Supprimer
            </Button>
          )}
          <Button variant="secondary" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="appointment-form" disabled={saving || noService}>
            {saving ? "Enregistrement…" : appointment ? "Enregistrer" : "Planifier"}
          </Button>
        </>
      }
    >
      <form id="appointment-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Client" className="sm:col-span-2">
          <select required className="app-input" value={form.client} onChange={(event) => setForm({ ...form, client: event.target.value })}>
            <option value="">Sélectionner un client</option>
            {clients.map((client) => (
              <option key={client._id} value={client._id}>
                {fullName(client)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Service" className="sm:col-span-2" hint={noService ? "Aucun service : créez-en un dans Paramètres → Services." : undefined}>
          <select required className="app-input" value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })}>
            <option value="">Sélectionner un service</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.name} · {service.duration} min
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input required type="date" className="app-input" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
        </Field>
        <Field label="Heure">
          <input required type="time" step={300} className="app-input" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <span className="app-label">Statut</span>
          <div className="flex flex-wrap gap-1.5">
            {statuses.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStatus(item)}
                className={cn(
                  "h-8 rounded-full border px-3 text-[12.5px] font-medium transition",
                  status === item ? "border-navy bg-navy text-white" : "border-hairline bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                {appointmentStatusLabels[item]}
              </button>
            ))}
          </div>
        </div>
        <Field label="Notes" className="sm:col-span-2">
          <textarea className="app-input min-h-20" placeholder="Optionnel" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </Field>
      </form>
    </Modal>
  );
}
