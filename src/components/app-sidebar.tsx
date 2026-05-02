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
import { Button } from "@/components/ui/button";

const nav = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard, exact: true },
  { title: "Stores", url: "/app/stores", icon: Store },
  { title: "SKUs", url: "/app/skus", icon: Boxes },
  { title: "Purchases", url: "/app/purchases", icon: Truck },
  { title: "Inventory", url: "/app/inventory", icon: Warehouse },
  { title: "POS", url: "/app/pos", icon: ShoppingCart },
  { title: "Insights", url: "/app/insights", icon: LineChart },
  { title: "Reports", url: "/app/reports", icon: FileBarChart },
  { title: "Customer App", url: "/app/customer", icon: Smartphone },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (s) => s.location.pathname });
  const user = useAuth();
  const navigate = useNavigate();

  const isActive = (url: string, exact?: boolean) =>
    exact ? path === url : path === url || path.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <Link to="/app" className="flex items-center gap-2 px-2 py-2">
          <div className="h-9 w-9 rounded-xl bg-brand-gradient grid place-items-center shadow-elev">
            <span className="text-primary-foreground font-bold">M</span>
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-semibold text-sm">Mercotrace</div>
              <div className="text-[11px] text-muted-foreground">Retail Trade</div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        {!collapsed && user && (
          <div className="px-2 py-2">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {ROLE_LABELS[user.role]} · {user.phone}
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="justify-start"
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
