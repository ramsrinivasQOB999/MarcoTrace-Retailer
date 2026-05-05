import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { skus, lots, stores, inr } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-store";
import {
  createSaleApi,
  createSaleLineApi,
  fetchInventoryLots,
  fetchSkus,
  fetchStores,
  getApiBaseUrl,
  updateInventoryLotApi,
} from "@/lib/api";
import { Plus, Minus, Search, Trash2, ShieldAlert, QrCode } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

import { withPerm } from "@/components/with-perm";

export const Route = createFileRoute("/app/pos")({
  head: () => ({ meta: [{ title: "POS — Mercotrace" }] }),
  component: withPerm("pos.use", PosPage),
});

interface CartItem {
  skuId: string;
  qty: number;
}

function PosPage() {
  const user = useAuth();
  const token = user?.accessToken;
  const queryClient = useQueryClient();
  const [storeId, setStoreId] = useState(stores[0].id);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [q, setQ] = useState("");
  const [paid, setPaid] = useState<{ bill: string; total: number; gst: number } | null>(null);

  const storesQuery = useQuery({
    queryKey: ["stores", token],
    queryFn: () => fetchStores(token!),
    enabled: Boolean(token),
  });
  const skusQuery = useQuery({
    queryKey: ["skus", token],
    queryFn: () => fetchSkus(token!),
    enabled: Boolean(token),
  });
  const lotsQuery = useQuery({
    queryKey: ["inventory-lots", token],
    queryFn: () => fetchInventoryLots(token!),
    enabled: Boolean(token),
  });

  const storesData = token ? (storesQuery.data ?? []) : stores;
  const skusData = token ? (skusQuery.data ?? []) : skus;
  const lotsData = token ? (lotsQuery.data ?? []) : lots;

  useEffect(() => {
    if (!storesData.length) return;
    if (!storesData.some((s) => s.id === storeId)) {
      setStoreId(storesData[0].id);
    }
  }, [storesData, storeId]);

  const filtered = useMemo(
    () =>
      skusData.filter(
        (s) =>
          s.active &&
          [s.code, s.name, s.category].join(" ").toLowerCase().includes(q.toLowerCase()),
      ),
    [q, skusData],
  );

  const add = (skuId: string) => {
    // expiry guard: if every available lot for this SKU at this store is expired, block
    const storeLots = lotsData.filter(
      (l) => l.skuId === skuId && l.storeId === storeId && l.remaining > 0,
    );
    const sellable = storeLots.filter((l) => new Date(l.expiryDate) > new Date());
    if (storeLots.length === 0) {
      toast.error("Out of stock at this store");
      return;
    }
    if (sellable.length === 0) {
      toast.error("All available lots are expired", { description: "Cannot sell expired stock" });
      return;
    }
    setCart((p) => {
      const existing = p.find((i) => i.skuId === skuId);
      if (existing) return p.map((i) => (i.skuId === skuId ? { ...i, qty: i.qty + 1 } : i));
      return [...p, { skuId, qty: 1 }];
    });
  };

  const update = (skuId: string, delta: number) =>
    setCart((p) =>
      p.flatMap((i) =>
        i.skuId === skuId ? (i.qty + delta <= 0 ? [] : [{ ...i, qty: i.qty + delta }]) : [i],
      ),
    );

  const remove = (skuId: string) => setCart((p) => p.filter((i) => i.skuId !== skuId));

  const totals = useMemo(() => {
    let subtotal = 0;
    let gst = 0;
    cart.forEach((c) => {
      const sku = skusData.find((s) => s.id === c.skuId);
      if (!sku) return;
      const line = sku.basePrice * c.qty;
      subtotal += line;
      gst += (line * sku.gst) / (100 + sku.gst);
    });
    return { subtotal, gst, total: subtotal };
  }, [cart, skusData]);

  const checkout = async () => {
    if (cart.length === 0) return;
    const billNo = `BILL-${Date.now()}`;
    try {
      for (const item of cart) {
        const stock = lotsData
          .filter(
            (l) =>
              l.skuId === item.skuId &&
              l.storeId === storeId &&
              l.remaining > 0 &&
              new Date(l.expiryDate) > new Date(),
          )
          .reduce((sum, l) => sum + l.remaining, 0);
        if (stock < item.qty) {
          const skuName = skusData.find((s) => s.id === item.skuId)?.name ?? "SKU";
          toast.error("Insufficient stock", { description: `${skuName} has only ${stock} sellable units` });
          return;
        }
      }

      if (token) {
        const sale = await createSaleApi(token, {
          billNo,
          date: new Date().toISOString(),
          total: totals.total,
          gst: totals.gst,
          payment: "CASH",
          storeId: Number(storeId),
        });

        await Promise.all(
          cart.map(async (item) => {
            const sku = skusData.find((s) => s.id === item.skuId);
            if (!sku) return;
            await createSaleLineApi(token, {
              qty: item.qty,
              price: sku.basePrice,
              saleId: Number(sale.id),
              skuId: Number(sku.id),
            });
          }),
        );

        const updates = new Map<string, number>();
        for (const item of cart) {
          let toDeduct = item.qty;
          const fifoLots = [...lotsData]
            .filter(
              (l) =>
                l.skuId === item.skuId &&
                l.storeId === storeId &&
                l.remaining > 0 &&
                new Date(l.expiryDate) > new Date(),
            )
            .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
          for (const lot of fifoLots) {
            if (toDeduct <= 0) break;
            const take = Math.min(lot.remaining, toDeduct);
            const newRemaining = (updates.has(lot.id) ? updates.get(lot.id)! : lot.remaining) - take;
            updates.set(lot.id, newRemaining);
            toDeduct -= take;
          }
        }

        await Promise.all(
          Array.from(updates.entries()).map(async ([lotId, remaining]) => {
            const lot = lotsData.find((l) => l.id === lotId);
            if (!lot) return;
            await updateInventoryLotApi(token, { ...lot, remaining });
          }),
        );

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["sales", token] }),
          queryClient.invalidateQueries({ queryKey: ["sale-lines", token] }),
          queryClient.invalidateQueries({ queryKey: ["inventory-lots", token] }),
        ]);
      }

      setPaid({ bill: billNo, total: totals.total, gst: totals.gst });
      setCart([]);
      toast.success("Sale completed", { description: billNo });
    } catch (e) {
      toast.error("Checkout failed", { description: e instanceof Error ? e.message : String(e) });
    }
  };

  return (
    <>
      <PageHeader
        title="Point of Sale"
        subtitle="GST billing with FIFO lot deduction & expiry guard"
        actions={
          <div className="w-56">
            <Select value={storeId} onValueChange={setStoreId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {storesData.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.code} — {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
      {token && (
        <p className="text-xs text-muted-foreground mb-3">
          Connected to <span className="font-mono">{getApiBaseUrl()}</span>
          {storesQuery.isFetching || skusQuery.isFetching || lotsQuery.isFetching ? " · Loading…" : ""}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="glass-card p-4 lg:col-span-3">
          <div className="relative mb-3">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search products..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((s) => {
              const stock = lotsData
                .filter((l) => l.skuId === s.id && l.storeId === storeId)
                .reduce((a, l) => a + l.remaining, 0);
              const expired =
                lotsData
                  .filter((l) => l.skuId === s.id && l.storeId === storeId)
                  .every((l) => new Date(l.expiryDate) <= new Date()) && stock > 0;
              return (
                <button
                  key={s.id}
                  onClick={() => add(s.id)}
                  className="text-left rounded-lg border p-3 hover:border-primary/50 hover:shadow-card transition group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{s.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground truncate">
                        {s.code}
                      </div>
                    </div>
                    <StatusBadge
                      tone={stock === 0 ? "red" : expired ? "red" : stock < 20 ? "yellow" : "green"}
                    >
                      {stock}
                    </StatusBadge>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="font-semibold">{inr(s.basePrice)}</div>
                    <div className="text-xs text-muted-foreground">GST {s.gst}%</div>
                  </div>
                  {expired && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-destructive">
                      <ShieldAlert className="h-3 w-3" /> Expired
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="glass-card p-4 lg:col-span-2 flex flex-col">
          <h3 className="font-semibold mb-2">Cart</h3>
          <div className="flex-1 overflow-y-auto -mx-4 px-4">
            {cart.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">No items yet</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((c) => {
                    const sku = skusData.find((s) => s.id === c.skuId);
                    if (!sku) return null;
                    return (
                      <TableRow key={c.skuId}>
                        <TableCell>
                          <div className="font-medium text-sm">{sku.name}</div>
                          <div className="text-xs text-muted-foreground">{inr(sku.basePrice)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => update(c.skuId, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm">{c.qty}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => update(c.skuId, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{inr(sku.basePrice * c.qty)}</TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => remove(c.skuId)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
          <div className="border-t pt-3 mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal (incl. GST)</span>
              <span>{inr(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST component</span>
              <span>{inr(totals.gst)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{inr(totals.total)}</span>
            </div>
            <Button
              className="w-full mt-2 bg-brand-gradient text-primary-foreground hover:opacity-95"
              disabled={cart.length === 0}
              onClick={checkout}
            >
              Charge {inr(totals.total)}
            </Button>
          </div>
        </Card>
      </div>

      <Dialog open={!!paid} onOpenChange={(v) => !v && setPaid(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Payment received</DialogTitle>
          </DialogHeader>
          {paid && (
            <div className="space-y-4 text-center">
              <div className="mx-auto h-32 w-32 rounded-lg border grid place-items-center bg-muted">
                <QrCode className="h-20 w-20 text-muted-foreground" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Bill</div>
                <div className="font-mono">{paid.bill}</div>
              </div>
              <div className="text-2xl font-semibold">{inr(paid.total)}</div>
              <Button className="w-full" onClick={() => setPaid(null)}>
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
