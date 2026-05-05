import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useAuth } from "@/lib/auth-store";
import { createSkuApi, fetchSkus, getApiBaseUrl, updateSkuApi } from "@/lib/api";
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
  const user = useAuth();
  const token = user?.accessToken;
  const queryClient = useQueryClient();
  const [items, setItems] = useState<SKU[]>(seedSkus);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const skusQuery = useQuery({
    queryKey: ["skus", token],
    queryFn: () => fetchSkus(token!),
    enabled: Boolean(token),
  });
  const rows = token ? (skusQuery.data ?? []) : items;
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
      rows.filter((s) =>
        [s.code, s.name, s.category].join(" ").toLowerCase().includes(q.toLowerCase()),
      ),
    [rows, q],
  );

  const onAdd = async (data: SKUForm) => {
    const seq = String(rows.length + 1).padStart(3, "0");
    const code = `${data.category.toUpperCase()}-${data.type.toUpperCase()}-${data.group.toUpperCase()}-${data.pack.toUpperCase()}-${seq}`;
    if (token) {
      try {
        await createSkuApi(token, {
          code,
          name: data.name,
          category: data.category.toUpperCase(),
          hsn: data.hsn,
          gst: Number(data.gst),
          unit: data.unit,
          basePrice: Number(data.basePrice),
        });
        await queryClient.invalidateQueries({ queryKey: ["skus", token] });
      } catch (e) {
        toast.error("Could not create SKU", { description: e instanceof Error ? e.message : String(e) });
        return;
      }
    } else {
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
    }
    toast.success("SKU created", { description: code });
    setOpen(false);
    form.reset();
  };

  const toggle = async (id: string) => {
    if (token) {
      const current = rows.find((s) => s.id === id);
      if (!current) return;
      try {
        await updateSkuApi(token, { ...current, active: !current.active });
        await queryClient.invalidateQueries({ queryKey: ["skus", token] });
      } catch (e) {
        toast.error("Could not update SKU", { description: e instanceof Error ? e.message : String(e) });
      }
      return;
    }
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
      {token && (
        <p className="text-xs text-muted-foreground mb-3">
          Connected to <span className="font-mono">{getApiBaseUrl()}</span>
          {skusQuery.isFetching ? " · Loading…" : ""}
        </p>
      )}

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
