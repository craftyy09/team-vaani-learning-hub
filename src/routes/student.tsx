import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PlaceholderCard } from "@/components/common/PlaceholderCard";
export const Route = createFileRoute("/student")({
  head: () => ({ meta: [{ title: "Student dashboard — Team Vaani" }, { name: "description", content: "Learn in your regional language. Your class is set by your teacher." }, { property: "og:title", content: "Student dashboard — Team Vaani" }, { property: "og:description", content: "Learn in your regional language. Your class is set by your teacher." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});
const cards = [["My class","Your class appears here once your teacher confirms it."],["Lessons","Read and listen to lessons in your language."],["Ask by voice","Speak your questions in your language."],["Progress","Track what you have learned."]];
function Page() {
  return (
    <DashboardShell role="Student" title="Your learning space" intro="Learn in your regional language. Your class is set by your teacher.">
      {cards.map(([t, d]) => <PlaceholderCard key={t} title={t} description={d} />)}
    </DashboardShell>
  );
}
