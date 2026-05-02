import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { stores, lots, sales, inr, healthForLot } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { ArrowUpRight, IndianRupee, Boxes, AlertTriangle, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-store";
import { Can } from "@/components/can";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — Mercotrace" }] }),
  component: Dashboard,
});

const trend = Array.from({ length: 14 }).map((_, i) => ({
  day: `D${i + 1}`,
  revenue: 12000 + Math.round(Math.sin(i / 2) * 4000 + i * 600 + Math.random() * 1500),
  orders: 30 + Math.round(Math.cos(i / 2) * 8 + i * 1.2 + Math.random() * 5),
}));

const byStore = stores.map((s) => ({
  name: s.code,
  revenue: 50000 + Math.round(Math.random() * 90000),
}));

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
  tone?: "green" | "yellow" | "red";
}) {
  return (
    <Card className="glass-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </div>
          <div className="text-2xl font-semibold mt-1">{value}</div>
          {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
        </div>
        <div className="h-10 w-10 rounded-xl bg-brand-gradient/10 grid place-items-center text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {tone && (
        <div className="mt-3">
          <StatusBadge tone={tone}>
            <ArrowUpRight className="h-3 w-3" /> Live
          </StatusBadge>
        </div>
      )}
    </Card>
  );
}

function Dashboard() {
  const user = useAuth();
  if (user?.role === "customer") return <Navigate to="/app/customer" />;

  const totalRevenue = sales.reduce((s, x) => s + x.total, 0);
  const totalCapital = lots.reduce((s, l) => s + l.costPrice * l.remaining, 0);
  const atRisk = lots.filter((l) => healthForLot(l).tone !== "green").length;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Real-time view across your agglomeration"
        actions={
          <Can perm="pos.use">
            <Button asChild className="bg-brand-gradient text-primary-foreground hover:opacity-95">
              <Link to="/app/pos">New Sale</Link>
            </Button>
          </Can>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          icon={IndianRupee}
          label="Today's Revenue"
          value={inr(totalRevenue)}
          hint="across all stores"
          tone="green"
        />
        <Stat
          icon={Boxes}
          label="Capital Locked"
          value={inr(totalCapital)}
          hint={`${lots.length} active lots`}
        />
        <Stat
          icon={AlertTriangle}
          label="At-Risk Lots"
          value={String(atRisk)}
          hint="margin / expiry"
          tone={atRisk > 0 ? "yellow" : "green"}
        />
        <Stat
          icon={Store}
          label="Active Stores"
          value={String(stores.filter((s) => s.status === "active").length)}
          hint={`of ${stores.length}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Revenue trend</h3>
              <p className="text-xs text-muted-foreground">Last 14 days</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6C63FF"
                  fill="url(#rev)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="glass-card p-5">
          <h3 className="font-semibold mb-1">Revenue by store</h3>
          <p className="text-xs text-muted-foreground mb-4">Last 30 days</p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={byStore}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#5B8DEF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Lot health</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app/inventory">View all</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {lots.slice(0, 6).map((l) => {
            const h = healthForLot(l);
            return (
              <div
                key={l.id}
                className="rounded-lg border p-3 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-mono text-xs text-muted-foreground truncate">
                    {l.skuCode}
                  </div>
                  <div className="font-medium truncate">{l.invoiceNo}</div>
                  <div className="text-xs text-muted-foreground">
                    {l.remaining}/{l.qty} units · expires in {h.daysToExpiry}d
                  </div>
                </div>
                <StatusBadge tone={h.tone}>{(h.margin * 100).toFixed(0)}%</StatusBadge>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
