import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/common/AuthForm";
export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Team Vaani" }, { name: "description", content: "Join Team Vaani as a teacher or student." }, { property: "og:title", content: "Create account — Team Vaani" }, { property: "og:description", content: "Join Team Vaani as a teacher or student." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <AuthForm mode="register" />,
});
