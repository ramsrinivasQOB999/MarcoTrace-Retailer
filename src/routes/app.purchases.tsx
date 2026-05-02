import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { lots as seedLots, stores, skus, type Lot, inr } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/app/purchases")({
  head: () => ({ meta: [{ title: "Purchases & Inward — Mercotrace" }] }),
  component: PurchasesPage,
});

const purchaseSchema = z.object({
  invoiceNo: z.string().trim().min(3).max(20).regex(/^[A-Z0-9-]+$/i),
  supplier: z.string().trim().min(2).max(60),
  storeId: z.string().min(1, "Pick a store"),
  invoiceDate: z.string().min(1),
  items: z
    .array(
      z.object({
        skuId: z.string().min(1, "Pick SKU"),
        qty: z.coerce.number().min(1).max(100000),
        costPrice: z.coerce.number().min(0.01).max(1_000_000),
        sellPrice: z.coerce.number().min(0.01).max(1_000_000),
        expiryDate: z.string().min(1),
      }),
    )
    .min(1, "Add at least one item"),
});
type PurchaseForm = z.infer<typeof purchaseSchema>;

function PurchasesPage() {
  const [lots, setLots] = useState<Lot[]>(seedLots);
  const [open, setOpen] = useState(false);
  const [usedInvoices, setUsedInvoices] = useState<Set<string>>(new Set(seedLots.map((l) => l.invoiceNo)));

  const form = useForm<PurchaseForm>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      invoiceNo: "",
      supplier: "",
      storeId: stores[0].id,
      invoiceDate: format(new Date(), "yyyy-MM-dd"),
      items: [{ skuId: skus[0].id, qty: 1, costPrice: 0, sellPrice: 0, expiryDate: format(new Date(Date.now() + 30 * 86400000), "yyyy-MM-dd") }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  const onSubmit = (data: PurchaseForm) => {
    if (usedInvoices.has(data.invoiceNo.toUpperCase())) {
      toast.error("Duplicate invoice", { description: `${data.invoiceNo} already exists` });
      return;
    }
    const newLots: Lot[] = data.items.map((it, idx) => {
      const sku = skus.find((s) => s.id === it.skuId)!;
      return {
        id: `l${Date.now()}-${idx}`,
        skuId: sku.id,
        skuCode: sku.code,
        storeId: data.storeId,
        qty: it.qty,
        remaining: it.qty,
        costPrice: it.costPrice,
        sellPrice: it.sellPrice,
        purchaseDate: new Date(data.invoiceDate).toISOString(),
        expiryDate: new Date(it.expiryDate).toISOString(),
        supplier: data.supplier,
        invoiceNo: data.invoiceNo.toUpperCase(),
      };
    });
    setLots((p) => [...newLots, ...p]);
    setUsedInvoices((p) => new Set(p).add(data.invoiceNo.toUpperCase()));
    toast.success("Inward booked", { description: `${newLots.length} lot(s) created from ${data.invoiceNo}` });
    setOpen(false);
    form.reset();
  };

  const grouped = useMemo(() => {
    const map = new Map<string, Lot[]>();
    lots.forEach((l) => {
      const arr = map.get(l.invoiceNo) ?? [];
      arr.push(l);
      map.set(l.invoiceNo, arr);
    });
    return Array.from(map.entries()).sort((a, b) => (b[1][0].purchaseDate > a[1][0].purchaseDate ? 1 : -1));
  }, [lots]);

  return (
    <>
      <PageHeader
        title="Purchases & Inward"
        subtitle="Capture invoices, auto-generate lots, distribute to stores"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-gradient text-primary-foreground hover:opacity-95">
                <Plus className="h-4 w-4 mr-1" /> New inward
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Capture purchase invoice</DialogTitle></DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <Label>Invoice #</Label>
                    <Input className="uppercase" {...form.register("invoiceNo")} />
                    {form.formState.errors.invoiceNo && <p className="text-xs text-destructive">{form.formState.errors.invoiceNo.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Supplier</Label>
                    <Input {...form.register("supplier")} />
                    {form.formState.errors.supplier && <p className="text-xs text-destructive">{form.formState.errors.supplier.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Store</Label>
                    <Select value={form.watch("storeId")} onValueChange={(v) => form.setValue("storeId", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {stores.map((s) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Invoice date</Label>
                    <Input type="date" {...form.register("invoiceDate")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Line items</Label>
                    <Button type="button" variant="outline" size="sm"
                      onClick={() => append({ skuId: skus[0].id, qty: 1, costPrice: 0, sellPrice: 0, expiryDate: format(new Date(Date.now() + 30 * 86400000), "yyyy-MM-dd") })}>
                      <Plus className="h-4 w-4 mr-1" /> Add item
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {fields.map((f, idx) => (
                      <div key={f.id} className="grid grid-cols-12 gap-2 items-start rounded-lg border p-3">
                        <div className="col-span-12 sm:col-span-4 space-y-1">
                          <Label className="text-xs">SKU</Label>
                          <Select value={form.watch(`items.${idx}.skuId`)} onValueChange={(v) => form.setValue(`items.${idx}.skuId`, v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {skus.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3 sm:col-span-2 space-y-1">
                          <Label className="text-xs">Qty</Label>
                          <Input type="number" {...form.register(`items.${idx}.qty`)} />
                        </div>
                        <div className="col-span-4 sm:col-span-2 space-y-1">
                          <Label className="text-xs">Cost ₹</Label>
                          <Input type="number" step="0.01" {...form.register(`items.${idx}.costPrice`)} />
                        </div>
                        <div className="col-span-4 sm:col-span-2 space-y-1">
                          <Label className="text-xs">MRP ₹</Label>
                          <Input type="number" step="0.01" {...form.register(`items.${idx}.sellPrice`)} />
                        </div>
                        <div className="col-span-9 sm:col-span-2 space-y-1">
                          <Label className="text-xs">Expiry</Label>
                          <Input type="date" {...form.register(`items.${idx}.expiryDate`)} />
                        </div>
                        <div className="col-span-12 flex justify-end">
                          <Button type="button" size="icon" variant="ghost" onClick={() => fields.length > 1 && remove(idx)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-brand-gradient text-primary-foreground">Book inward</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="glass-card p-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grouped.map(([inv, items]) => {
                const store = stores.find((s) => s.id === items[0].storeId);
                const value = items.reduce((s, l) => s + l.costPrice * l.qty, 0);
                return (
                  <TableRow key={inv}>
                    <TableCell className="font-mono text-xs">{inv}</TableCell>
                    <TableCell>{items[0].supplier}</TableCell>
                    <TableCell>{store?.code}</TableCell>
                    <TableCell>{format(new Date(items[0].purchaseDate), "dd MMM yyyy")}</TableCell>
                    <TableCell>{items.length}</TableCell>
                    <TableCell className="text-right font-medium">{inr(value)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
}
