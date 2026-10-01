import { useEffect, useState } from "react";
import { Copy, ExternalLink, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Field, IconButton, Tabs } from "../components/ui/Bits";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { useToast } from "../components/ui/Toast";
import { useApi } from "../hooks/useApi";
import { apiError, money } from "../lib/format";
import type { Service } from "../lib/types";
import { api } from "../services/api";

type Hours = { day: string; open: string; close: string; closed: boolean };
type SettingsData = { cabinetName: string; slug?: string; email?: string; phone?: string; address?: string; openingHours: Hours[] };
type Tab = "profile" | "hours" | "services" | "links";

const weekDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export function Settings() {
  const toast = useToast();
  const { data, loading, reload } = useApi<{ settings: SettingsData | null }>("/settings");
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState({ cabinetName: "", email: "", phone: "", address: "" });
  const [hours, setHours] = useState<Hours[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const settings = data?.settings;
    if (!settings) return;
    setProfile({ cabinetName: settings.cabinetName ?? "", email: settings.email ?? "", phone: settings.phone ?? "", address: settings.address ?? "" });
    setHours(
      weekDays.map((day) => {
        const saved = settings.openingHours?.find((item) => item.day === day);
        return saved ? { day, open: saved.open, close: saved.close, closed: Boolean(saved.closed) } : { day, open: "09:00", close: "18:00", closed: true };
      })
    );
  }, [data]);

  async function save(body: object, message: string) {
    setSaving(true);
    try {
      await api.put("/settings", body);
      toast.ok(message);
      await reload();
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setSaving(false);
    }
  }

  const slug = data?.settings?.slug;
  const links = slug
    ? [
        { label: "Réservation en ligne", text: "Vos clients choisissent un service et un créneau libre.", url: `${window.location.origin}/rdv?cabinet=${slug}` },
        { label: "Portail patient", text: "Accès aux rendez-vous et aux factures avec le téléphone et le code d'accès.", url: `${window.location.origin}/portail?cabinet=${slug}` }
      ]
    : [];

  return (
    <div className="space-y-6 p-4 sm:p-7">
      <PageHeader title="Paramètres" description="Identité du cabinet, horaires, services et liens publics." />

      <div>
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "profile", label: "Cabinet" },
            { value: "hours", label: "Horaires" },
            { value: "services", label: "Services" },
            { value: "links", label: "Liens publics" }
          ]}
        />

        {loading ? (
          <Card className="mt-5 p-6 text-sm text-muted">Chargement…</Card>
        ) : tab === "profile" ? (
          <Card className="mt-5 max-w-3xl">
            <CardHeader title="Profil du cabinet" description="Ces informations apparaissent sur le site public, la réservation et vos documents PDF." />
            <form
              className="p-5"
              onSubmit={(event) => {
                event.preventDefault();
                void save(profile, "Profil enregistré.");
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom du cabinet">
                  <input required className="app-input" value={profile.cabinetName} onChange={(event) => setProfile({ ...profile, cabinetName: event.target.value })} />
                </Field>
                <Field label="Email de contact">
                  <input type="email" className="app-input" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} />
                </Field>
                <Field label="Téléphone">
                  <input className="app-input" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
                </Field>
                <Field label="Adresse">
                  <input className="app-input" value={profile.address} onChange={(event) => setProfile({ ...profile, address: event.target.value })} />
                </Field>
              </div>
              <Button type="submit" className="mt-6" disabled={saving}>
                <Save size={15} /> {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </form>
          </Card>
        ) : tab === "hours" ? (
          <Card className="mt-5 max-w-3xl">
            <CardHeader title="Horaires d'ouverture" description="Ils déterminent les créneaux proposés à la réservation en ligne." />
            <div className="divide-y divide-hairline">
              {hours.map((row, index) => (
                <div key={row.day} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <label className="flex w-36 items-center gap-2.5 text-sm font-medium text-ink">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#2563eb]"
                      checked={!row.closed}
                      onChange={(event) => setHours(hours.map((item, position) => (position === index ? { ...item, closed: !event.target.checked } : item)))}
                    />
                    {row.day}
                  </label>
                  {row.closed ? (
                    <span className="text-sm text-muted">Fermé</span>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <input aria-label={`Ouverture ${row.day}`} type="time" className="app-input h-9 w-28" value={row.open} onChange={(event) => setHours(hours.map((item, position) => (position === index ? { ...item, open: event.target.value } : item)))} />
                      à
                      <input aria-label={`Fermeture ${row.day}`} type="time" className="app-input h-9 w-28" value={row.close} onChange={(event) => setHours(hours.map((item, position) => (position === index ? { ...item, close: event.target.value } : item)))} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-hairline p-5">
              <Button
                disabled={saving}
                onClick={() => {
                  if (hours.some((row) => !row.closed && row.close <= row.open)) return toast.error("L'heure de fermeture doit suivre l'heure d'ouverture.");
                  void save({ openingHours: hours }, "Horaires enregistrés.");
                }}
              >
                <Save size={15} /> {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </Card>
        ) : tab === "services" ? (
          <ServicesPanel />
        ) : (
          <Card className="mt-5 max-w-3xl">
            <CardHeader title="Liens à partager" description="À mettre sur votre site, vos réseaux sociaux ou vos SMS de rappel." />
            {links.length ? (
              <ul className="divide-y divide-hairline">
                {links.map((link) => (
                  <li key={link.label} className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{link.label}</p>
                      <p className="text-xs text-muted">{link.text}</p>
                      <p className="mt-1.5 truncate rounded-lg bg-slate-50 px-2.5 py-1.5 font-mono text-xs text-slate-600">{link.url}</p>
                    </div>
                    <IconButton label="Copier le lien" onClick={() => void navigator.clipboard.writeText(link.url).then(() => toast.ok("Lien copié."))}>
                      <Copy size={14} />
                    </IconButton>
                    <a href={link.url} target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-lg border border-hairline text-slate-600 hover:bg-slate-50" aria-label="Ouvrir" title="Ouvrir">
                      <ExternalLink size={14} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={ExternalLink} title="Liens indisponibles" description="Ce cabinet n'a pas encore d'identifiant public." />
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

const emptyService = { name: "", duration: 30, price: 0, description: "", isActive: true };

function ServicesPanel() {
  const toast = useToast();
  const { data, loading, reload } = useApi<{ items: Service[] }>("/services");
  const [editing, setEditing] = useState<Service | null | "new">(null);
  const [form, setForm] = useState(emptyService);
  const [saving, setSaving] = useState(false);
  const services = data?.items ?? [];

  useEffect(() => {
    if (editing === null) return;
    setForm(editing === "new" ? emptyService : { name: editing.name, duration: editing.duration, price: editing.price, description: editing.description ?? "", isActive: editing.isActive !== false });
  }, [editing]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing === "new") await api.post("/services", form);
      else if (editing) await api.put(`/services/${editing._id}`, form);
      toast.ok("Service enregistré.");
      setEditing(null);
      await reload();
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setSaving(false);
    }
  }

  async function remove(service: Service) {
    if (!window.confirm(`Supprimer le service « ${service.name} » ?`)) return;
    try {
      await api.delete(`/services/${service._id}`);
      await reload();
    } catch (error) {
      toast.error(apiError(error));
    }
  }

  return (
    <Card className="mt-5 max-w-3xl overflow-hidden">
      <CardHeader
        title="Services proposés"
        description="Utilisés pour les rendez-vous, la réservation en ligne et la facturation."
        action={
          <Button variant="secondary" className="h-8 px-3 text-xs" onClick={() => setEditing("new")}>
            <Plus size={14} /> Ajouter
          </Button>
        }
      />
      {loading ? (
        <p className="p-5 text-sm text-muted">Chargement…</p>
      ) : services.length ? (
        <table className="app-table">
          <thead>
            <tr>
              <th>Service</th>
              <th className="num">Durée</th>
              <th className="num">Prix</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service._id} className={service.isActive === false ? "opacity-60" : ""}>
                <td>
                  <p className="font-medium text-ink">
                    {service.name}
                    {service.isActive === false && <span className="ml-2 text-xs font-normal text-muted">(masqué)</span>}
                  </p>
                  <p className="max-w-sm truncate text-xs text-muted">{service.description}</p>
                </td>
                <td className="num text-slate-600">{service.duration} min</td>
                <td className="num font-medium">{money(service.price)}</td>
                <td>
                  <div className="flex justify-end gap-1.5">
                    <IconButton label="Modifier" onClick={() => setEditing(service)}>
                      <Pencil size={14} />
                    </IconButton>
                    <IconButton label="Supprimer" tone="danger" onClick={() => void remove(service)}>
                      <Trash2 size={14} />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <EmptyState icon={Plus} title="Aucun service" description="Ajoutez vos prestations pour planifier des rendez-vous." />
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        size="sm"
        title={editing === "new" ? "Nouveau service" : "Modifier le service"}
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setEditing(null)}>
              Annuler
            </Button>
            <Button type="submit" form="service-form" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form id="service-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom" className="sm:col-span-2">
            <input required className="app-input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </Field>
          <Field label="Durée (min)">
            <input required type="number" min={5} step={5} className="app-input" value={form.duration} onChange={(event) => setForm({ ...form, duration: Number(event.target.value) })} />
          </Field>
          <Field label="Prix (MAD)">
            <input required type="number" min={0} step="0.01" className="app-input" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea className="app-input min-h-20" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </Field>
          <label className="flex items-center gap-2.5 text-sm text-ink sm:col-span-2">
            <input type="checkbox" className="h-4 w-4 accent-[#2563eb]" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
            Proposé à la réservation en ligne
          </label>
        </form>
      </Modal>
    </Card>
  );
}
