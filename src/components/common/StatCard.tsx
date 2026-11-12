import type { LucideIcon } from "lucide-react";
// Shows "—" until real data exists; never pass invented numbers.
export function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-sm">{label}</span><Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 font-display text-3xl font-semibold">{value ?? "—"}</p>
      {!value && <p className="mt-1 text-xs text-muted-foreground">No data yet</p>}
    </div>
  );
}
