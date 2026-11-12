import type { LucideIcon } from "lucide-react";
export type SidebarItem = { id: string; label: string; icon: LucideIcon };
// Jump links within a dashboard page (in-page scrolling only).
export function DashboardSidebar({ items, role }: { items: SidebarItem[]; role: string }) {
  return (
    <>
      <aside className="sticky top-20 hidden h-fit w-56 shrink-0 rounded-2xl bg-sidebar p-3 text-sidebar-foreground lg:block" aria-label={`${role} sections`}>
        <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-sidebar-primary">{role}</p>
        <ul className="space-y-0.5">
          {items.map((i) => (
            <li key={i.id}><a href={`#${i.id}`} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition hover:bg-sidebar-accent"><i.icon className="h-4 w-4 opacity-80" />{i.label}</a></li>
          ))}
        </ul>
      </aside>
      <nav className="-mx-4 mb-6 overflow-x-auto px-4 lg:hidden" aria-label={`${role} sections`}>
        <ul className="flex w-max gap-2">
          {items.map((i) => <li key={i.id}><a href={`#${i.id}`} className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm"><i.icon className="h-3.5 w-3.5" />{i.label}</a></li>)}
        </ul>
      </nav>
    </>
  );
}
