import { Link } from "@tanstack/react-router";
export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground">व</span>
      Team Vaani
    </Link>
  );
}
