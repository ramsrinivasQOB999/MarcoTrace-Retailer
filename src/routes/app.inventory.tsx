import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { lots, stores, healthForLot, inr } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
import { Search } from "lucide-react";

export const Route = createFileRoute("/app/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Mercotrace" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const [q, setQ] = useState("");
  const [rate, setRate] = useState(12);

  const rows = useMemo(() => {
    return lots
      .filter((l) => [l.skuCode, l.invoiceNo, l.supplier].join(" ").toLowerCase().includes(q.toLowerCase()))
      .map((l) => {
        const h = healthForLot(l, rate);
        const store = stores.find((s) => s.id === l.storeId);
        return { l, h, store };
      });
  }, [q, rate]);

  const greens = rows.filter((r) => r.h.tone === "green").length;
  const yellows = rows.filter((r) => r.h.tone === "yellow").length;
  const reds = rows.filter((r) => r.h.tone === "red").length;

  return (
    <>
      <PageHeader
        title="Inventory engine"
        subtitle="Lot-level tracking with interest, wastage & effective margin"
      />

      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-card p-4">
          <div className="text-xs text-muted-foreground uppercase font-medium">Healthy</div>
          <div className="text-2xl font-semibold mt-1 text-success">{greens}</div>
        </Card>
        <Card className="glass-card p-4">
          <div className="text-xs text-muted-foreground uppercase font-medium">At risk</div>
          <div className="text-2xl font-semibold mt-1 text-warning-foreground">{yellows}</div>
        </Card>
        <Card className="glass-card p-4">
          <div className="text-xs text-muted-foreground uppercase font-medium">Loss / expiring</div>
          <div className="text-2xl font-semibold mt-1 text-destructive">{reds}</div>
        </Card>
      </div>

      <Card className="glass-card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search lots, SKU, supplier..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="w-full sm:w-72">
            <Label className="text-xs text-muted-foreground">Capital cost rate (annual %): {rate}</Label>
            <Slider value={[rate]} min={0} max={36} step={1} onValueChange={(v) => setRate(v[0])} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead className="hidden lg:table-cell">Store</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="hidden md:table-cell">CP / MRP</TableHead>
                <TableHead className="hidden md:table-cell">Days held / Expiry</TableHead>
                <TableHead>Eff. cost</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ l, h, store }) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <div className="font-mono text-xs">{l.skuCode}</div>
                    <div className="text-xs text-muted-foreground">{l.invoiceNo}</div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{store?.code}</TableCell>
                  <TableCell>{l.remaining}<span className="text-muted-foreground">/{l.qty}</span></TableCell>
                  <TableCell className="hidden md:table-cell">{inr(l.costPrice)} / {inr(l.sellPrice)}</TableCell>
                  <TableCell className="hidden md:table-cell">{h.daysHeld}d held · exp {h.daysToExpiry}d</TableCell>
                  <TableCell>{inr(h.effCost)}</TableCell>
                  <TableCell className={h.margin < 0 ? "text-destructive font-medium" : ""}>{(h.margin * 100).toFixed(1)}%</TableCell>
                  <TableCell>
                    <StatusBadge tone={h.tone}>{h.tone === "green" ? "Healthy" : h.tone === "yellow" ? "At risk" : "Loss"}</StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
}
