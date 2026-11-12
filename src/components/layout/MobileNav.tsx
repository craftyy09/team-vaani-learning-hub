import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "./nav";
export function MobileNav({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav className="animate-rise flex flex-col gap-1 border-t border-border px-4 py-4 md:hidden" aria-label="Mobile">
      {NAV_LINKS.map((l) => <Link key={l.to} to={l.to} onClick={onNavigate} className="rounded-lg px-3 py-2 hover:bg-muted" activeProps={{ className: "bg-muted font-semibold" }}>{l.label}</Link>)}
      <Link to="/login" onClick={onNavigate} className="rounded-lg px-3 py-2 hover:bg-muted">Log in</Link>
      <Button asChild className="mt-2"><Link to="/register" onClick={onNavigate}>Get started</Link></Button>
    </nav>
  );
}
