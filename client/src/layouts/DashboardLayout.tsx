import { useEffect, useState } from "react";
import { Bell, Building2, CalendarDays, FileText, LayoutDashboard, LogOut, Menu, Settings, Stethoscope, Users, X } from "lucide-react";
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

const nav = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, module: "dashboard", roles: ["SUPER_ADMIN", "ADMIN_TENANT", "MANAGER"] },
  { to: "/clients", label: "Clients", icon: Users, module: "customers", roles: ["SUPER_ADMIN", "ADMIN_TENANT", "MANAGER", "EMPLOYEE"] },
  { to: "/appointments", label: "Rendez-vous", icon: CalendarDays, module: "appointments", roles: ["SUPER_ADMIN", "ADMIN_TENANT", "MANAGER", "EMPLOYEE"] },
  { to: "/invoices", label: "Facturation", icon: FileText, module: "billing", roles: ["SUPER_ADMIN", "ADMIN_TENANT"] },
  { to: "/settings", label: "Paramètres", icon: Settings, module: "settings", roles: ["SUPER_ADMIN", "ADMIN_TENANT"] }
];

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN_TENANT: "Administrateur",
  MANAGER: "Manager",
  EMPLOYEE: "Employé",
  CLIENT: "Client"
};

const pageTitles: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/clients": "Clients",
  "/appointments": "Rendez-vous",
  "/invoices": "Facturation",
  "/settings": "Paramètres",
  "/super-admin": "Cabinets",
  "/access-denied": "Accès refusé"
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function DashboardLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, tenant, modules, isLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

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

  const allowedNav = nav.filter((item) => item.roles.includes(user.role) && (user.role === "SUPER_ADMIN" || modules.includes(item.module)));
  const links = user.role === "SUPER_ADMIN" ? [...allowedNav, { to: "/super-admin", label: "Cabinets", icon: Building2, module: "users", roles: ["SUPER_ADMIN"] }] : allowedNav;
  const workspace = user.role === "SUPER_ADMIN" ? "Console plateforme" : tenant?.name ?? "Mon cabinet";

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-sage-500 to-sage-700 text-white shadow-sm">
          <Stethoscope size={18} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">Cabinet Pro</p>
          <p className="max-w-[10rem] truncate text-[11px] text-white/45">{workspace}</p>
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Navigation</p>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-sage-300" />}
                <Icon size={18} className={isActive ? "text-sage-300" : "text-white/45 group-hover:text-white/70"} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="m-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sage-600 text-xs font-semibold text-white">{initials(user.name)}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-[11px] text-white/45">{roleLabels[user.role] ?? user.role}</p>
          </div>
          <button onClick={handleLogout} className="grid h-8 w-8 place-items-center rounded-md text-white/50 transition hover:bg-white/10 hover:text-white" aria-label="Déconnexion" title="Déconnexion">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-sidebar lg:block">{sidebar}</aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-sidebar shadow-pop">
            <button onClick={() => setMenuOpen(false)} className="absolute right-3 top-4 grid h-8 w-8 place-items-center rounded-md text-white/60 hover:bg-white/10" aria-label="Fermer le menu">
              <X size={18} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-hairline bg-white/80 px-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg border border-hairline bg-white text-ink lg:hidden" aria-label="Ouvrir le menu">
              <Menu size={18} />
            </button>
            <div>
              <p className="text-[11px] font-medium text-muted">{workspace}</p>
              <h1 className="text-sm font-semibold text-ink">{pageTitles[pathname] ?? "Espace cabinet"}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative grid h-9 w-9 place-items-center rounded-lg border border-hairline bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Notifications">
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-sage-600" />
            </button>
            <div className="hidden items-center gap-2 rounded-lg border border-hairline bg-white py-1 pl-1 pr-3 sm:flex">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-sage-600 text-[11px] font-semibold text-white">{initials(user.name)}</div>
              <span className="text-sm font-medium text-ink">{user.name}</span>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
