import { useEffect, useState } from "react";
import { Check, Pencil, ShieldCheck, UserPlus, Users } from "lucide-react";
import { Avatar, Field, IconButton, Kpi, TableSkeleton, Tabs } from "../components/ui/Bits";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useToast } from "../components/ui/Toast";
import { useApi } from "../hooks/useApi";
import { apiError } from "../lib/format";
import { roleLabels, type Staff as StaffMember, type StaffRole } from "../lib/types";
import { api } from "../services/api";
import { useAuth } from "../store/AuthContext";

const roles: StaffRole[] = ["ADMIN_TENANT", "MANAGER", "EMPLOYEE"];
const moduleLabels: Record<string, { label: string; text: string }> = {
  dashboard: { label: "Tableau de bord", text: "Indicateurs et activité du cabinet" },
  customers: { label: "Clients", text: "Dossiers, coordonnées et documents" },
  appointments: { label: "Agenda", text: "Rendez-vous et services" },
  billing: { label: "Finance", text: "Devis, factures et paiements" },
  reports: { label: "Rapports", text: "Statistiques et exports" }
};

type Permissions = { modules: string[]; roles: Record<"MANAGER" | "EMPLOYEE", string[]> };
const emptyForm = { name: "", email: "", phone: "", role: "EMPLOYEE" as StaffRole, password: "", isActive: true };

export function Staff() {
  const toast = useToast();
  const { user } = useAuth();
  const { data, loading, reload } = useApi<{ items: StaffMember[] }>("/employees");
  const [tab, setTab] = useState<"team" | "permissions">("team");
  const [editing, setEditing] = useState<StaffMember | null | "new">(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const staff = data?.items ?? [];

  useEffect(() => {
    if (editing === null) return;
    setForm(editing === "new" ? emptyForm : { name: editing.name, email: editing.email, phone: editing.phone ?? "", role: editing.role, password: "", isActive: editing.isActive });
  }, [editing]);

  const isSelf = editing !== null && editing !== "new" && editing._id === user?._id;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing === "new") await api.post("/employees", form);
      else if (editing) await api.put(`/employees/${editing._id}`, { name: form.name, phone: form.phone, role: form.role, isActive: form.isActive, password: form.password || undefined });
      toast.ok(editing === "new" ? "Membre ajouté." : "Membre mis à jour.");
      setEditing(null);
      await reload();
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-7">
      <PageHeader
        title="Personnel"
        description="Comptes de l'équipe, rôles et droits d'accès."
        actions={
          <Button onClick={() => setEditing("new")}>
            <UserPlus size={16} /> Ajouter un membre
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Membres actifs" value={staff.filter((member) => member.isActive).length} />
        <Kpi label="Administrateurs" value={staff.filter((member) => member.role === "ADMIN_TENANT" && member.isActive).length} />
        <Kpi label="Comptes désactivés" value={staff.filter((member) => !member.isActive).length} />
      </div>

      <div>
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "team", label: "Équipe", count: staff.length },
            { value: "permissions", label: "Rôles & permissions" }
          ]}
        />

        {tab === "team" ? (
          <Card className="mt-5 overflow-hidden">
            {loading ? (
              <TableSkeleton />
            ) : staff.length ? (
              <div className="overflow-x-auto">
                <table className="app-table">
                  <thead>
                    <tr>
                      <th>Membre</th>
                      <th className="hidden md:table-cell">Téléphone</th>
                      <th>Rôle</th>
                      <th>Statut</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((member) => (
                      <tr key={member._id} className={member.isActive ? "" : "opacity-60"}>
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar name={member.name} />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-ink">
                                {member.name}
                                {member._id === user?._id && <span className="ml-2 text-xs font-normal text-muted">(vous)</span>}
                              </p>
                              <p className="truncate text-xs text-muted">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden whitespace-nowrap text-slate-600 md:table-cell">{member.phone || "—"}</td>
                        <td>
                          <span className="rounded-md bg-sage-50 px-2 py-0.5 text-xs font-semibold text-sage-700 ring-1 ring-inset ring-sage-200">{roleLabels[member.role]}</span>
                        </td>
                        <td>
                          <StatusBadge status={member.isActive ? "active" : "inactive"} />
                        </td>
                        <td>
                          <div className="flex justify-end">
                            <IconButton label="Modifier" onClick={() => setEditing(member)}>
                              <Pencil size={14} />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon={Users} title="Aucun membre" />
            )}
          </Card>
        ) : (
          <PermissionsMatrix />
        )}
      </div>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Nouveau membre" : "Modifier le membre"}
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setEditing(null)}>
              Annuler
            </Button>
            <Button type="submit" form="staff-form" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form id="staff-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom complet">
            <input required minLength={2} className="app-input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </Field>
          <Field label="Téléphone">
            <input className="app-input" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </Field>
          <Field label="Email" className="sm:col-span-2" hint={editing !== "new" ? "L'email de connexion ne peut pas être modifié." : undefined}>
            <input required disabled={editing !== "new"} className="app-input disabled:bg-slate-50 disabled:text-muted" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </Field>
          <Field label="Rôle" hint={isSelf ? "Vous ne pouvez pas modifier votre propre rôle." : undefined}>
            <select disabled={isSelf} className="app-input disabled:bg-slate-50" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as StaffRole })}>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={editing === "new" ? "Mot de passe" : "Nouveau mot de passe"} hint={editing === "new" ? "8 caractères minimum." : "Laissez vide pour le conserver."}>
            <input required={editing === "new"} minLength={8} autoComplete="new-password" className="app-input" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </Field>
          {editing !== "new" && !isSelf && (
            <label className="flex items-center gap-2.5 text-sm text-ink sm:col-span-2">
              <input type="checkbox" className="h-4 w-4 accent-[#2563eb]" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
              Compte actif (peut se connecter)
            </label>
          )}
        </form>
      </Modal>
    </div>
  );
}

