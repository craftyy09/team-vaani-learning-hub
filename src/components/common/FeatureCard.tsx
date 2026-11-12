import type { LucideIcon } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
export function FeatureCard({ icon: Icon, title, text, soon = true }: { icon: LucideIcon; title: string; text: string; soon?: boolean }) {
  return (
    <div className="lift rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
        {soon && <StatusBadge status="soon" />}
      </div>
      <h3 className="mt-5 text-xl font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
