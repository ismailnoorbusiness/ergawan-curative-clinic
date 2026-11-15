import { createFileRoute } from "@tanstack/react-router";
import LegalPage from "@/components/site/LegalPage";

export const Route = createFileRoute("/_site/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — Ergawan Curative Clinic" },
      { name: "description", content: "What the clinic website stores, who can see it, and what not to send." },
    ],
  }),
  component: () => <LegalPage document="privacy" />,
});