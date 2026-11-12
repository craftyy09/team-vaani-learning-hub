import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/common/AuthForm";
export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — Team Vaani" }, { name: "description", content: "Log in to Team Vaani, the multilingual learning platform." }, { property: "og:title", content: "Log in — Team Vaani" }, { property: "og:description", content: "Log in to Team Vaani, the multilingual learning platform." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <AuthForm mode="login" />,
});
