import { createFileRoute } from "@tanstack/react-router";
import { School, BookOpen, Languages, TrendingUp, Mic, Volume2, Lock } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SectionCard, EmptyState } from "@/components/common/SectionCard";
import { FeatureCard } from "@/components/common/FeatureCard";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { Progress } from "@/components/ui/progress";

const D = "Learn in your regional language. Your class is set by your teacher.";
export const Route = createFileRoute("/student")({
  head: () => ({ meta: [{ title: "Student dashboard — Team Vaani" }, { name: "description", content: D }, { property: "og:title", content: "Student dashboard — Team Vaani" }, { property: "og:description", content: D }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});
const nav = [
  { id: "class", label: "My class", icon: School }, { id: "materials", label: "Materials", icon: BookOpen },
  { id: "language", label: "Language", icon: Languages }, { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "voice", label: "Voice & listen", icon: Mic },
];

function Page() {
  return (
    <DashboardShell role="Student" title="Your learning space" intro={D} nav={nav}>
      <SectionCard id="class" title="My class" status="teacher" description="Your teacher assigns your class. Once confirmed, only your teacher can change it.">
        <div className="flex items-center gap-3 rounded-xl bg-muted p-4 text-sm text-muted-foreground"><Lock className="h-5 w-5 shrink-0" />Waiting for your teacher to assign a class.</div>
      </SectionCard>
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard id="materials" title="Learning materials" description="Lessons from your teacher, in your language.">
          <EmptyState icon={<BookOpen className="h-6 w-6" />} text="Lessons will appear here after you join a class." />
        </SectionCard>
        <SectionCard id="language" title="My language" status="preview" description="Lessons will be shown and read aloud in this language.">
          <LanguageSelector id="learn-lang" label="Learning language" disabled />
        </SectionCard>
      </div>
      <SectionCard id="progress" title="Learning progress" description="Track the lessons you have completed.">
        <Progress value={0} aria-label="Progress not available" />
        <p className="mt-2 text-xs text-muted-foreground">No progress recorded yet.</p>
      </SectionCard>
      <div id="voice" className="grid scroll-mt-24 gap-5 md:grid-cols-2">
        <FeatureCard icon={Mic} title="Ask by voice" text="Speak your questions in your own language." />
        <FeatureCard icon={Volume2} title="Listen to lessons" text="Have any lesson read aloud in your language." />
      </div>
    </DashboardShell>
  );
}
