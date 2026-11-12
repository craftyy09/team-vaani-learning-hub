import { cn } from "@/lib/utils";
type Status = "soon" | "preview" | "teacher" | "off";
const styles: Record<Status, string> = {
  soon: "bg-accent/20 text-accent-foreground border-accent/40",
  preview: "bg-secondary text-secondary-foreground border-border",
  teacher: "bg-primary/10 text-primary border-primary/30",
  off: "bg-muted text-muted-foreground border-border",
};
const labels: Record<Status, string> = { soon: "Coming soon", preview: "Preview", teacher: "Teacher controlled", off: "Not connected" };
export function StatusBadge({ status, label, className }: { status: Status; label?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", styles[status], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {label ?? labels[status]}
    </span>
  );
}
