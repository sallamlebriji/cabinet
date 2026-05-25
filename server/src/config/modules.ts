import type { UserRole } from "../models/User.js";

export const modulePermissions: Record<string, UserRole[]> = {
  dashboard: ["SUPER_ADMIN", "ADMIN_TENANT", "MANAGER"],
  users: ["SUPER_ADMIN", "ADMIN_TENANT"],
  customers: ["SUPER_ADMIN", "ADMIN_TENANT", "MANAGER"],
  appointments: ["SUPER_ADMIN", "ADMIN_TENANT", "MANAGER", "EMPLOYEE"],
  billing: ["SUPER_ADMIN", "ADMIN_TENANT"],
  reports: ["SUPER_ADMIN", "ADMIN_TENANT", "MANAGER"],
  settings: ["SUPER_ADMIN", "ADMIN_TENANT"]
};

export const planLimits = {
  FREE: { maxUsers: 3, maxStorage: 512, maxItems: 100 },
  STARTER: { maxUsers: 10, maxStorage: 2048, maxItems: 1000 },
  PRO: { maxUsers: 50, maxStorage: 10240, maxItems: 10000 },
  ENTERPRISE: { maxUsers: 500, maxStorage: 102400, maxItems: 100000 }
} as const;
