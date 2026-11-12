import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PlaceholderCard } from "@/components/common/PlaceholderCard";
export const Route = createFileRoute("/teacher")({
  head: () => ({ meta: [{ title: "Teacher dashboard — Team Vaani" }, { name: "description", content: "Teach in your preferred language and manage your classes and students." }, { property: "og:title", content: "Teacher dashboard — Team Vaani" }, { property: "og:description", content: "Teach in your preferred language and manage your classes and students." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});
const cards: [string, string][] = [["My classes","Create and view your classes."],["Assign students","Assign students to a class. Students cannot change a confirmed assignment."],["Lessons","Record or write lessons in your language."],["Translations","Lessons will be translated for each student."]];
function Page() {
  return (
    <DashboardShell role="Teacher" title="Your classroom" intro="Teach in your preferred language and manage your classes and students.">
      {cards.map(([t, d]) => <PlaceholderCard key={t} title={t} description={d} />)}
    </DashboardShell>
  );
}
