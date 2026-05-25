import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./store/AuthContext";
import { PublicLayout } from "./layouts/PublicLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Clients } from "./pages/Clients";
import { Appointments } from "./pages/Appointments";
import { Invoices } from "./pages/Invoices";
import { Settings } from "./pages/Settings";
import { SuperAdmin } from "./pages/SuperAdmin";
import { AccessDenied } from "./pages/AccessDenied";
import { useAuth } from "./store/AuthContext";
import "./index.css";

type Role = "SUPER_ADMIN" | "ADMIN_TENANT" | "MANAGER" | "EMPLOYEE" | "CLIENT";

function RequireAccess({ children, roles, module }: { children: React.ReactNode; roles: Role[]; module?: string }) {
  const { user, modules, isLoading } = useAuth();

  if (isLoading) return <div className="grid min-h-screen place-items-center bg-[#f7f9fc] text-muted">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/access-denied" replace />;
  if (user.role !== "SUPER_ADMIN" && module && !modules.includes(module)) return <Navigate to="/access-denied" replace />;

  return children;
}

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> }
    ]
  },
  {
    element: <DashboardLayout />,
    children: [
      { path: "/dashboard", element: <RequireAccess roles={["SUPER_ADMIN", "ADMIN_TENANT", "MANAGER"]} module="dashboard"><Dashboard /></RequireAccess> },
      { path: "/clients", element: <RequireAccess roles={["SUPER_ADMIN", "ADMIN_TENANT", "MANAGER", "EMPLOYEE"]} module="customers"><Clients /></RequireAccess> },
      { path: "/appointments", element: <RequireAccess roles={["SUPER_ADMIN", "ADMIN_TENANT", "MANAGER", "EMPLOYEE"]} module="appointments"><Appointments /></RequireAccess> },
      { path: "/invoices", element: <RequireAccess roles={["SUPER_ADMIN", "ADMIN_TENANT"]} module="billing"><Invoices /></RequireAccess> },
      { path: "/settings", element: <RequireAccess roles={["SUPER_ADMIN", "ADMIN_TENANT"]} module="settings"><Settings /></RequireAccess> },
      { path: "/super-admin", element: <RequireAccess roles={["SUPER_ADMIN"]}><SuperAdmin /></RequireAccess> },
      { path: "/access-denied", element: <AccessDenied /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
