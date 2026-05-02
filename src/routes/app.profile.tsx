import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth, setAuth, ROLE_LABELS } from "@/lib/auth-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — Mercotrace" }] }),
  component: ProfilePage,
});

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d{10,13}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Invalid email").max(255).or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
});
type ProfileForm = z.infer<typeof profileSchema>;

function ProfilePage() {
  const user = useAuth();
  const initials = (user?.name ?? "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      email: "",
      address: "",
    },
  });

  const onSave = (data: ProfileForm) => {
    if (user) setAuth({ ...user, name: data.name, phone: data.phone });
    toast.success("Profile updated");
  };

  return (
    <>
      <PageHeader title="Profile" subtitle="Manage your account, preferences and security" />

      <Card className="glass-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback
              className="text-primary-foreground text-lg"
              style={{ backgroundImage: "linear-gradient(135deg, #5B8DEF 0%, #6C63FF 100%)" }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-lg font-semibold truncate">{user?.name}</div>
            <div className="text-sm text-muted-foreground truncate">
              {user ? ROLE_LABELS[user.role] : ""} · {user?.phone}
            </div>
          </div>
          <div className="sm:ml-auto">
            <Button variant="outline">Change photo</Button>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="account">
        <TabsList className="glass-panel">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="prefs">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card className="glass-card p-5 sm:p-6">
            <form
              onSubmit={form.handleSubmit(onSave)}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" inputMode="tel" {...form.register("phone")} />
                {form.formState.errors.phone && (
                  <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@store.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Street, City, PIN" {...form.register("address")} />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => form.reset()}>
                  Reset
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-gradient text-primary-foreground hover:opacity-95"
                >
                  Save changes
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="prefs">
          <Card className="glass-card p-5 sm:p-6 space-y-4">
            {[
              { k: "alerts", label: "Lot expiry & margin alerts", on: true },
              { k: "email", label: "Daily email summary", on: false },
              { k: "sms", label: "SMS receipts to customers", on: true },
            ].map((p) => (
              <div key={p.k} className="flex items-center justify-between">
                <div className="text-sm">{p.label}</div>
                <Switch defaultChecked={p.on} />
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="glass-card p-5 sm:p-6 space-y-4">
            <div>
              <Label>Two-factor (Phone OTP)</Label>
              <p className="text-xs text-muted-foreground">Required for all roles</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">Active sessions</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Other sessions signed out")}
              >
                Sign out other devices
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
