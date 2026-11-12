import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/teacher", label: "Teacher" },
  { to: "/student", label: "Student" },
  { to: "/admin", label: "Admin" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-semibold" }}>{l.label}</Link>
          ))}
          <Button asChild variant="ghost" size="sm"><Link to="/login">Log in</Link></Button>
          <Button asChild size="sm"><Link to="/register">Get started</Link></Button>
        </nav>
        <button className="md:hidden" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-3 border-t border-border px-4 py-4 md:hidden" aria-label="Mobile">
          {links.map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)}>{l.label}</Link>)}
          <Link to="/login" onClick={() => setOpen(false)}>Log in</Link>
          <Button asChild><Link to="/register" onClick={() => setOpen(false)}>Get started</Link></Button>
        </nav>
      )}
    </header>
  );
}
