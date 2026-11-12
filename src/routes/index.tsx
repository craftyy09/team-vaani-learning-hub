import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, Languages, Volume2, BookOpenText, GraduationCap, Presentation, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FeatureCard } from "@/components/common/FeatureCard";
import { LanguageStrip } from "@/components/common/LanguageSelector";

const TITLE = "Team Vaani — Learn in your language. Teach without barriers.";
const DESC = "A multilingual education platform where teachers teach in their language and students learn in theirs.";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: TITLE }, { name: "description", content: DESC }, { property: "og:title", content: TITLE }, { property: "og:description", content: DESC }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Index,
});

const features = [
  { icon: BookOpenText, title: "Multilingual learning", text: "Every lesson available in the student's own regional language." },
  { icon: Mic, title: "Speech recognition", text: "Students and teachers speak naturally; their words become text." },
  { icon: Languages, title: "Translation", text: "Lessons written once by the teacher, translated for each learner." },
  { icon: Volume2, title: "Read-aloud", text: "Lessons read aloud so every student can listen along." },
];
const steps = [
  { n: "01", title: "Teacher creates a lesson", text: "Write or record it in the language you teach best." },
  { n: "02", title: "Vaani adapts it", text: "The lesson is prepared in each student's preferred language." },
  { n: "03", title: "Students learn their way", text: "Read, listen and ask questions in their own language." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="bg-hero text-hero-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <p className="animate-rise text-sm font-semibold uppercase tracking-widest text-accent">वाणी · Vaani means voice</p>
          <h1 className="animate-rise mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] md:text-6xl [animation-delay:80ms]">Learn in your language. Teach without barriers.</h1>
          <p className="animate-rise mt-5 max-w-xl text-lg opacity-85 [animation-delay:160ms]">Team Vaani brings classrooms together across languages, so no student is left behind by the words on the board.</p>
          <div className="animate-rise mt-8 flex flex-wrap gap-3 [animation-delay:240ms]">
            <Button asChild size="lg" variant="secondary"><Link to="/register">Get started <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline" className="border-hero-foreground/40 bg-transparent text-hero-foreground hover:bg-hero-foreground/10 hover:text-hero-foreground"><Link to="/login">Log in</Link></Button>
          </div>
          <LanguageStrip className="mt-12 opacity-90" />
        </div>
      </section>

      <section className="mx-auto -mt-10 grid max-w-6xl gap-4 px-4 md:grid-cols-2">
        {[{ to: "/teacher" as const, icon: Presentation, title: "I'm a teacher", text: "Teach in your preferred language and manage your classes and students." },
          { to: "/student" as const, icon: GraduationCap, title: "I'm a student", text: "Learn in your regional language. Your teacher assigns your class." }].map((e) => (
          <Link key={e.to} to={e.to} className="lift group flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft hover:border-primary">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><e.icon className="h-6 w-6" /></span>
            <span>
              <span className="block font-display text-xl font-semibold">{e.title}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{e.text}</span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">Preview dashboard <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </span>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">How it works</p>
        <h2 className="mt-2 text-3xl font-semibold md:text-4xl">One lesson, every language</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="border-t-2 border-primary pt-5">
              <span className="font-display text-sm font-semibold text-accent-foreground/70">{s.n}</span>
              <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
              <p className="mt-1 text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-muted">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-3xl font-semibold md:text-4xl">Built for multilingual classrooms</h2>
          <p className="mt-2 text-muted-foreground">The AI features below are planned and are not available yet.</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h2 className="text-3xl font-semibold md:text-4xl">Ready when your classroom is</h2>
        <p className="mx-auto mt-2 max-w-lg text-muted-foreground">Create an account as a teacher or student. Accounts open soon.</p>
        <Button asChild size="lg" className="mt-6"><Link to="/register">Create an account</Link></Button>
      </section>
      <SiteFooter />
    </div>
  );
}
