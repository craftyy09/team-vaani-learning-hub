import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, Presentation, GraduationCap, School, Building2, Settings, Users, Languages } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SectionCard, EmptyState } from "@/components/common/SectionCard";
import { StatCard } from "@/components/common/StatCard";
import { Switch } from "@/components/ui/switch";
import { LANGUAGES } from "@/lib/languages";

const D = "Manage users, roles, classes and languages across Team Vaani.";
export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin dashboard — Team Vaani" }, { name: "description", content: D }, { property: "og:title", content: "Admin dashboard — Team Vaani" }, { property: "og:description", content: D }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});
const nav = [
  { id: "overview", label: "Overview", icon: LayoutGrid }, { id: "teachers", label: "Teachers", icon: Presentation },
  { id: "students", label: "Students", icon: GraduationCap }, { id: "classes", label: "Classes", icon: School },
  { id: "schools", label: "Schools", icon: Building2 }, { id: "config", label: "Configuration", icon: Settings },
];

function Page() {
  return (
    <DashboardShell role="Admin" title="Platform overview" intro={D} nav={nav}>
      <div id="overview" className="grid scroll-mt-24 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Presentation} label="Teachers" /><StatCard icon={GraduationCap} label="Students" />
        <StatCard icon={School} label="Classes" /><StatCard icon={Building2} label="Schools" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard id="teachers" title="Teacher management" description="Approve teachers and manage their access.">
          <EmptyState icon={<Users className="h-6 w-6" />} text="No teachers yet." />
        </SectionCard>
        <SectionCard id="students" title="Student management" description="View students and the classes their teachers assigned.">
          <EmptyState icon={<Users className="h-6 w-6" />} text="No students yet." />
        </SectionCard>
        <SectionCard id="classes" title="Classes" description="Oversee every class across the platform.">
          <EmptyState icon={<School className="h-6 w-6" />} text="No classes yet." />
        </SectionCard>
        <SectionCard id="schools" title="Schools" description="Group classes and teachers by school.">
          <EmptyState icon={<Building2 className="h-6 w-6" />} text="No schools yet." />
        </SectionCard>
      </div>
      <SectionCard id="config" title="Platform configuration" status="preview" description="Choose which languages are offered. Settings can't be saved yet.">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {LANGUAGES.map((l) => (
            <li key={l.code} className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm">
              <span className="flex items-center gap-2"><Languages className="h-4 w-4 text-muted-foreground" />{l.native}</span>
              <Switch disabled aria-label={`Offer ${l.name}`} />
            </li>
          ))}
        </ul>
      </SectionCard>
    </DashboardShell>
  );
}
