import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, Languages, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ROLES } from "@/lib/roles";
import { LANGUAGES } from "@/lib/languages";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Team Vaani — Learn in your own language" }, { name: "description", content: "A multilingual education platform where teachers teach in their language and students learn in theirs." }, { property: "og:title", content: "Team Vaani — Learn in your own language" }, { property: "og:description", content: "A multilingual education platform where teachers teach in their language and students learn in theirs." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Index,
});

const features = [
  { icon: Mic, title: "Speak to learn", text: "Voice input in regional languages." },
  { icon: Languages, title: "Translated lessons", text: "Lessons delivered in each student's language." },
  { icon: Volume2, title: "Listen along", text: "Lessons read aloud for every learner." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="bg-hero text-hero-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">वाणी · Vaani means voice</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">Teach in your language. Learn in theirs.</h1>
          <p className="mt-5 max-w-xl text-lg opacity-85">Team Vaani brings classrooms together across languages, so no student is left behind by the words on the board.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary"><Link to="/register">Get started</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-hero-foreground/40 bg-transparent text-hero-foreground hover:bg-hero-foreground/10"><Link to="/login">Log in</Link></Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {LANGUAGES.map((l) => <span key={l.code} className="rounded-full border border-hero-foreground/25 px-3 py-1 text-sm">{l.native}</span>)}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-semibold">Built for multilingual classrooms</h2>
        <p className="mt-2 text-sm text-muted-foreground">These features are planned and not available yet.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
              <p className="mt-1 text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-muted">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
          {ROLES.map((r) => (
            <Link key={r.id} to={r.path} className="rounded-xl border border-border bg-card p-6 transition hover:border-primary">
              <h3 className="text-xl font-semibold">For {r.label.toLowerCase()}s</h3>
              <p className="mt-1 text-muted-foreground">{r.description}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-primary">View dashboard →</span>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
