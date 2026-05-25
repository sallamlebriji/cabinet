import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../services/api";

type User = {
  _id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN_TENANT" | "MANAGER" | "EMPLOYEE" | "CLIENT";
  tenant?: string | { _id: string; name: string; slug: string; modules?: Record<string, boolean> };
};

type Tenant = {
  _id: string;
  name: string;
  slug: string;
  modules?: Record<string, boolean>;
  isActive: boolean;
};

type Subscription = {
  plan: "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
  status: "trial" | "active" | "past_due" | "canceled";
  enabledModules: string[];
};

type AuthContextValue = {
  user: User | null;
  tenant: Tenant | null;
  subscription: Subscription | null;
  modules: string[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; tenantName?: string; cabinetName?: string; role?: "SUPER_ADMIN" | "ADMIN_TENANT" }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [modules, setModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  function applySession(data: { user: User; tenant?: Tenant | null; subscription?: Subscription | null; modules?: string[] }) {
    setUser(data.user);
    setTenant(data.tenant ?? null);
    setSubscription(data.subscription ?? null);
    setModules(data.modules ?? data.subscription?.enabledModules ?? []);
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then(({ data }) => applySession(data))
      .catch(() => localStorage.removeItem("accessToken"))
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tenant,
      subscription,
      modules,
      isLoading,
      async login(email, password) {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("accessToken", data.accessToken);
        applySession(data);
      },
      async register(payload) {
        const { data } = await api.post("/auth/register", payload);
        localStorage.setItem("accessToken", data.accessToken);
        applySession(data);
      },
      async logout() {
        await api.post("/auth/logout").catch(() => undefined);
        localStorage.removeItem("accessToken");
        setUser(null);
        setTenant(null);
        setSubscription(null);
        setModules([]);
      }
    }),
    [isLoading, modules, subscription, tenant, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
