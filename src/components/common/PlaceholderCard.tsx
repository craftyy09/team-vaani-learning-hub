import type { ReactNode } from "react";
export function PlaceholderCard({ title, description, icon }: { title: string; description: string; icon?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 text-primary">{icon}<h3 className="text-lg font-semibold text-foreground">{title}</h3></div>
      <p className="text-sm text-muted-foreground">{description}</p>
      <span className="mt-4 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">Coming soon</span>
    </div>
  );
}
