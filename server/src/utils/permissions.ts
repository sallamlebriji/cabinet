import type { ISubscription } from "../models/Subscription.js";
import type { ITenant } from "../models/Tenant.js";
import type { UserRole } from "../models/User.js";

export const ALL_MODULES = ["dashboard", "customers", "appointments", "billing", "reports", "users", "settings"] as const;

// Modules qu'un administrateur peut accorder ou retirer aux autres rôles.
export const CONFIGURABLE_MODULES = ["dashboard", "customers", "appointments", "billing", "reports"] as const;
export const CONFIGURABLE_ROLES = ["MANAGER", "EMPLOYEE"] as const;
export type ConfigurableRole = (typeof CONFIGURABLE_ROLES)[number];

export const defaultRoleModules: Record<ConfigurableRole, string[]> = {
  MANAGER: ["dashboard", "customers", "appointments", "billing", "reports"],
  EMPLOYEE: ["customers", "appointments"]
};

export function roleModules(tenant: ITenant | null | undefined, role: UserRole): string[] {
  if (role === "SUPER_ADMIN" || role === "ADMIN_TENANT") return [...ALL_MODULES];
  if (role === "MANAGER" || role === "EMPLOYEE") {
    const custom = tenant?.roleModules?.[role];
    return Array.isArray(custom) ? custom : defaultRoleModules[role];
  }
  return [];
}

function tenantModuleEnabled(tenant: ITenant | null | undefined, moduleName: string) {
  const modules = tenant?.modules as Map<string, boolean> | Record<string, boolean> | undefined;
  const flag = modules instanceof Map ? modules.get(moduleName) : modules?.[moduleName];
  return flag !== false;
}

export function effectiveModules(role: UserRole, tenant: ITenant | null | undefined, subscription: ISubscription | null | undefined): string[] {
  if (role === "SUPER_ADMIN") return [...ALL_MODULES];
  const enabled = subscription?.enabledModules ?? [];
  return roleModules(tenant, role).filter((moduleName) => enabled.includes(moduleName) && tenantModuleEnabled(tenant, moduleName));
}

export function sanitizeRoleModules(input: unknown): Record<ConfigurableRole, string[]> {
  const source = (input ?? {}) as Record<string, unknown>;
  const result = {} as Record<ConfigurableRole, string[]>;
  for (const role of CONFIGURABLE_ROLES) {
    const list = Array.isArray(source[role]) ? (source[role] as unknown[]) : defaultRoleModules[role];
    result[role] = CONFIGURABLE_MODULES.filter((moduleName) => list.includes(moduleName));
  }
  return result;
}
