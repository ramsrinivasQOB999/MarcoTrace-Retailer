import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth-store";
import { roleHas, roleHasAny, type Permission } from "@/lib/permissions";

interface CanProps {
  perm?: Permission;
  anyOf?: Permission[];
  fallback?: ReactNode;
  children: ReactNode;
}

/** Conditionally render children based on the current user's permissions. */
export function Can({ perm, anyOf, fallback = null, children }: CanProps) {
  const user = useAuth();
  const role = user?.role;
  const ok = perm ? roleHas(role, perm) : anyOf ? roleHasAny(role, anyOf) : true;
  return <>{ok ? children : fallback}</>;
}