function PermissionsMatrix() {
  const toast = useToast();
  const { data, loading } = useApi<Permissions>("/settings/permissions");
  const [matrix, setMatrix] = useState<Permissions["roles"] | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setMatrix(data.roles);
  }, [data]);

  if (loading || !data || !matrix) return <Card className="mt-5 p-6 text-sm text-muted">Chargement…</Card>;

  const toggle = (role: "MANAGER" | "EMPLOYEE", moduleName: string) =>
    setMatrix({ ...matrix, [role]: matrix[role].includes(moduleName) ? matrix[role].filter((item) => item !== moduleName) : [...matrix[role], moduleName] });

  async function save() {
    setSaving(true);
    try {
      await api.put("/settings/permissions", { roles: matrix });
      toast.ok("Permissions enregistrées. Elles s'appliquent à la prochaine connexion des membres.");
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mt-5 overflow-hidden">
      <CardHeader
        title="Accès par rôle"
        description="L'administrateur a accès à tout, y compris au personnel et aux paramètres."
        action={
          <Button onClick={() => void save()} disabled={saving}>
            <ShieldCheck size={15} /> {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        }
      />
      <div className="overflow-x-auto">
        <table className="app-table">
          <thead>
            <tr>
              <th>Module</th>
              <th className="text-center">Administrateur</th>
              <th className="text-center">Manager</th>
              <th className="text-center">Employé</th>
            </tr>
          </thead>
          <tbody>
            {data.modules.map((moduleName) => (
              <tr key={moduleName}>
                <td>
                  <p className="font-medium text-ink">{moduleLabels[moduleName]?.label ?? moduleName}</p>
                  <p className="text-xs text-muted">{moduleLabels[moduleName]?.text}</p>
                </td>
                <td className="text-center">
                  <Check size={16} className="mx-auto text-emerald-600" aria-label="Toujours autorisé" />
                </td>
                {(["MANAGER", "EMPLOYEE"] as const).map((role) => (
                  <td key={role} className="text-center">
                    <input type="checkbox" aria-label={`${roleLabels[role]} : ${moduleLabels[moduleName]?.label}`} className="h-4 w-4 accent-[#2563eb]" checked={matrix[role].includes(moduleName)} onChange={() => toggle(role, moduleName)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
