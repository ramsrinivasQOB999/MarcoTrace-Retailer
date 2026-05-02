import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sales, inr } from "@/lib/mock-data";
import { Smartphone, Gift, Wallet, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/app/customer")({
  head: () => ({ meta: [{ title: "Customer App — Mercotrace" }] }),
  component: CustomerPage,
});

function CustomerPage() {
  return (
    <>
      <PageHeader title="Customer mobile app" subtitle="Bills, payments, rewards & offers" />

      <Card className="p-5 border-warning/30 bg-warning/5">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-warning-foreground shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium">React Native app not included in this prototype</div>
            <div className="text-muted-foreground">
              Lovable builds web applications. Below is a responsive web preview of the customer experience — the same
              flows can be packaged into a native shell later, or used directly as a mobile-web PWA.
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 mx-auto w-full max-w-[360px]">
          {/* Phone frame */}
          <div className="rounded-[2.5rem] border-8 border-foreground/90 bg-background shadow-elev overflow-hidden">
            <div className="bg-brand-gradient text-primary-foreground p-5">
              <div className="flex items-center gap-2 text-xs opacity-80"><Smartphone className="h-3 w-3" /> Mercotrace</div>
              <div className="mt-4">
                <div className="text-xs opacity-80">Hello, Riya</div>
                <div className="text-xl font-semibold">₹ 1,240 wallet</div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white/15 rounded-lg p-2"><Wallet className="h-4 w-4 mx-auto mb-1" />Pay bill</div>
                <div className="bg-white/15 rounded-lg p-2"><Gift className="h-4 w-4 mx-auto mb-1" />Rewards</div>
                <div className="bg-white/15 rounded-lg p-2">★ 240 pts</div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-xs font-medium text-muted-foreground uppercase">Recent bills</div>
              {sales.slice(0, 3).map((s) => (
                <div key={s.id} className="rounded-lg border p-3 flex justify-between items-center">
                  <div>
                    <div className="font-mono text-xs">{s.billNo}</div>
                    <div className="text-xs text-muted-foreground capitalize">{s.payment}</div>
                  </div>
                  <div className="font-semibold">{inr(s.total)}</div>
                </div>
              ))}
              <Button className="w-full bg-brand-gradient text-primary-foreground">Scan & pay</Button>
            </div>
          </div>
        </div>

        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4">Active offers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: "Buy 2 Get 1 Free", desc: "On all snacks · until Sunday", tag: "Combo" },
              { title: "10% off Dairy", desc: "Members only · daily 4–7pm", tag: "Tier" },
              { title: "₹50 reward", desc: "On bills above ₹500", tag: "Reward" },
              { title: "Festive bundle", desc: "Save ₹120 on grocery basket", tag: "Combo" },
            ].map((o) => (
              <div key={o.title} className="rounded-lg border p-4">
                <div className="text-[10px] font-medium uppercase tracking-wide text-primary">{o.tag}</div>
                <div className="font-medium mt-1">{o.title}</div>
                <div className="text-xs text-muted-foreground">{o.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
