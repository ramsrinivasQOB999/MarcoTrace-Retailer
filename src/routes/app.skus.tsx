import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { skus as seedSkus, type SKU, inr } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { withPerm } from "@/components/with-perm";

export const Route = createFileRoute("/app/skus")({
  head: () => ({ meta: [{ title: "SKUs — Mercotrace" }] }),
  component: withPerm("skus.view", SKUsPage),
});

const skuSchema = z.object({
  category: z
    .string()
    .trim()
    .min(3)
    .max(3, "3 letters (e.g. FMC)")
    .regex(/^[A-Z]+$/i),
  type: z
    .string()
    .trim()
    .min(3)
    .max(3, "3 letters")
    .regex(/^[A-Z]+$/i),
  group: z
    .string()
    .trim()
    .min(3)
    .max(3, "3 letters")
    .regex(/^[A-Z]+$/i),
  pack: z
    .string()
    .trim()
    .min(3)
    .max(3, "3 chars")
    .regex(/^[A-Z0-9]+$/i),
  name: z.string().trim().min(3).max(80),
  hsn: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/, "4–8 digit HSN"),
  gst: z.coerce.number().min(0).max(28),
  unit: z.string().trim().min(1).max(8),
  basePrice: z.coerce.number().min(0).max(1_000_000),
});
type SKUForm = z.infer<typeof skuSchema>;

function SKUsPage() {
  const [items, setItems] = useState<SKU[]>(seedSkus);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const form = useForm<SKUForm>({
    resolver: zodResolver(skuSchema),
    defaultValues: {
      category: "FMC",
      type: "BEV",
      group: "JUI",
      pack: "500",
      name: "",
      hsn: "2202",
      gst: 18,
      unit: "btl",
      basePrice: 0,
    },
  });

  const filtered = useMemo(
    () =>
      items.filter((s) =>
        [s.code, s.name, s.category].join(" ").toLowerCase().includes(q.toLowerCase()),
      ),
    [items, q],
  );

  const onAdd = (data: SKUForm) => {
    const seq = String(items.length + 1).padStart(3, "0");
    const code = `${data.category.toUpperCase()}-${data.type.toUpperCase()}-${data.group.toUpperCase()}-${data.pack.toUpperCase()}-${seq}`;
    const sku: SKU = {
      id: `k${Date.now()}`,
      code,
      name: data.name,
      category: data.category.toUpperCase(),
      hsn: data.hsn,
      gst: Number(data.gst),
      unit: data.unit,
      active: true,
      basePrice: Number(data.basePrice),
    };
    setItems((p) => [sku, ...p]);
    toast.success("SKU created", { description: code });
    setOpen(false);
    form.reset();
  };

  const toggle = (id: string) => {
    setItems((p) => p.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  };

  return (
    <>
      <PageHeader
        title="SKUs"
        subtitle="Auto codes follow CCC-TTT-GGG-PPP-000 with HSN/GST"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-gradient text-primary-foreground hover:opacity-95">
                <Plus className="h-4 w-4 mr-1" /> New SKU
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Create SKU</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onAdd)} className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {(["category", "type", "group", "pack"] as const).map((f) => (
                    <div key={f} className="space-y-1.5">
                      <Label className="capitalize">{f}</Label>
                      <Input maxLength={3} className="font-mono uppercase" {...form.register(f)} />
                      {form.formState.errors[f] && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors[f]?.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <Label>Product name</Label>
                  <Input {...form.register("name")} />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="space-y-1.5">
                    <Label>HSN</Label>
                    <Input {...form.register("hsn")} />
                    {form.formState.errors.hsn && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.hsn.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>GST %</Label>
                    <Select
                      value={String(form.watch("gst"))}
                      onValueChange={(v) =>
                        form.setValue("gst", Number(v), { shouldValidate: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 5, 12, 18, 28].map((g) => (
                          <SelectItem key={g} value={String(g)}>
                            {g}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Unit</Label>
                    <Input {...form.register("unit")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Base price (₹)</Label>
                    <Input type="number" step="0.01" {...form.register("basePrice")} />
                    {form.formState.errors.basePrice && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.basePrice.message}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-brand-gradient text-primary-foreground">
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="glass-card p-4">
        <div className="relative max-w-sm mb-3">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search SKUs..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">HSN</TableHead>
                <TableHead className="hidden md:table-cell">GST</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs whitespace-nowrap">{s.code}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{s.category}</TableCell>
                  <TableCell className="hidden md:table-cell">{s.hsn}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <StatusBadge tone="neutral">{s.gst}%</StatusBadge>
                  </TableCell>
                  <TableCell>{inr(s.basePrice)}</TableCell>
                  <TableCell>
                    <Switch checked={s.active} onCheckedChange={() => toggle(s.id)} />
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
