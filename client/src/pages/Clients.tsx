import { useEffect, useState } from "react";
import { Search, UserPlus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ClientFormModal } from "../components/ClientFormModal";
import { Avatar, Kpi, TableSkeleton } from "../components/ui/Bits";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { fmtDate, fullName } from "../lib/format";
import type { Client } from "../lib/types";
import { api } from "../services/api";

export function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        api
          .get("/clients", { params: { limit: 200, q: query.trim() || undefined } })
          .then(({ data }) => {
            setClients(data.items);
            if (!query.trim()) setTotal(data.total);
          })
          .finally(() => setLoading(false));
      },
      query ? 250 : 0
    );
    return () => window.clearTimeout(timer);
  }, [query]);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const newThisMonth = clients.filter((client) => client.createdAt && new Date(client.createdAt) >= monthStart).length;

  return (
    <div className="space-y-6 p-4 sm:p-7">
      <PageHeader
        title="Clients"
        description="Dossiers, coordonnées et historique de vos clients."
        actions={
          <Button onClick={() => setCreating(true)}>
            <UserPlus size={16} /> Nouveau client
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Clients" value={total} hint="Dossiers enregistrés" />
        <Kpi label="Nouveaux ce mois" value={query ? "—" : newThisMonth} />
        <Kpi label="Avec téléphone" value={query ? "—" : clients.filter((client) => client.phone).length} hint="Joignables pour les rappels" />
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-hairline px-4 py-3">
          <Search size={16} className="text-slate-400" />
          <input aria-label="Rechercher" className="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Rechercher par nom, email ou téléphone" value={query} onChange={(event) => setQuery(event.target.value)} />
          <span className="text-xs text-muted">{clients.length} résultat(s)</span>
        </div>
        {loading ? (
          <TableSkeleton />
        ) : clients.length ? (
          <div className="overflow-x-auto">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Téléphone</th>
                  <th className="hidden md:table-cell">Email</th>
                  <th className="hidden lg:table-cell">Étiquettes</th>
                  <th className="hidden lg:table-cell">Créé le</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client._id} className="cursor-pointer" onClick={() => navigate(`/clients/${client._id}`)}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={fullName(client)} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{fullName(client)}</p>
                          <p className="max-w-[16rem] truncate text-xs text-muted">{client.notes || "Aucune note"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-slate-600">{client.phone || "—"}</td>
                    <td className="hidden text-slate-600 md:table-cell">{client.email || "—"}</td>
                    <td className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {client.tags?.map((tag) => (
                          <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="hidden whitespace-nowrap text-muted lg:table-cell">{client.createdAt ? fmtDate(client.createdAt) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Users} title="Aucun client trouvé" description={query ? "Essayez une autre recherche." : "Ajoutez votre premier client."} />
        )}
      </Card>

      <ClientFormModal open={creating} onClose={() => setCreating(false)} onSaved={(client) => navigate(`/clients/${client._id}`)} />
    </div>
  );
}
