import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lots, stores, sales, healthForLot, inr } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reports")({
  head: () => ({ meta: [{ title: "Reports — Mercotrace" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const supplierAgg = new Map<string, { value: number; lots: number }>();
  lots.forEach((l) => {
    const cur = supplierAgg.get(l.supplier) ?? { value: 0, lots: 0 };
    cur.value += l.costPrice * l.qty;
    cur.lots += 1;
    supplierAgg.set(l.supplier, cur);
  });

  const storePerf = stores.map((s) => {
    const storeLots = lots.filter((l) => l.storeId === s.id);
    const storeSales = sales.filter((sa) => sa.storeId === s.id);
    return {
      ...s,
      capital: storeLots.reduce((a, l) => a + l.costPrice * l.remaining, 0),
      revenue: storeSales.reduce((a, sa) => a + sa.total, 0),
      lots: storeLots.length,
    };
  });

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Daily summary, inventory health, supplier comparison, store performance"
        actions={
          <Button variant="outline" onClick={() => toast.success("Export queued", { description: "CSV will download (demo)" })}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        }
      />

      <Tabs defaultValue="daily">
        <TabsList className="flex-wrap">
          <TabsTrigger value="daily">Daily summary</TabsTrigger>
          <TabsTrigger value="health">Inventory health</TabsTrigger>
          <TabsTrigger value="supplier">Suppliers</TabsTrigger>
          <TabsTrigger value="store">Store performance</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card className="glass-card p-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.billNo}</TableCell>
                    <TableCell>{stores.find((st) => st.id === s.storeId)?.code}</TableCell>
                    <TableCell>{s.items.length}</TableCell>
                    <TableCell className="capitalize">{s.payment}</TableCell>
                    <TableCell className="text-right font-medium">{inr(s.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card className="glass-card p-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Eff. cost</TableHead>
                  <TableHead>Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lots.map((l) => {
                  const h = healthForLot(l);
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono text-xs">{l.skuCode}</TableCell>
                      <TableCell>{stores.find((s) => s.id === l.storeId)?.code}</TableCell>
                      <TableCell>{l.remaining}</TableCell>
                      <TableCell>{inr(h.effCost)}</TableCell>
                      <TableCell className={h.margin < 0 ? "text-destructive" : "text-success"}>{(h.margin * 100).toFixed(1)}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="supplier">
          <Card className="glass-card p-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Lots</TableHead>
                  <TableHead className="text-right">Inward value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...supplierAgg.entries()].map(([name, v]) => (
                  <TableRow key={name}>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell>{v.lots}</TableCell>
                    <TableCell className="text-right">{inr(v.value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="store">
          <Card className="glass-card p-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Lots</TableHead>
                  <TableHead>Capital locked</TableHead>
                  <TableHead className="text-right">Revenue (recent)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storePerf.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.code} — {s.name}</TableCell>
                    <TableCell>{s.lots}</TableCell>
                    <TableCell>{inr(s.capital)}</TableCell>
                    <TableCell className="text-right font-medium">{inr(s.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
