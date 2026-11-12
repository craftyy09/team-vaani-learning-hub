import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./MobileNav";
import { NAV_LINKS } from "./nav";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground" activeProps={{ className: "text-foreground font-semibold bg-muted" }}>{l.label}</Link>
          ))}
          <span className="mx-2 h-5 w-px bg-border" aria-hidden />
          <Button asChild variant="ghost" size="sm"><Link to="/login">Log in</Link></Button>
          <Button asChild size="sm"><Link to="/register">Get started</Link></Button>
        </nav>
        <button className="rounded-lg p-2 hover:bg-muted md:hidden" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && <MobileNav onNavigate={() => setOpen(false)} />}
    </header>
  );
}
