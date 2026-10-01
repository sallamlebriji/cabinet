import { useEffect, useState } from "react";
import { Building2, LogIn, PauseCircle, PlayCircle, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { api, setScopeTenant } from "../services/api";
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

const planLabels: Record<Tenant["plan"], string> = { FREE: "Gratuit", STARTER: "Starter", PRO: "Pro", ENTERPRISE: "Entreprise" };

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

  async function deleteTenant(tenant: Tenant) {
    if (!window.confirm(`Supprimer définitivement le cabinet « ${tenant.name} » ?`)) return;
    await api.delete(`/tenants/${tenant._id}`);
    await load();
  }

  function impersonate(id: string) {
    setScopeTenant(id);
    window.location.href = "/app";
  }

  if (user?.role !== "SUPER_ADMIN") {
    return (
      <div className="p-4 sm:p-7">
        <Card className="flex items-center gap-3 p-6 text-muted">
          <ShieldAlert size={22} />
          Accès réservé au super admin.
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-7">
      <PageHeader title="Cabinets" description="Création, suspension et supervision des cabinets de la plateforme." />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Cabinets", value: items.length },
          { label: "Actifs", value: items.filter((tenant) => tenant.isActive).length },
          { label: "Utilisateurs", value: items.reduce((sum, tenant) => sum + (tenant.usersCount ?? 0), 0) }
        ].map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-sm font-medium text-muted">{item.label}</p>
            <p className="app-num mt-2 text-2xl font-semibold text-ink">{item.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="overflow-hidden">
          <CardHeader title="Cabinets de la plateforme" description={`${items.length} cabinet(s) enregistré(s)`} />
          {items.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-hairline text-xs text-muted">
                    <th className="px-5 py-3 font-medium">Cabinet</th>
                    <th className="px-5 py-3 font-medium">Plan</th>
                    <th className="hidden px-5 py-3 font-medium md:table-cell">Utilisateurs</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {items.map((tenant) => (
                    <tr key={tenant._id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                            <Building2 size={16} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">{tenant.name}</p>
                            <p className="truncate text-xs text-muted">{tenant.email || tenant.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-md bg-sage-50 px-2 py-0.5 text-xs font-semibold text-sage-700 ring-1 ring-inset ring-sage-200">{planLabels[tenant.plan]}</span>
                      </td>
                      <td className="app-num hidden px-5 py-3.5 text-muted md:table-cell">{tenant.usersCount ?? 0}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={tenant.isActive ? "active" : "suspended"} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <Button type="button" variant="secondary" className="h-8 px-2.5 text-xs" onClick={() => void impersonate(tenant._id)}>
                            <LogIn size={14} /> Accéder
                          </Button>
                          <button
                            type="button"
                            onClick={() => void toggleTenant(tenant._id)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-hairline text-slate-600 transition hover:bg-slate-50"
                            aria-label={tenant.isActive ? "Suspendre" : "Réactiver"}
                            title={tenant.isActive ? "Suspendre" : "Réactiver"}
                          >
                            {tenant.isActive ? <PauseCircle size={15} /> : <PlayCircle size={15} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteTenant(tenant)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                            aria-label="Supprimer le cabinet"
                            title="Supprimer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={Building2} title="Aucun cabinet" description="Créez le premier cabinet depuis le formulaire." />
          )}
        </Card>

        <Card>
          <CardHeader title="Nouveau cabinet" description="Crée le cabinet, son abonnement et son administrateur." />
          <form onSubmit={provisionTenant} className="space-y-3 p-5">
            <label className="block">
              <span className="app-label">Nom du cabinet</span>
              <input required className="app-input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="app-label">Email</span>
                <input className="app-input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </label>
              <label className="block">
                <span className="app-label">Téléphone</span>
                <input className="app-input" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </label>
            </div>
            <label className="block">
              <span className="app-label">Plan</span>
              <select className="app-input" value={form.plan} onChange={(event) => setForm({ ...form, plan: event.target.value })}>
                {Object.entries(planLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <p className="pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Administrateur</p>
            <label className="block">
              <span className="app-label">Nom complet</span>
              <input required className="app-input" value={form.adminName} onChange={(event) => setForm({ ...form, adminName: event.target.value })} />
            </label>
            <label className="block">
              <span className="app-label">Email</span>
              <input required className="app-input" type="email" value={form.adminEmail} onChange={(event) => setForm({ ...form, adminEmail: event.target.value })} />
            </label>
            <label className="block">
              <span className="app-label">Mot de passe initial</span>
              <input required minLength={8} className="app-input" value={form.adminPassword} onChange={(event) => setForm({ ...form, adminPassword: event.target.value })} />
            </label>
            <Button className="w-full" type="submit">
              <Plus size={16} /> Créer le cabinet
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
