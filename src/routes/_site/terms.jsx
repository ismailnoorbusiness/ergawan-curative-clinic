import { createFileRoute } from "@tanstack/react-router";
import LegalPage from "@/components/site/LegalPage";

export const Route = createFileRoute("/_site/terms")({
  head: () => ({
    meta: [
      { title: "Terms of use — Ergawan Curative Clinic" },
      { name: "description", content: "The terms that apply to appointment requests, information and the AI assistant." },
    ],
  }),
  component: () => <LegalPage document="terms" />,
});