import type { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-store";
import { roleHas, type Permission, DEFAULT_ROUTE } from "@/lib/permissions";
import { Forbidden } from "@/components/forbidden";

interface RequirePermProps {
  perm: Permission;
  /** If the user is a customer, send them to their customer area instead of showing Forbidden. */
  redirectCustomer?: boolean;
  children: ReactNode;
}

export function RequirePerm({ perm, redirectCustomer = true, children }: RequirePermProps) {
  const user = useAuth();
  if (!user) return null;
  if (roleHas(user.role, perm)) return <>{children}</>;
  if (redirectCustomer && user.role === "customer") {
    return <Navigate to={DEFAULT_ROUTE.customer} />;
  }
  return <Forbidden />;
}
