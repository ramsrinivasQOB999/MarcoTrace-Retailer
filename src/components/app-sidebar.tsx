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

type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  exact?: boolean;
  roles: Role[];
};

const ALL: Role[] = ["agglomerate_admin", "store_admin", "employee", "customer"];
const ADMIN: Role[] = ["agglomerate_admin", "store_admin"];
const STAFF: Role[] = ["agglomerate_admin", "store_admin", "employee"];

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/app", icon: LayoutDashboard, exact: true, roles: ALL },
      { title: "Profile", url: "/app/profile", icon: User, roles: ALL },
      { title: "Store Admin", url: "/app/store-admin", icon: Settings, roles: ADMIN },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Stores", url: "/app/stores", icon: Store, roles: ADMIN },
      { title: "SKUs", url: "/app/skus", icon: Boxes, roles: STAFF },
      { title: "Purchases", url: "/app/purchases", icon: Truck, roles: STAFF },
      { title: "Inventory", url: "/app/inventory", icon: Warehouse, roles: STAFF },
    ],
  },
  {
    label: "Trading",
    items: [
      { title: "POS", url: "/app/pos", icon: ShoppingCart, roles: STAFF },
      { title: "Promotions", url: "/app/skus", icon: Tag, roles: ADMIN },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Insights", url: "/app/insights", icon: LineChart, roles: ADMIN },
      { title: "Reports", url: "/app/reports", icon: FileBarChart, roles: ADMIN },
      { title: "Billing", url: "/app/pos", icon: Receipt, roles: STAFF },
      { title: "Settlement", url: "/app/reports", icon: Wallet, roles: ADMIN },
    ],
  },
  {
    label: "Customer",
    items: [{ title: "Customer App", url: "/app/customer", icon: Smartphone, roles: ALL }],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (s) => s.location.pathname });
  const user = useAuth();
  const navigate = useNavigate();
  const role: Role = user?.role ?? "customer";

  const isActive = (url: string, exact?: boolean) =>
    exact ? path === url : path === url || path.startsWith(url + "/");

  return (
    <Sidebar
      collapsible="icon"
      className="[&>div[data-sidebar=sidebar]]:bg-aero-sidebar [&>div[data-sidebar=sidebar]]:text-white [&>div[data-sidebar=sidebar]]:border-r-0"
    >
      <SidebarHeader className="border-b border-white/15">
        <Link to="/app" className="flex items-center gap-2 px-2 py-2">
          <div
            className="h-9 w-9 rounded-xl grid place-items-center shadow-elev bg-white/15 backdrop-blur-md border border-white/25"
          >
            <span className="text-white font-bold">M</span>
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-semibold text-sm text-white">Mercotrace</div>
              <div className="text-[11px] text-white/70">Retail Trade</div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="text-white">
        {groups.map((g) => {
          const items = g.items.filter((i) => i.roles.includes(role));
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
        <Button
          variant="ghost"
          size="sm"
          className="justify-start text-white hover:bg-white/15 hover:text-white"
          onClick={() => {
            setAuth(null);
            navigate({ to: "/login" });
          }}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sign out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
