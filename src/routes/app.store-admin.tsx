import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { stores } from "@/lib/mock-data";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Printer, Scale, ShieldCheck, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { permissionsFor } from "@/lib/permissions";
import { ROLE_LABELS } from "@/lib/auth-store";
import type { Role } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { withPerm } from "@/components/with-perm";

export const Route = createFileRoute("/app/store-admin")({
  head: () => ({ meta: [{ title: "Store Admin — Mercotrace" }] }),
  component: withPerm("store_admin.view", StoreAdminPage),
});

const employeeSchema = z.object({
  name: z.string().trim().min(2, "Name min 2 chars").max(60),
  phone: z.string().trim().regex(/^\+?\d{10,13}$/, "Invalid phone"),
  role: z.enum(["store_admin", "employee"]),
});

function StoreAdminPage() {
  const store = stores[0];
  const [employees, setEmployees] = useState([
    { id: "e1", name: "Asha Menon", phone: "+91 98800 22221", role: "store_admin" as const },
    { id: "e2", name: "Vikram Rao", phone: "+91 98800 22222", role: "employee" as const },
  ]);
  const [draft, setDraft] = useState({ name: "", phone: "", role: "employee" as "employee" | "store_admin" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addEmployee = () => {
    const r = employeeSchema.safeParse(draft);
    if (!r.success) {
      const e: Record<string, string> = {};
      r.error.issues.forEach((i) => (e[i.path[0] as string] = i.message));
      setErrors(e);
      return;
    }
    setErrors({});
    setEmployees((prev) => [...prev, { id: `e${prev.length + 1}`, ...r.data }]);
    setDraft({ name: "", phone: "", role: "employee" });
    toast.success("Employee added");
  };

  return (
    <>
      <PageHeader title="Store Admin" subtitle={`${store.name} · ${store.city}`} />

      <Tabs defaultValue="identity">
        <TabsList className="glass-panel flex-wrap h-auto">
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="rbac">RBAC</TabsTrigger>
          <TabsTrigger value="agglomeration">Agglomeration</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="identity">
          <Card className="glass-card p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Store name</Label>
              <Input defaultValue={store.name} />
            </div>
            <div className="space-y-1.5">
              <Label>Owner</Label>
              <Input defaultValue={store.owner} />
            </div>
            <div className="space-y-1.5">
              <Label>Contact phone</Label>
              <Input defaultValue={store.phone} />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input defaultValue={store.city} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Address</Label>
              <Input placeholder="Street, City, PIN" />
            </div>
            <div className="space-y-1.5">
              <Label>License number</Label>
              <Input placeholder="FSSAI / GSTIN" />
            </div>
            <div className="space-y-1.5">
              <Label>Warehouse / location</Label>
              <Input placeholder="Main warehouse" />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2">
              <Button variant="outline">Request approval</Button>
              <Button className="bg-brand-gradient text-primary-foreground hover:opacity-95" onClick={() => toast.success("Identity saved")}>
                Save
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card className="glass-card p-5 sm:p-6 space-y-4">
            {[
              { icon: Scale, name: "Mercotrace Weighing Scale", id: "WS-001", on: true },
              { icon: Printer, name: "Thermal Printer", id: "TP-002", on: true },
            ].map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-lg border border-white/40 bg-white/40 p-3">
                <d.icon className="h-5 w-5 text-primary" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{d.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{d.id}</div>
                </div>
                <Switch defaultChecked={d.on} className="ml-auto" />
              </div>
            ))}
            <Button variant="outline"><Plus className="h-4 w-4 mr-1" />Add device</Button>
          </Card>
        </TabsContent>

        <TabsContent value="rbac">
          <Card className="glass-card p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="space-y-1.5 sm:col-span-1">
                <Label>Name</Label>
                <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="+91…" />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={draft.role} onValueChange={(v) => setDraft({ ...draft, role: v as "employee" | "store_admin" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="store_admin">Store Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={addEmployee} className="w-full bg-brand-gradient text-primary-foreground hover:opacity-95">
                  <Plus className="h-4 w-4 mr-1" />Add
                </Button>
              </div>
            </div>

            <div className="divide-y divide-white/40 rounded-lg border border-white/40 bg-white/30">
              {employees.map((e) => (
                <div key={e.id} className="flex items-center gap-3 p-3">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{e.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{e.phone}</div>
                  </div>
                  <Badge variant="secondary" className="ml-auto">{e.role === "store_admin" ? "Store Admin" : "Employee"}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEmployees((p) => p.filter((x) => x.id !== e.id))}
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="agglomeration">
          <Card className="glass-card p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Agglomeration</Label>
                <Input defaultValue={store.agglomeration} />
              </div>
              <div className="space-y-1.5">
                <Label>Store serial</Label>
                <Input defaultValue="01" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Agglomerate-level RBAC supersedes store-level. Stock transfers within agglomeration require Agglomerate Admin.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Send OTP to owner</Button>
              <Button className="bg-brand-gradient text-primary-foreground hover:opacity-95">Save</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card className="glass-card p-5 sm:p-6 space-y-3 text-sm">
            {[
              "Owner can create/edit/deactivate store via Mercotrace Support",
              "Stores join an agglomerate only after OTP confirmation",
              "Distinct RBAC for agglomerate and store users",
              "Inventory assigned per store",
              "Stock transfer within agglomeration → agglomerate admin only",
              "Duplicate invoice rejected; no retrospective price changes",
            ].map((r) => (
              <div key={r} className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-success mt-0.5" />
                <span>{r}</span>
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
