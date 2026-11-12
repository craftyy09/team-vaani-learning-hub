import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";

export function DashboardShell({ role, title, intro, children }: { role: string; title: string; intro: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">{role} dashboard</p>
        <h1 className="mt-1 text-3xl font-semibold md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{intro}</p>
        <div className="mt-6 rounded-lg bg-secondary px-4 py-3 text-sm text-secondary-foreground">
          Preview only — sign-in and data are not connected yet.
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      </main>
    </div>
  );
}
