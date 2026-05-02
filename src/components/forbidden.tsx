import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useAuth, ROLE_LABELS } from "@/lib/auth-store";

export function Forbidden({
  title = "Access denied",
  message,
}: {
  title?: string;
  message?: string;
}) {
  const user = useAuth();
  return (
    <Card className="glass-card p-8 max-w-xl mx-auto text-center space-y-3">
      <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 grid place-items-center">
        <ShieldAlert className="h-6 w-6 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">
        {message ??
          `Your role (${user ? ROLE_LABELS[user.role] : "Guest"}) does not have permission to view this page.`}
      </p>
      <div className="flex justify-center gap-2 pt-2">
        <Button asChild variant="outline">
          <Link to="/app">Go to dashboard</Link>
        </Button>
      </div>
    </Card>
  );
}
