import { Bell, Building2, CalendarDays, FileText, LayoutDashboard, LogOut, Settings, Users } from "lucide-react";
import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard", roles: ["SUPER_ADMIN", "ADMIN_TENANT", "MANAGER"] },
  { to: "/clients", label: "Clients", icon: Users, module: "customers", roles: ["SUPER_ADMIN", "ADMIN_TENANT", "MANAGER", "EMPLOYEE"] },
  { to: "/appointments", label: "Rendez-vous", icon: CalendarDays, module: "appointments", roles: ["SUPER_ADMIN", "ADMIN_TENANT", "MANAGER", "EMPLOYEE"] },
  { to: "/invoices", label: "Factures", icon: FileText, module: "billing", roles: ["SUPER_ADMIN", "ADMIN_TENANT"] },
  { to: "/settings", label: "Parametres", icon: Settings, module: "settings", roles: ["SUPER_ADMIN", "ADMIN_TENANT"] }
];

export function DashboardLayout() {
  const navigate = useNavigate();
  const { user, modules, isLoading, logout } = useAuth();

  if (isLoading) return <div className="grid min-h-screen place-items-center bg-cream text-muted">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const allowedNav = nav.filter((item) => item.roles.includes(user.role) && (user.role === "SUPER_ADMIN" || modules.includes(item.module)));
  const links = user.role === "SUPER_ADMIN" ? [...allowedNav, { to: "/super-admin", label: "Tenants", icon: Building2, module: "users", roles: ["SUPER_ADMIN"] }] : allowedNav;

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-line bg-ink px-5 py-6 text-white lg:block">
        <div>
          <div className="text-xl font-extrabold text-white">Cabinet Pro</div>
          <p className="mt-1 text-sm text-white/55">{user.name}</p>
        </div>
        <nav className="mt-8 space-y-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition ${isActive ? "bg-white text-ink shadow-soft" : "text-white/62 hover:bg-white/8 hover:text-white"}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-72">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-ivory/85 px-4 backdrop-blur-xl sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">{user.role === "SUPER_ADMIN" ? "Console SaaS" : "Espace tenant"}</p>
            <h1 className="text-lg font-bold text-ink">Pilotage operationnel</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-ink shadow-soft" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <button onClick={handleLogout} className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-ink shadow-soft" aria-label="Deconnexion">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
