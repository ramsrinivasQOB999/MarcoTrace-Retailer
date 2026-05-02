import { useEffect, useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Store,
  Boxes,
  Truck,
  Warehouse,
  ShoppingCart,
  LineChart,
  FileBarChart,
  Smartphone,
  LogOut,
  User,
  Settings,
  Tag,
  Wallet,
  Receipt,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { setAuth, useAuth, ROLE_LABELS } from "@/lib/auth-store";
import type { Role } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { roleHasAny, type Permission } from "@/lib/permissions";
import logoLockup from "@/assets/mercotrace-logo-light.png";
import { toast } from "sonner";

type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  exact?: boolean;
  /** Visible if the user has ANY of these permissions. Empty = visible to all signed-in users. */
  perms: Permission[];
};

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Main",
    items: [
      // Dashboard hidden from customers (they have no admin perms)
      {
        title: "Dashboard",
        url: "/app",
        icon: LayoutDashboard,
        exact: true,
        perms: ["stores.view", "skus.view", "inventory.view", "pos.use", "insights.view"],
      },
      { title: "Profile", url: "/app/profile", icon: User, perms: [] },
      {
        title: "Store Admin",
        url: "/app/store-admin",
        icon: Settings,
        perms: ["store_admin.view"],
      },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Stores", url: "/app/stores", icon: Store, perms: ["stores.view"] },
      { title: "SKUs", url: "/app/skus", icon: Boxes, perms: ["skus.view"] },
      { title: "Purchases", url: "/app/purchases", icon: Truck, perms: ["purchases.view"] },
      { title: "Inventory", url: "/app/inventory", icon: Warehouse, perms: ["inventory.view"] },
    ],
  },
  {
    label: "Trading",
    items: [
      { title: "POS", url: "/app/pos", icon: ShoppingCart, perms: ["pos.use"] },
      { title: "Promotions", url: "/app/skus", icon: Tag, perms: ["promotions.manage"] },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Insights", url: "/app/insights", icon: LineChart, perms: ["insights.view"] },
      { title: "Reports", url: "/app/reports", icon: FileBarChart, perms: ["reports.view"] },
      { title: "Billing", url: "/app/pos", icon: Receipt, perms: ["pos.use"] },
      { title: "Settlement", url: "/app/reports", icon: Wallet, perms: ["settlement.view"] },
    ],
  },
  {
    label: "Customer",
    items: [
      {
        title: "Customer App",
        url: "/app/customer",
        icon: Smartphone,
        perms: ["customer.bills.view"],
      },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (s) => s.location.pathname });
  const user = useAuth();
  const navigate = useNavigate();
  const role: Role | undefined = user?.role;

  // Defer active-state until after hydration to avoid SSR/client mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isVisible = (item: NavItem) =>
    item.perms.length === 0 ? true : roleHasAny(role, item.perms);

  const isActive = (url: string, exact?: boolean) => {
    if (!mounted) return false;
    return exact ? path === url : path === url || path.startsWith(url + "/");
  };

  return (
    <Sidebar
      collapsible="icon"
      className="[&>div[data-sidebar=sidebar]]:bg-aero-sidebar [&>div[data-sidebar=sidebar]]:text-white [&>div[data-sidebar=sidebar]]:border-r-0"
    >
      <SidebarHeader className="border-b border-white/15">
        <Link
          to="/app"
          className="flex items-center px-2 py-3 overflow-hidden"
          aria-label="Mercotrace – Retail Platform"
        >
          <img
            src={logoLockup}
            alt="Mercotrace – Retail Platform"
            className={
              collapsed ? "h-8 w-auto object-contain object-left" : "h-9 w-auto object-contain"
            }
            style={collapsed ? { width: "32px" } : undefined}
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="text-white">
        {groups.map((g) => {
          const items = g.items.filter(isVisible);
          if (!items.length) return null;
          return (
            <SidebarGroup key={g.label}>
              <SidebarGroupLabel className="text-white/60 uppercase tracking-wider text-[10px]">
                {g.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const active = isActive(item.url, item.exact);
                    return (
                      <SidebarMenuItem key={item.title + item.url}>
                        <SidebarMenuButton
                          asChild
                          className={
                            "text-white/85 hover:bg-white/15 hover:text-white data-[active=true]:bg-white/20 data-[active=true]:text-white data-[active=true]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"
                          }
                          isActive={active}
                        >
                          <Link to={item.url} className="flex items-center gap-2">
                            <item.icon className="h-4 w-4 shrink-0" />
                            {!collapsed && <span>{item.title}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/15">
        {!collapsed && user && (
          <div className="px-2 py-2 text-white">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-white/70 truncate">
              {ROLE_LABELS[user.role]} · {user.phone}
            </div>
          </div>
        )}
        <div className="px-2 pb-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white hover:bg-white/15 hover:text-white"
            onClick={async () => {
              try {
                // Clear all client-side auth artifacts
                setAuth(null);
                if (typeof window !== "undefined") {
                  try {
                    sessionStorage.clear();
                  } catch {
                    /* ignore */
                  }
                  // Best-effort cookie clear (non-HttpOnly)
                  document.cookie.split(";").forEach((c) => {
                    const name = c.split("=")[0]?.trim();
                    if (name) document.cookie = `${name}=; Max-Age=0; path=/`;
                  });
                }
                toast.success("Signed out");
              } finally {
                await navigate({ to: "/login", replace: true });
              }
            }}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sign out</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
