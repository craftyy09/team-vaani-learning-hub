import type { ReactNode } from "react";
import { StatusBadge } from "./StatusBadge";
export function SectionCard({ id, title, description, status = "soon", children, className = "" }: { id?: string; title: string; description?: string; status?: "soon" | "preview" | "teacher" | "off"; children?: ReactNode; className?: string }) {
  return (
    <section id={id} className={`scroll-mt-24 rounded-2xl border border-border bg-card p-6 ${className}`}>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{title}</h2>
          <StatusBadge status={status} />
        </div>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </section>
  );
}

export function EmptyState({ icon, text }: { icon?: ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">
      {icon}<p>{text}</p>
    </div>
  );
}
