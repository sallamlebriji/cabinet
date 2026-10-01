import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./store/AuthContext";
import { PublicLayout } from "./layouts/PublicLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Clients } from "./pages/Clients";
import { Agenda } from "./pages/Agenda";
import { ClientDetail } from "./pages/ClientDetail";
import { Payments } from "./pages/Payments";
import { Quotes } from "./pages/Quotes";
import { Staff } from "./pages/Staff";
import { Booking } from "./pages/public/Booking";
import { Portal } from "./pages/public/Portal";
import { ToastProvider } from "./components/ui/Toast";
import { Invoices } from "./pages/Invoices";
import { Settings } from "./pages/Settings";
import { SuperAdmin } from "./pages/SuperAdmin";
import { AccessDenied } from "./pages/AccessDenied";
import { useAuth } from "./store/AuthContext";
import "./index.css";

function RequireAccess({ children, module, superAdminOnly }: { children: React.ReactNode; module?: string; superAdminOnly?: boolean }) {
  const { user, modules, isLoading } = useAuth();

  if (isLoading) return <div className="grid min-h-[60vh] place-items-center text-sm text-muted">Chargement…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (superAdminOnly && user.role !== "SUPER_ADMIN") return <Navigate to="/access-denied" replace />;
  if (module && !modules.includes(module)) return <Navigate to="/access-denied" replace />;

  return children;
}

// Page d'arrivée : le premier module auquel le rôle a accès.
function Landing() {
  const { modules } = useAuth();
  const first = [
    ["dashboard", "/dashboard"],
    ["appointments", "/agenda"],
    ["customers", "/clients"],
    ["billing", "/invoices"]
  ].find(([module]) => modules.includes(module));
  return <Navigate to={first?.[1] ?? "/access-denied"} replace />;
}

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [{ path: "/", element: <Home /> }]
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> }
    ]
  },
  { path: "/rdv", element: <Booking /> },
  { path: "/portail", element: <Portal /> },
  {
    element: <DashboardLayout />,
    children: [
      { path: "/app", element: <Landing /> },
      { path: "/dashboard", element: <RequireAccess module="dashboard"><Dashboard /></RequireAccess> },
      { path: "/clients", element: <RequireAccess module="customers"><Clients /></RequireAccess> },
      { path: "/clients/:id", element: <RequireAccess module="customers"><ClientDetail /></RequireAccess> },
      { path: "/agenda", element: <RequireAccess module="appointments"><Agenda /></RequireAccess> },
      { path: "/appointments", element: <Navigate to="/agenda" replace /> },
      { path: "/quotes", element: <RequireAccess module="billing"><Quotes /></RequireAccess> },
      { path: "/invoices", element: <RequireAccess module="billing"><Invoices /></RequireAccess> },
      { path: "/payments", element: <RequireAccess module="billing"><Payments /></RequireAccess> },
      { path: "/staff", element: <RequireAccess module="users"><Staff /></RequireAccess> },
      { path: "/settings", element: <RequireAccess module="settings"><Settings /></RequireAccess> },
      { path: "/super-admin", element: <RequireAccess superAdminOnly><SuperAdmin /></RequireAccess> },
      { path: "/access-denied", element: <AccessDenied /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
);
