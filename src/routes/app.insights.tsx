import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { lots, stores, healthForLot, inr } from "@/lib/mock-data";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { StatusBadge } from "@/components/status-badge";

import { withPerm } from "@/components/with-perm";

export const Route = createFileRoute("/app/insights")({
  head: () => ({ meta: [{ title: "Insights — Mercotrace" }] }),
  component: withPerm("insights.view", InsightsPage),
});

function InsightsPage() {
  const aging = [
    { bucket: "0-30d", value: 0 },
    { bucket: "31-60d", value: 0 },
    { bucket: "61-90d", value: 0 },
    { bucket: "90d+", value: 0 },
  ];
  lots.forEach((l) => {
    const days = healthForLot(l).daysHeld;
    const v = l.costPrice * l.remaining;
    if (days <= 30) aging[0].value += v;
    else if (days <= 60) aging[1].value += v;
    else if (days <= 90) aging[2].value += v;
    else aging[3].value += v;
  });

  const healthDist = ["green", "yellow", "red"].map((tone) => ({
    name: tone === "green" ? "Healthy" : tone === "yellow" ? "At risk" : "Loss",
    value: lots.filter((l) => healthForLot(l).tone === tone).length,
    color: tone === "green" ? "#22C55E" : tone === "yellow" ? "#F59E0B" : "#EF4444",
  }));

  const flagged = lots
    .map((l) => ({ l, h: healthForLot(l) }))
    .filter((x) => x.h.tone !== "green")
    .sort((a, b) => a.h.margin - b.h.margin);

  return (
    <>
      <PageHeader title="Inventory Insights" subtitle="Aging, capital lock, profitability & risk" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="glass-card p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4">Capital locked by age</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={aging}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => inr(v)} />
                <Bar dataKey="value" fill="#6C63FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="glass-card p-5">
          <h3 className="font-semibold mb-4">Lot health distribution</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={healthDist} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={3}>
                  {healthDist.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="glass-card p-5">
        <h3 className="font-semibold mb-4">Flagged lots — review action</h3>
        <div className="space-y-2">
          {flagged.length === 0 && <div className="text-sm text-muted-foreground">All lots healthy 🎉</div>}
          {flagged.map(({ l, h }) => {
            const store = stores.find((s) => s.id === l.storeId);
            return (
              <div key={l.id} className="rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-muted-foreground truncate">{l.skuCode}</div>
                  <div className="font-medium">{store?.code} · {l.invoiceNo}</div>
                  <div className="text-xs text-muted-foreground">
                    {l.remaining} units · {h.daysToExpiry}d to expiry · margin {(h.margin * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Eff. cost</div>
                    <div className="font-medium">{inr(h.effCost)}</div>
                  </div>
                  <StatusBadge tone={h.tone}>{h.tone === "yellow" ? "Discount?" : "Liquidate"}</StatusBadge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
