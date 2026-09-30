import { useEffect, useState } from "react";
import { Building2, LogIn, PauseCircle, PlayCircle, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { api } from "../services/api";
import { useAuth } from "../store/AuthContext";

type Tenant = {
  _id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  plan: "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
  isActive: boolean;
  usersCount?: number;
};

export function SuperAdmin() {
  const { user } = useAuth();
  const [items, setItems] = useState<Tenant[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    plan: "FREE",
    adminName: "",
    adminEmail: "",
    adminPassword: "password123"
  });

  async function load() {
    const { data } = await api.get("/tenants");
    setItems(data.items);
  }

  useEffect(() => {
    if (user?.role === "SUPER_ADMIN") void load();
  }, [user?.role]);

  async function provisionTenant(event: React.FormEvent) {
    event.preventDefault();
    await api.post("/tenants/provision", {
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      plan: form.plan,
      withDemoData: true,
      admin: {
        name: form.adminName,
        email: form.adminEmail,
        password: form.adminPassword
      }
    });
    setForm({ name: "", email: "", phone: "", address: "", plan: "FREE", adminName: "", adminEmail: "", adminPassword: "password123" });
    await load();
  }

  async function toggleTenant(id: string) {
    await api.patch(`/tenants/${id}/toggle`);
    await load();
  }

  async function deleteTenant(id: string) {
    await api.delete(`/tenants/${id}`);
    await load();
  }

  async function impersonate(id: string) {
    const { data } = await api.post(`/tenants/${id}/impersonate`);
    localStorage.setItem("accessToken", data.accessToken);
    window.location.href = "/dashboard";
  }

  if (user?.role !== "SUPER_ADMIN") {
    return (
      <div className="p-4 sm:p-8">
        <Card className="flex items-center gap-3 p-6 text-muted">
          <ShieldAlert size={22} />
          Accès réservé au super admin.
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <PageHeader title="Cabinets" description="Création, suspension et supervision des cabinets de la plateforme." />

      <Card className="p-5">
        <form onSubmit={provisionTenant} className="grid gap-3 xl:grid-cols-4">
          <input required className="app-input" placeholder="Nom du cabinet" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input className="app-input" placeholder="Email du cabinet" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input className="app-input" placeholder="Téléphone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <select className="app-input" value={form.plan} onChange={(event) => setForm({ ...form, plan: event.target.value })}>
            <option value="FREE">FREE</option>
            <option value="STARTER">STARTER</option>
            <option value="PRO">PRO</option>
            <option value="ENTERPRISE">ENTERPRISE</option>
          </select>
          <input required className="app-input" placeholder="Nom de l'administrateur" value={form.adminName} onChange={(event) => setForm({ ...form, adminName: event.target.value })} />
          <input required className="app-input" placeholder="Email de l'administrateur" value={form.adminEmail} onChange={(event) => setForm({ ...form, adminEmail: event.target.value })} />
          <input required className="app-input" placeholder="Mot de passe" value={form.adminPassword} onChange={(event) => setForm({ ...form, adminPassword: event.target.value })} />
          <Button type="submit">
            <Plus size={16} /> Créer le cabinet
          </Button>
        </form>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        {items.map((tenant) => (
          <Card key={tenant._id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-ink">{tenant.name}</p>
                <p className="mt-0.5 text-xs text-muted">{tenant.slug} · {tenant.email || "Email non renseigné"}</p>
              </div>
              <span className="rounded-md bg-sage-50 px-2 py-0.5 text-xs font-semibold text-sage-700 ring-1 ring-inset ring-sage-200">{tenant.plan}</span>
            </div>
            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 text-muted">
                <Building2 size={16} /> {tenant.usersCount ?? 0} utilisateur(s)
              </span>
              <StatusBadge status={tenant.isActive ? "active" : "suspended"} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => void impersonate(tenant._id)}><LogIn size={15} /> Accéder</Button>
              <Button type="button" variant="secondary" onClick={() => void toggleTenant(tenant._id)}>{tenant.isActive ? <PauseCircle size={15} /> : <PlayCircle size={15} />} {tenant.isActive ? "Suspendre" : "Réactiver"}</Button>
              <button type="button" onClick={() => void deleteTenant(tenant._id)} className="grid h-10 w-10 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50" aria-label="Supprimer tenant">
                <Trash2 size={18} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
