// Centralized RBAC matrix for Mercotrace – Retail Platform
import type { Role } from "./mock-data";
import { getAuth } from "./auth-store";

// All permissions in the system (resource:action)
export type Permission =
  // Stores
  | "stores.view"
  | "stores.create"
  | "stores.approve"
  | "stores.suspend"
  | "stores.transfer_stock"
  // SKUs
  | "skus.view"
  | "skus.create"
  | "skus.edit"
  | "skus.deactivate"
  // Promotions
  | "promotions.view"
  | "promotions.manage"
  // Purchases
  | "purchases.view"
  | "purchases.create"
  | "purchases.edit"
  // Inventory
  | "inventory.view"
  | "inventory.adjust"
  | "inventory.transfer"
  // POS / Billing
  | "pos.use"
  | "pos.refund"
  | "pos.discount_override"
  // Insights / Reports
  | "insights.view"
  | "reports.view"
  | "reports.export"
  | "settlement.view"
  // Store admin / RBAC
  | "store_admin.view"
  | "store_admin.manage_devices"
  | "store_admin.manage_employees"
  | "store_admin.manage_identity"
  // Customer app
  | "customer.bills.view"
  | "customer.rewards.view"
  | "customer.pay";

// Role → permissions matrix
const MATRIX: Record<Role, Permission[]> = {
  agglomerate_admin: [
    "stores.view", "stores.create", "stores.approve", "stores.suspend", "stores.transfer_stock",
    "skus.view", "skus.create", "skus.edit", "skus.deactivate",
    "promotions.view", "promotions.manage",
    "purchases.view", "purchases.create", "purchases.edit",
    "inventory.view", "inventory.adjust", "inventory.transfer",
    "pos.use", "pos.refund", "pos.discount_override",
    "insights.view", "reports.view", "reports.export", "settlement.view",
    "store_admin.view", "store_admin.manage_devices", "store_admin.manage_employees", "store_admin.manage_identity",
  ],
  store_admin: [
    "stores.view",
    "skus.view", "skus.create", "skus.edit", "skus.deactivate",
    "promotions.view", "promotions.manage",
    "purchases.view", "purchases.create", "purchases.edit",
    "inventory.view", "inventory.adjust",
    "pos.use", "pos.refund", "pos.discount_override",
    "insights.view", "reports.view", "reports.export", "settlement.view",
    "store_admin.view", "store_admin.manage_devices", "store_admin.manage_employees", "store_admin.manage_identity",
  ],
  employee: [
    "skus.view",
    "purchases.view", "purchases.create",
    "inventory.view",
    "pos.use",
  ],
  customer: [
    "customer.bills.view", "customer.rewards.view", "customer.pay",
  ],
};

export function permissionsFor(role: Role): Permission[] {
  return MATRIX[role] ?? [];
}

export function roleHas(role: Role | undefined | null, perm: Permission): boolean {
  if (!role) return false;
  return MATRIX[role]?.includes(perm) ?? false;
}

export function roleHasAny(role: Role | undefined | null, perms: Permission[]): boolean {
  if (!role) return false;
  return perms.some((p) => MATRIX[role]?.includes(p));
}

export function currentRole(): Role | null {
  return getAuth()?.role ?? null;
}

export function can(perm: Permission): boolean {
  return roleHas(currentRole(), perm);
}

export function canAny(perms: Permission[]): boolean {
  return roleHasAny(currentRole(), perms);
}

// Default landing route per role (used after login & by /app index for customers)
export const DEFAULT_ROUTE: Record<Role, string> = {
  agglomerate_admin: "/app",
  store_admin: "/app",
  employee: "/app/pos",
  customer: "/app/customer",
};
