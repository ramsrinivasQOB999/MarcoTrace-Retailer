import type { ComponentType } from "react";
import { RequirePerm } from "./require-perm";
import type { Permission } from "@/lib/permissions";

/** Wrap a route component with a permission guard. */
export function withPerm<P extends object>(perm: Permission, Component: ComponentType<P>) {
  return function Guarded(props: P) {
    return (
      <RequirePerm perm={perm}>
        <Component {...props} />
      </RequirePerm>
    );
  };
}
