import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, School, Users, UserPlus, Languages, Activity, BookOpen, ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SectionCard, EmptyState } from "@/components/common/SectionCard";
import { StatCard } from "@/components/common/StatCard";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { Button } from "@/components/ui/button";

const D = "Teach in your preferred language and manage your classes and students.";
export const Route = createFileRoute("/teacher")({
  head: () => ({ meta: [{ title: "Teacher dashboard — Team Vaani" }, { name: "description", content: D }, { property: "og:title", content: "Teacher dashboard — Team Vaani" }, { property: "og:description", content: D }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});
const nav = [
  { id: "overview", label: "Overview", icon: LayoutGrid }, { id: "classes", label: "My classes", icon: School },
  { id: "students", label: "Students", icon: Users }, { id: "assign", label: "Assign students", icon: UserPlus },
  { id: "language", label: "Language", icon: Languages }, { id: "activity", label: "Activity", icon: Activity },
];

function Page() {
  return (
    <DashboardShell role="Teacher" title="Your classroom" intro={D} nav={nav}>
      <div id="overview" className="grid scroll-mt-24 grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={School} label="Classes" /><StatCard icon={Users} label="Students" />
        <StatCard icon={BookOpen} label="Lessons" /><StatCard icon={Languages} label="Languages in use" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard id="classes" title="My classes" description="Create and view your classes.">
          <EmptyState icon={<School className="h-6 w-6" />} text="Your classes will appear here." />
          <Button className="mt-4" disabled>Create class</Button>
        </SectionCard>
        <SectionCard id="students" title="Student management" description="See the students in each class and their preferred languages.">
          <EmptyState icon={<Users className="h-6 w-6" />} text="Students will appear here once they join." />
        </SectionCard>
      </div>
      <SectionCard id="assign" title="Assign students to a class" status="teacher" description="How it will work: you pick a student, choose a class and confirm. Only teachers can make or change an assignment — students cannot.">
        <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto]" aria-disabled>
          <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground"><span className="font-semibold text-foreground">1. Student</span><br />Choose from students who joined</div>
          <ArrowRight className="mx-auto hidden h-5 w-5 text-muted-foreground md:block" />
          <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground"><span className="font-semibold text-foreground">2. Class</span><br />Choose one of your classes</div>
          <Button disabled>Confirm assignment</Button>
        </div>
      </SectionCard>
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard id="language" title="Teaching language" status="preview" description="The language you teach in. Lessons will be adapted for each student.">
          <LanguageSelector id="teach-lang" label="Teaching language" disabled />
        </SectionCard>
        <SectionCard id="activity" title="Recent activity">
          <EmptyState icon={<Activity className="h-6 w-6" />} text="No activity yet." />
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
