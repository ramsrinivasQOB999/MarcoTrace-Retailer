// Tiny mock auth store using localStorage + a subscription pattern
import { useEffect, useState } from "react";
import type { Role } from "./mock-data";

export interface AuthUser {
  phone: string;
  role: Role;
  name: string;
}

const KEY = "mercotrace_auth";
const listeners = new Set<() => void>();

export function getAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setAuth(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(KEY, JSON.stringify(user));
  else localStorage.removeItem(KEY);
  listeners.forEach((l) => l());
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => getAuth());
  useEffect(() => {
    const cb = () => setUser(getAuth());
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);
  return user;
}

export const ROLE_LABELS: Record<Role, string> = {
  agglomerate_admin: "Agglomerate Admin",
  store_admin: "Store Admin",
  employee: "Employee",
  customer: "Customer",
};
