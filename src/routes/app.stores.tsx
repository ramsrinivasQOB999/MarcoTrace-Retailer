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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { stores as seedStores, type Store } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-store";
import { createStoreApi, fetchStores, getApiBaseUrl } from "@/lib/api";
import { StatusBadge } from "@/components/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { withPerm } from "@/components/with-perm";
import { Can } from "@/components/can";

export const Route = createFileRoute("/app/stores")({
  head: () => ({ meta: [{ title: "Stores — Mercotrace" }] }),
  component: withPerm("stores.view", StoresPage),
});

const storeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(8)
    .regex(/^[A-Z0-9]+$/i, "Letters/numbers only"),
  name: z.string().trim().min(3).max(80),
  city: z.string().trim().min(2).max(40),
  agglomeration: z.string().trim().min(2).max(40),
  owner: z.string().trim().min(2).max(60),
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d{10,13}$/, "Valid phone required"),
});
type StoreForm = z.infer<typeof storeSchema>;

function StoresPage() {
  const user = useAuth();
  const token = user?.accessToken;
  const queryClient = useQueryClient();
  const [localStores, setLocalStores] = useState<Store[]>(seedStores);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const storesQuery = useQuery({
    queryKey: ["stores", token],
    queryFn: () => fetchStores(token!),
    enabled: Boolean(token),
  });

  const stores = token ? (storesQuery.data ?? []) : localStores;

  const form = useForm<StoreForm>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      code: "",
      name: "",
      city: "",
      agglomeration: "South Cluster",
      owner: "",
      phone: "",
    },
  });

  const filtered = useMemo(
    () =>
      stores.filter((s) =>
        [s.name, s.code, s.city, s.owner].join(" ").toLowerCase().includes(q.toLowerCase()),
      ),
    [stores, q],
  );

  const onAdd = async (data: StoreForm) => {
    if (token) {
      try {
        await createStoreApi(token, data);
        await queryClient.invalidateQueries({ queryKey: ["stores", token] });
        toast.success("Store created", { description: `${data.name} (${data.code})` });
      } catch (e) {
        toast.error("Could not create store", {
          description: e instanceof Error ? e.message : String(e),
        });
        return;
      }
    } else {
      const s: Store = { ...data, id: `s${Date.now()}`, status: "pending" };
      setLocalStores((p) => [s, ...p]);
      toast.success("Store submitted for approval", {
        description: `${data.name} (${data.code}) — local preview only`,
      });
    }
    setOpen(false);
    form.reset();
  };

  return (
    <>
      <PageHeader
        title="Stores"
        subtitle="Manage stores, agglomerations, and ownership approvals"
        actions={
          <Can perm="stores.create">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-brand-gradient text-primary-foreground hover:opacity-95">
                  <Plus className="h-4 w-4 mr-1" /> New store
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create store</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onAdd)} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Code</Label>
                      <Input placeholder="BLR" {...form.register("code")} />
                      {form.formState.errors.code && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.code.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>City</Label>
                      <Input placeholder="Bengaluru" {...form.register("city")} />
                      {form.formState.errors.city && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.city.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Store name</Label>
                    <Input placeholder="Mercotrace Indiranagar" {...form.register("name")} />
                    {form.formState.errors.name && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Agglomeration</Label>
                    <Select
                      value={form.watch("agglomeration")}
                      onValueChange={(v) =>
                        form.setValue("agglomeration", v, { shouldValidate: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["South Cluster", "West Cluster", "North Cluster", "East Cluster"].map(
                          (g) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Owner</Label>
                      <Input placeholder="Full name" {...form.register("owner")} />
                      {form.formState.errors.owner && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.owner.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Owner phone</Label>
                      <Input placeholder="+91..." {...form.register("phone")} />
                      {form.formState.errors.phone && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-brand-gradient text-primary-foreground">
                      Submit for approval
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </Can>
        }
      />

      <Card className="glass-card p-4">
        {token && (
          <p className="text-xs text-muted-foreground mb-3">
            Connected to <span className="font-mono">{getApiBaseUrl()}</span>
            {storesQuery.isFetching ? " · Loading…" : ""}
            {storesQuery.isError ? ` · Error: ${String(storesQuery.error)}` : ""}
          </p>
        )}
        {!token && (
          <p className="text-xs text-muted-foreground mb-3">
            Preview data — sign in with <strong>Organization account</strong> to load stores from your
            service.
          </p>
        )}
        <div className="relative max-w-sm mb-3">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search stores..."
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
                <TableHead>Store</TableHead>
                <TableHead className="hidden md:table-cell">City</TableHead>
                <TableHead className="hidden lg:table-cell">Agglomeration</TableHead>
                <TableHead className="hidden lg:table-cell">Owner</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.code}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{s.city}</TableCell>
                  <TableCell className="hidden lg:table-cell">{s.agglomeration}</TableCell>
                  <TableCell className="hidden lg:table-cell">{s.owner}</TableCell>
                  <TableCell>
                    <StatusBadge
                      tone={
                        s.status === "active" ? "green" : s.status === "pending" ? "yellow" : "red"
                      }
                    >
                      {s.status}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No stores match your search
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
}
