import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/common/Logo";
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">An education platform where teachers teach in their language and students learn in theirs.</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Platform</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/teacher" className="hover:text-foreground">For teachers</Link></li>
            <li><Link to="/student" className="hover:text-foreground">For students</Link></li>
            <li><Link to="/admin" className="hover:text-foreground">For admins</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Account</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/login" className="hover:text-foreground">Log in</Link></li>
            <li><Link to="/register" className="hover:text-foreground">Create account</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-border py-5 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Team Vaani — learning in every language.</p>
    </footer>
  );
}
