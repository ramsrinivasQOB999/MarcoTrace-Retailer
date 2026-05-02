import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { setAuth, ROLE_LABELS } from "@/lib/auth-store";
import {
  authenticate,
  fetchAccount,
  getApiBaseUrl,
  mapAuthoritiesToRole,
} from "@/lib/api";
import type { Role } from "@/lib/mock-data";
import { DEFAULT_ROUTE } from "@/lib/permissions";
import { toast } from "sonner";
import { ShieldCheck, Smartphone } from "lucide-react";
import bgVeggies from "@/assets/login-veggies.jpg";
import logoLight from "@/assets/mercotrace-logo-light.png";
import logoDark from "@/assets/mercotrace-logo-dark.png";

/** Temporary static code until SMS OTP is integrated with your provider. */
const STAGING_VERIFICATION_CODE = "123456";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Mercotrace" },
      {
        name: "description",
        content:
          "Mercotrace retailer platform — secure sign-in for inventory, POS, and multi-store operations.",
      },
    ],
  }),
  component: LoginPage,
});

const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d{10,13}$/i, "Enter a valid mobile number (10–13 digits, optional +)"),
  role: z.enum(["agglomerate_admin", "store_admin", "employee", "customer"]),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
});

type PhoneForm = z.infer<typeof phoneSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState<PhoneForm | null>(null);
  const [role, setRole] = useState<Role>("store_admin");
  const [apiUsername, setApiUsername] = useState(() => (import.meta.env.DEV ? "admin" : ""));
  const [apiPassword, setApiPassword] = useState(() => (import.meta.env.DEV ? "admin" : ""));
  const [apiBusy, setApiBusy] = useState(false);

  const form = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "", role: "store_admin", name: "" },
  });

  const onSubmit = (data: Omit<PhoneForm, "role">) => {
    const merged: PhoneForm = { ...data, role };
    setPending(merged);
    setStage("otp");
    toast.success("Verification code sent", {
      description: `Check messages for ${merged.phone}.`,
    });
  };

  const verify = () => {
    if (otp !== STAGING_VERIFICATION_CODE) {
      toast.error("Invalid verification code", {
        description: "The code entered does not match. Try again or request a new code.",
      });
      return;
    }
    if (!pending) return;
    setAuth({ phone: pending.phone, role: pending.role, name: pending.name });
    toast.success("Welcome back");
    navigate({ to: DEFAULT_ROUTE[pending.role] });
  };

  const signInWithApi = async (e: FormEvent) => {
    e.preventDefault();
    setApiBusy(true);
    try {
      const token = await authenticate(apiUsername.trim(), apiPassword);
      const account = await fetchAccount(token);
      const mappedRole = mapAuthoritiesToRole(account.authorities ?? []);
      const displayName =
        [account.firstName, account.lastName].filter(Boolean).join(" ").trim() || account.login;
      setAuth({
        phone: account.email ?? "",
        role: mappedRole,
        name: displayName,
        accessToken: token,
        login: account.login,
      });
      toast.success("Signed in successfully");
      navigate({ to: DEFAULT_ROUTE[mappedRole] });
    } catch (err) {
      toast.error("Sign-in failed", {
        description:
          err instanceof Error
            ? err.message
            : `Confirm the service is running at ${getApiBaseUrl()} and try again.`,
      });
    } finally {
      setApiBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <img
        src={bgVeggies}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        width={1080}
        height={1920}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(79,107,255,0.78) 0%, rgba(108,99,255,0.72) 50%, rgba(139,92,246,0.78) 100%)",
        }}
      />

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between p-10 text-white">
          <div className="flex items-center">
            <img
              src={logoLight}
              alt="Mercotrace"
              className="h-11 w-auto object-contain drop-shadow"
            />
          </div>
          <div className="space-y-4 max-w-md">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              One platform for every store.
            </h1>
            <p className="text-white/90 text-[15px] leading-relaxed">
              Inventory, billing, compliance, and insights—aligned across locations with clear roles
              and audit-friendly operations.
            </p>
            <ul className="space-y-2 text-sm text-white/85">
              <li>• Structured SKU and lot tracking</li>
              <li>• Point of sale with GST-ready flows</li>
              <li>• Expiry, margin, and aging visibility</li>
            </ul>
          </div>
          <p className="text-xs text-white/60">© Mercotrace. All rights reserved.</p>
        </div>

        <div className="flex items-center justify-center p-4 sm:p-6">
          <Card className="glass-card w-full max-w-md p-6 sm:p-8 border-white/60 shadow-lg">
            <div className="flex items-center gap-3 mb-1">
              <img
                src={logoDark}
                alt="Mercotrace"
                className="h-9 w-auto object-contain lg:hidden"
              />
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Sign in</h2>
                <p className="text-sm text-muted-foreground">
                  Mercotrace Retailer — use your organization account
                </p>
              </div>
            </div>

            <Tabs defaultValue="organization" className="w-full mt-5">
              <TabsList className="grid w-full grid-cols-2 mb-5 h-11">
                <TabsTrigger value="organization" className="text-sm">
                  Organization account
                </TabsTrigger>
                <TabsTrigger value="mobile" className="text-sm">
                  Mobile verification
                </TabsTrigger>
              </TabsList>

              <TabsContent value="organization" className="mt-0 space-y-4">
                <form onSubmit={signInWithApi} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="api-user">Username</Label>
                    <Input
                      id="api-user"
                      autoComplete="username"
                      placeholder="Enter your username"
                      value={apiUsername}
                      onChange={(e) => setApiUsername(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="api-pass">Password</Label>
                    <Input
                      id="api-pass"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={apiPassword}
                      onChange={(e) => setApiPassword(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 text-primary-foreground font-medium"
                    disabled={apiBusy}
                    style={{
                      backgroundImage: "linear-gradient(135deg, #5B8DEF 0%, #6C63FF 100%)",
                    }}
                  >
                    {apiBusy ? "Signing in…" : "Sign in"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="mobile" className="mt-0">
                {stage === "phone" ? (
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full name</Label>
                      <Input
                        id="name"
                        placeholder="As on your account"
                        className="h-11"
                        {...form.register("name")}
                      />
                      {form.formState.errors.name && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Mobile number</Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          inputMode="tel"
                          placeholder="+91 98765 43210"
                          className="pl-9 h-11"
                          {...form.register("phone")}
                        />
                      </div>
                      {form.formState.errors.phone && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Workspace role</Label>
                      <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                            <SelectItem key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground">
                        Menu and permissions follow the role you select.
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-11 text-primary-foreground font-medium"
                      style={{
                        backgroundImage: "linear-gradient(135deg, #5B8DEF 0%, #6C63FF 100%)",
                      }}
                    >
                      Send verification code
                    </Button>
                    <p className="text-[11px] text-muted-foreground text-center leading-relaxed px-1">
                      SMS delivery is not connected yet. Until your messaging provider is configured,
                      use verification code{" "}
                      <span className="font-mono font-semibold text-foreground">
                        {STAGING_VERIFICATION_CODE}
                      </span>{" "}
                      after requesting a code.
                    </p>
                  </form>
                ) : (
                  <div className="space-y-5">
                    <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-success shrink-0" />
                        <span>
                          Code sent to <span className="font-medium">{pending?.phone}</span>
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>6-digit verification code</Label>
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
                      <Button variant="outline" className="flex-1 h-11" onClick={() => setStage("phone")}>
                        Back
                      </Button>
                      <Button
                        className="flex-1 h-11 text-primary-foreground font-medium"
                        style={{
                          backgroundImage: "linear-gradient(135deg, #5B8DEF 0%, #6C63FF 100%)",
                        }}
                        onClick={verify}
                        disabled={otp.length !== 6}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
