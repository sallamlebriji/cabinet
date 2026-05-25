import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, Save, Search, Trash2, UserPlus, Users } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
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
        setMessage("Client mis a jour.");
      } else {
        await api.post("/clients", { ...payload, tenantId: selectedTenant || undefined });
        setMessage("Client ajoute.");
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
    setMessage("Client supprime.");
    await load();
  }

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    await load(query);
  }

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-ink">Clients / Patients</h2>
          <p className="mt-2 text-muted">Dossiers clients, contacts, notes internes et recherche rapide.</p>
        </div>
        <Button type="button" onClick={() => fillForm(null)}>
          <UserPlus size={18} /> Nouveau client
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

      <div className="grid gap-5 md:grid-cols-3">
        <Metric label="Clients" value={stats.total} icon={Users} />
        <Metric label="Emails renseignes" value={stats.withEmail} icon={Mail} />
        <Metric label="Telephones renseignes" value={stats.withPhone} icon={Phone} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card className="overflow-hidden">
          <form onSubmit={handleSearch} className="flex items-center gap-3 border-b border-line px-5 py-4">
            <Search size={18} className="text-muted" />
            <input className="h-10 flex-1 bg-transparent outline-none" placeholder="Rechercher par nom, email ou telephone" value={query} onChange={(event) => setQuery(event.target.value)} />
            <Button type="submit" variant="secondary">Chercher</Button>
          </form>
          <div className="divide-y divide-line">
            {clients.map((client) => (
              <div key={client._id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_1fr_130px] lg:items-center">
                <button type="button" onClick={() => fillForm(client)} className="text-left">
                  <p className="font-semibold text-ink">{client.firstName} {client.lastName}</p>
                  <p className="mt-1 text-sm text-muted">{client.notes || "Aucune note interne"}</p>
                </button>
                <div className="space-y-1 text-sm text-muted">
                  <p>{client.email || "Email non renseigne"}</p>
                  <p>{client.phone || "Telephone non renseigne"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" onClick={() => fillForm(client)}>Modifier</Button>
                  <button type="button" onClick={() => void removeClient(client)} className="grid h-11 w-11 place-items-center rounded-lg border border-line text-red-600" aria-label="Supprimer">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {!clients.length && <p className="p-5 text-muted">Aucun client trouve.</p>}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-bold text-ink">{selected ? "Modifier le client" : "Nouveau client"}</h3>
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Prenom" value={form.firstName} onChange={(value) => setForm({ ...form, firstName: value })} />
              <Field label="Nom" value={form.lastName} onChange={(value) => setForm({ ...form, lastName: value })} />
            </div>
            <Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required={false} />
            <Field label="Telephone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} required={false} />
            <Field label="Adresse" value={form.address} onChange={(value) => setForm({ ...form, address: value })} required={false} />
            <Field label="Tags" value={form.tags} onChange={(value) => setForm({ ...form, tags: value })} required={false} placeholder="vip, entreprise" />
            <label className="block">
              <span className="text-sm font-semibold text-ink">Notes internes</span>
              <textarea className="mt-2 min-h-28 w-full rounded-lg border border-line p-3 outline-none focus:border-brand-500" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </label>
            <Button className="w-full" type="submit" disabled={isSaving}>
              <Save size={18} /> {isSaving ? "Enregistrement..." : "Enregistrer"}
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
        <p className="text-sm font-semibold text-muted">{label}</p>
        <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
      </div>
      <div className="grid h-12 w-12 place-items-center rounded-lg bg-brand-50 text-brand-600">
        <Icon size={22} />
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
      <span className="text-sm font-semibold text-ink">{label}</span>
      <input required={required} type={type} placeholder={placeholder} className="mt-2 h-11 w-full rounded-lg border border-line px-3 outline-none focus:border-brand-500" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
