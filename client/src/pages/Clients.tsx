import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, Save, Search, Trash2, UserPlus, Users } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { api } from "../services/api";
import { useAuth } from "../store/AuthContext";

type Client = {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  createdAt?: string;
};
type Tenant = { _id: string; name: string };

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  tags: ""
};

export function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load(search = query) {
    const params = new URLSearchParams({ limit: "100" });
    if (search) params.set("q", search);
    if (selectedTenant) params.set("tenantId", selectedTenant);
    const { data } = await api.get(`/clients?${params.toString()}`);
    setClients(data.items);
  }

  useEffect(() => {
    if (user?.role === "SUPER_ADMIN") {
      api.get("/tenants").then(({ data }) => {
        setTenants(data.items);
        setSelectedTenant((current) => current || data.items[0]?._id || "");
      });
      return;
    }
    void load("");
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === "SUPER_ADMIN" && selectedTenant) void load("");
  }, [selectedTenant, user?.role]);

  const stats = useMemo(() => {
    const withEmail = clients.filter((client) => client.email).length;
    const withPhone = clients.filter((client) => client.phone).length;
    return { total: clients.length, withEmail, withPhone };
  }, [clients]);

  function fillForm(client: Client | null) {
    setSelected(client);
    if (!client) {
      setForm(emptyForm);
      return;
    }
    setForm({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      notes: client.notes || "",
      tags: client.tags?.join(", ") || ""
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    const payload = {
      ...form,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    };

    try {
      if (selected) {
        await api.put(`/clients/${selected._id}`, payload);
        setMessage("Client mis à jour.");
      } else {
        await api.post("/clients", { ...payload, tenantId: selectedTenant || undefined });
        setMessage("Client ajouté.");
      }
      fillForm(null);
      await load();
    } finally {
      setIsSaving(false);
    }
  }

  async function removeClient(client: Client) {
    await api.delete(`/clients/${client._id}`);
    if (selected?._id === client._id) fillForm(null);
    setMessage("Client supprimé.");
    await load();
  }

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    await load(query);
  }

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <PageHeader
        title="Clients"
        description="Dossiers clients, contacts, notes internes et recherche rapide."
        actions={
          <Button type="button" onClick={() => fillForm(null)}>
            <UserPlus size={16} /> Nouveau client
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

      <div className="grid gap-5 md:grid-cols-3">
        <Metric label="Clients" value={stats.total} icon={Users} />
        <Metric label="Emails renseignés" value={stats.withEmail} icon={Mail} />
        <Metric label="Téléphones renseignés" value={stats.withPhone} icon={Phone} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card className="overflow-hidden">
          <form onSubmit={handleSearch} className="flex items-center gap-3 border-b border-hairline px-5 py-4">
            <Search size={17} className="text-muted" />
            <input className="h-10 flex-1 bg-transparent text-sm outline-none" placeholder="Rechercher par nom, email ou telephone" value={query} onChange={(event) => setQuery(event.target.value)} />
            <Button type="submit" variant="secondary">Chercher</Button>
          </form>
          <div className="divide-y divide-hairline">
            {clients.map((client) => (
              <div key={client._id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_1fr_130px] lg:items-center">
                <button type="button" onClick={() => fillForm(client)} className="text-left">
                  <p className="text-sm font-semibold text-ink">{client.firstName} {client.lastName}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted">{client.notes || "Aucune note interne"}</p>
                </button>
                <div className="space-y-1 text-sm text-muted">
                  <p>{client.email || "Email non renseigné"}</p>
                  <p>{client.phone || "Téléphone non renseigné"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" onClick={() => fillForm(client)}>Modifier</Button>
                  <button type="button" onClick={() => void removeClient(client)} className="grid h-10 w-10 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50" aria-label="Supprimer">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {!clients.length && <EmptyState icon={Users} title="Aucun client trouvé" description="Ajoutez votre premier client depuis le formulaire." />}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-ink">{selected ? "Modifier le client" : "Nouveau client"}</h3>
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Prénom" value={form.firstName} onChange={(value) => setForm({ ...form, firstName: value })} />
              <Field label="Nom" value={form.lastName} onChange={(value) => setForm({ ...form, lastName: value })} />
            </div>
            <Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required={false} />
            <Field label="Téléphone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} required={false} />
            <Field label="Adresse" value={form.address} onChange={(value) => setForm({ ...form, address: value })} required={false} />
            <Field label="Tags" value={form.tags} onChange={(value) => setForm({ ...form, tags: value })} required={false} placeholder="vip, entreprise" />
            <label className="block">
              <span className="app-label">Notes internes</span>
              <textarea className="app-input" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </label>
            <Button className="w-full" type="submit" disabled={isSaving}>
              <Save size={16} /> {isSaving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  return (
    <Card className="flex items-center justify-between p-5">
      <div>
        <p className="text-sm font-medium text-muted">{label}</p>
        <p className="app-num mt-2 text-2xl font-semibold text-ink">{value}</p>
      </div>
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-sage-50 text-sage-600">
        <Icon size={18} />
      </div>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = true,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="app-label">{label}</span>
      <input required={required} type={type} placeholder={placeholder} className="app-input" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
