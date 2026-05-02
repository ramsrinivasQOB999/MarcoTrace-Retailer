import { cn } from "@/lib/utils";

type Tone = "green" | "yellow" | "red" | "neutral";

const styles: Record<Tone, string> = {
  green: "bg-success/15 text-success border-success/30",
  yellow: "bg-warning/20 text-warning-foreground border-warning/40",
  red: "bg-destructive/15 text-destructive border-destructive/30",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        styles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
