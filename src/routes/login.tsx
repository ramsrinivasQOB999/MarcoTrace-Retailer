import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setAuth, ROLE_LABELS } from "@/lib/auth-store";
import type { Role } from "@/lib/mock-data";
import { toast } from "sonner";
import { ShieldCheck, Smartphone } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Mercotrace Retail Trade" },
      { name: "description", content: "Phone OTP sign-in for Mercotrace Retail Trade — multi-role retail inventory & POS." },
    ],
  }),
  component: LoginPage,
});

const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d{10,13}$/i, "Enter a valid phone number (10–13 digits, optional +)"),
  role: z.enum(["agglomerate_admin", "store_admin", "employee", "customer"]),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
});

type PhoneForm = z.infer<typeof phoneSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState<PhoneForm | null>(null);

  const form = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "", role: "store_admin", name: "" },
  });

  const onSubmit = (data: PhoneForm) => {
    setPending(data);
    setStage("otp");
    toast.success("OTP sent", { description: `Use code 123456 (demo) for ${data.phone}` });
  };

  const verify = () => {
    if (otp !== "123456") {
      toast.error("Invalid OTP", { description: "Demo OTP is 123456" });
      return;
    }
    if (!pending) return;
    setAuth({ phone: pending.phone, role: pending.role, name: pending.name });
    toast.success("Welcome to Mercotrace");
    navigate({ to: "/app" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-brand-gradient text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur grid place-items-center font-bold">M</div>
          <div>
            <div className="font-semibold">Mercotrace</div>
            <div className="text-xs text-white/80">Retail Trade · v0.1</div>
          </div>
        </div>
        <div className="space-y-4 max-w-md">
          <h2 className="text-3xl font-semibold leading-tight">Run every store with one nervous system.</h2>
          <p className="text-white/85">
            Inventory at lot level, GST-ready POS, expiry & margin alerts, and aging insights — across every store
            in your agglomeration.
          </p>
          <ul className="space-y-2 text-sm text-white/85">
            <li>• Auto SKU codes (CCC-TTT-GGG-PPP-000)</li>
            <li>• FIFO billing with expiry guard</li>
            <li>• Effective cost = base + interest + wastage</li>
          </ul>
        </div>
        <p className="text-xs text-white/70">Frontend prototype · mock data only</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-6 sm:p-8 shadow-elev">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-brand-gradient grid place-items-center text-primary-foreground font-bold lg:hidden">M</div>
            <div>
              <h1 className="text-xl font-semibold">Sign in</h1>
              <p className="text-sm text-muted-foreground">Phone OTP authentication</p>
            </div>
          </div>

          {stage === "phone" ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Riya Sharma" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" inputMode="tel" placeholder="+91 98800 12345" className="pl-9" {...form.register("phone")} />
                </div>
                {form.formState.errors.phone && (
                  <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Sign in as</Label>
                <Select
                  value={form.watch("role")}
                  onValueChange={(v) => form.setValue("role", v as Role, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-brand-gradient text-primary-foreground hover:opacity-95">
                Send OTP
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Demo OTP is <span className="font-mono font-semibold">123456</span>
              </p>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  <span>Code sent to <span className="font-medium">{pending?.phone}</span></span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Enter 6-digit OTP</Label>
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStage("phone")}>
                  Back
                </Button>
                <Button
                  className="flex-1 bg-brand-gradient text-primary-foreground hover:opacity-95"
                  onClick={verify}
                  disabled={otp.length !== 6}
                >
                  Verify & continue
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
