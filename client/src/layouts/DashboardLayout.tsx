import { useEffect, useRef, useState } from "react";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Search,
  Settings,
  Stethoscope,
  UserCog,
  Users,
  X,
  type LucideIcon
} from "lucide-react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "../components/ui/Bits";
import { fullName } from "../lib/format";
import { roleLabels, type Client } from "../lib/types";
import { api, getScopeTenant, setScopeTenant } from "../services/api";
import { useAuth } from "../store/AuthContext";

type NavItem = { to: string; label: string; icon: LucideIcon; module: string };

const groups: { title: string; items: NavItem[] }[] = [
  { title: "Pilotage", items: [{ to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, module: "dashboard" }] },
  {
    title: "Patientèle",
    items: [
      { to: "/clients", label: "Clients", icon: Users, module: "customers" },
      { to: "/agenda", label: "Agenda", icon: CalendarDays, module: "appointments" }
    ]
  },
  {
    title: "Finance",
    items: [
      { to: "/quotes", label: "Devis", icon: FileText, module: "billing" },
      { to: "/invoices", label: "Facturation", icon: Receipt, module: "billing" },
      { to: "/payments", label: "Paiements", icon: CreditCard, module: "billing" }
    ]
  },
  {
    title: "Administration",
    items: [
      { to: "/staff", label: "Personnel", icon: UserCog, module: "users" },
      { to: "/settings", label: "Paramètres", icon: Settings, module: "settings" }
    ]
  }
];

type TenantOption = { _id: string; name: string };

export function DashboardLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, tenant, modules, isLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [scope, setScope] = useState(getScopeTenant());
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    api.get("/tenants").then(({ data }) => {
      const items: TenantOption[] = data.items;
      setTenants(items);
      if (!items.some((item) => item._id === getScopeTenant())) changeScope(items[0]?._id ?? "");
    });
  }, [isSuperAdmin]);

  function changeScope(id: string) {
    setScopeTenant(id);
    setScope(id);
  }

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas">
        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-sage-600" />
          Chargement…
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  const visibleGroups = groups
    .map((group) => ({ ...group, items: group.items.filter((item) => modules.includes(item.module)) }))
    .filter((group) => group.items.length);
  if (isSuperAdmin) visibleGroups.push({ title: "Plateforme", items: [{ to: "/super-admin", label: "Cabinets", icon: Building2, module: "users" }] });

  const workspace = isSuperAdmin ? tenants.find((item) => item._id === scope)?.name ?? "Plateforme" : tenant?.name ?? "Mon cabinet";

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/app" className="flex h-16 items-center gap-2.5 px-5">
        <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-gradient-to-br from-navy to-sage-600 text-white shadow-[0_4px_10px_rgba(37,99,235,0.25)]">
          <Stethoscope size={16} />
        </span>
        <span className="leading-none">
          <span className="block font-heading text-[21px] font-medium tracking-tight text-navy">Cabinet Pro</span>
          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#B89457]">Practice OS</span>
        </span>
      </Link>

      <nav className="app-scroll flex-1 overflow-y-auto px-3 pb-4">
        {visibleGroups.map((group) => (
          <div key={group.title}>
            <p className="px-2.5 pb-1.5 pt-4 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">{group.title}</p>
            {group.items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `mb-0.5 flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[13.5px] font-medium transition ${
                    isActive ? "bg-sage-50 text-sage-700" : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-hairline p-3">
        <div className="flex items-center gap-2.5 rounded-[10px] px-2 py-1.5">
          <Avatar name={user.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-medium text-ink">{user.name}</p>
            <p className="truncate text-[11.5px] text-muted">{roleLabels[user.role] ?? user.role}</p>
          </div>
          <button onClick={handleLogout} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-ink" aria-label="Déconnexion" title="Déconnexion">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas text-[14px]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] border-r border-hairline bg-white lg:block">{sidebar}</aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy/40" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-pop">
            <button onClick={() => setMenuOpen(false)} className="absolute right-3 top-4 grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-slate-100" aria-label="Fermer le menu">
              <X size={18} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-[252px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-hairline bg-canvas/85 px-4 backdrop-blur-xl sm:px-7">
          <button onClick={() => setMenuOpen(true)} className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-hairline bg-white text-ink lg:hidden" aria-label="Ouvrir le menu">
            <Menu size={18} />
          </button>
          {modules.includes("customers") ? <ClientSearch key={scope} /> : <div className="flex-1" />}
          {isSuperAdmin ? (
            <label className="relative hidden shrink-0 sm:block">
              <span className="sr-only">Cabinet administré</span>
              <Building2 size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <select value={scope} onChange={(event) => changeScope(event.target.value)} className="h-9 appearance-none rounded-[10px] border border-hairline bg-white pl-9 pr-8 text-[13px] font-medium text-ink outline-none">
                {tenants.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
            </label>
          ) : (
            <span className="hidden shrink-0 items-center gap-2 rounded-[10px] border border-hairline bg-white px-3 py-2 text-[13px] font-medium text-ink sm:flex">
              <Building2 size={15} className="text-muted" />
              {workspace}
            </span>
          )}
        </header>
        <main className="mx-auto w-full max-w-[1400px]">
          <Outlet key={scope} />
        </main>
      </div>
    </div>
  );
}

function ClientSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    const timer = window.setTimeout(() => {
      api
        .get("/clients", { params: { q: term, limit: 6 } })
        .then(({ data }) => setResults(data.items))
        .catch(() => setResults([]));
    }, 220);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => !box.current?.contains(event.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(client: Client) {
    setOpen(false);
    setQuery("");
    navigate(`/clients/${client._id}`);
  }

  return (
    <div ref={box} className="relative max-w-md flex-1">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        aria-label="Rechercher un client"
        placeholder="Rechercher un client…"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        className="h-[38px] w-full rounded-[10px] border border-hairline bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400"
      />
      {open && query.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-11 z-50 rounded-xl border border-hairline bg-white p-1.5 shadow-pop">
          {results.length ? (
            results.map((client) => (
              <button key={client._id} type="button" onClick={() => go(client)} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-slate-50">
                <Avatar name={fullName(client)} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{fullName(client)}</span>
                  <span className="block truncate text-xs text-muted">{client.phone || client.email || "—"}</span>
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-muted">Aucun client trouvé.</p>
          )}
        </div>
      )}
    </div>
  );
}
