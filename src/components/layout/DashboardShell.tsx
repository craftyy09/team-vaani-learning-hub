import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { DashboardSidebar, type SidebarItem } from "./DashboardSidebar";

export function DashboardShell({ role, title, intro, nav, children }: { role: string; title: string; intro: string; nav: SidebarItem[]; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row lg:gap-8 px-4 py-8 md:py-10">
        <DashboardSidebar items={nav} role={role} />
        <main className="min-w-0 flex-1">
          <header className="animate-rise">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">{role} dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold md:text-4xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">{intro}</p>
          </header>
          <div role="note" className="mt-6 flex items-start gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Preview only — sign-in and data are not connected yet. Nothing shown here is real data.</span>
          </div>
          <div className="mt-6 space-y-6 lg:mt-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
