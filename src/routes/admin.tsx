import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PlaceholderCard } from "@/components/common/PlaceholderCard";
export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin dashboard — Team Vaani" }, { name: "description", content: "Manage users, roles, classes and languages across Team Vaani." }, { property: "og:title", content: "Admin dashboard — Team Vaani" }, { property: "og:description", content: "Manage users, roles, classes and languages across Team Vaani." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});
const cards = [["Users & roles","Manage teacher, student and admin accounts."],["Classes","Oversee all classes and assignments."],["Languages","Choose which languages are offered."],["Reports","Platform usage at a glance."]];
function Page() {
  return (
    <DashboardShell role="Admin" title="Platform overview" intro="Manage users, roles, classes and languages across Team Vaani.">
      {cards.map(([t, d]) => <PlaceholderCard key={t} title={t} description={d} />)}
    </DashboardShell>
  );
}
