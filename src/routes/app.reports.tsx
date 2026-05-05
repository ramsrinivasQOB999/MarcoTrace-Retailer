import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lots, stores, sales, healthForLot, inr } from "@/lib/mock-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-store";
import { fetchInventoryLots, fetchSaleLines, fetchSales, fetchStores, getApiBaseUrl } from "@/lib/api";

import { withPerm } from "@/components/with-perm";

export const Route = createFileRoute("/app/reports")({
  head: () => ({ meta: [{ title: "Reports — Mercotrace" }] }),
  component: withPerm("reports.view", ReportsPage),
});

function ReportsPage() {
  const user = useAuth();
  const token = user?.accessToken;
  const queryClient = useQueryClient();

  const storesQuery = useQuery({
    queryKey: ["stores", token],
    queryFn: () => fetchStores(token!),
    enabled: Boolean(token),
  });
  const lotsQuery = useQuery({
    queryKey: ["inventory-lots", token],
    queryFn: () => fetchInventoryLots(token!),
    enabled: Boolean(token),
  });
  const salesQuery = useQuery({
    queryKey: ["sales", token],
    queryFn: () => fetchSales(token!),
    enabled: Boolean(token),
  });
  const saleLinesQuery = useQuery({
    queryKey: ["sale-lines", token],
    queryFn: () => fetchSaleLines(token!),
    enabled: Boolean(token),
  });

  const storesData = token ? (storesQuery.data ?? []) : stores;
  const lotsData = token ? (lotsQuery.data ?? []) : lots;
  const salesData = token ? (salesQuery.data ?? []) : sales;
  const saleLines = token ? (saleLinesQuery.data ?? []) : [];

  const itemCountBySaleId = useMemo(() => {
    const counts = new Map<string, number>();
    saleLines.forEach((line) => {
      const saleId = String(line.sale.id);
      counts.set(saleId, (counts.get(saleId) ?? 0) + Number(line.qty ?? 0));
    });
    return counts;
  }, [saleLines]);

  const supplierAgg = new Map<string, { value: number; lots: number }>();
  lotsData.forEach((l) => {
    const cur = supplierAgg.get(l.supplier) ?? { value: 0, lots: 0 };
    cur.value += l.costPrice * l.qty;
    cur.lots += 1;
    supplierAgg.set(l.supplier, cur);
  });

  const storePerf = storesData.map((s) => {
    const storeLots = lotsData.filter((l) => l.storeId === s.id);
    const storeSales = salesData.filter((sa) => sa.storeId === s.id);
    return {
      ...s,
      capital: storeLots.reduce((a, l) => a + l.costPrice * l.remaining, 0),
      revenue: storeSales.reduce((a, sa) => a + sa.total, 0),
      lots: storeLots.length,
    };
  });

  const onExport = async () => {
    try {
      if (token) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["sales", token] }),
          queryClient.invalidateQueries({ queryKey: ["sale-lines", token] }),
          queryClient.invalidateQueries({ queryKey: ["stores", token] }),
        ]);
      }

      const csvRows = [
        ["billNo", "storeCode", "items", "payment", "total"],
        ...salesData.map((s) => [
          s.billNo,
          storesData.find((st) => st.id === s.storeId)?.code ?? "",
          String(token ? (itemCountBySaleId.get(s.id) ?? 0) : s.items.length),
          s.payment,
          String(s.total),
        ]),
      ];
      const csv = csvRows.map((row) => row.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `reports-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
      toast.success("Report exported", {
        description: token ? "CSV generated from live backend data" : "CSV generated from preview data",
      });
    } catch (e) {
      toast.error("Export failed", { description: e instanceof Error ? e.message : String(e) });
    }
  };

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Daily summary, inventory health, supplier comparison, store performance"
        actions={
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        }
      />
      {token && (
        <p className="text-xs text-muted-foreground mb-3">
          Connected to <span className="font-mono">{getApiBaseUrl()}</span>
          {(salesQuery.isFetching || lotsQuery.isFetching || storesQuery.isFetching || saleLinesQuery.isFetching)
            ? " · Loading…"
            : ""}
        </p>
      )}

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
                {salesData.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.billNo}</TableCell>
                    <TableCell>{storesData.find((st) => st.id === s.storeId)?.code}</TableCell>
                    <TableCell>{token ? (itemCountBySaleId.get(s.id) ?? 0) : s.items.length}</TableCell>
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
                {lotsData.map((l) => {
                  const h = healthForLot(l);
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono text-xs">{l.skuCode}</TableCell>
                      <TableCell>{storesData.find((s) => s.id === l.storeId)?.code}</TableCell>
                      <TableCell>{l.remaining}</TableCell>
                      <TableCell>{inr(h.effCost)}</TableCell>
                      <TableCell className={h.margin < 0 ? "text-destructive" : "text-success"}>
                        {(h.margin * 100).toFixed(1)}%
                      </TableCell>
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
                    <TableCell>
                      {s.code} — {s.name}
                    </TableCell>
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
