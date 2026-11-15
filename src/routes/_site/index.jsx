import { createFileRoute } from "@tanstack/react-router";
import Hero from "@/components/site/Hero";
import ServiceCards from "@/components/site/ServiceCards";
import AboutSection from "@/components/site/AboutSection";
import WhyChoose from "@/components/site/WhyChoose";
import KnowledgePreview from "@/components/site/KnowledgePreview";
import FaqSection from "@/components/site/FaqSection";
import ContactBlock from "@/components/site/ContactBlock";
import { getArticles, getClinicSettings, getServices } from "@/lib/public.functions";
import { SAMPLE_CLINIC, SAMPLE_SERVICES } from "@/lib/sampleContent";

export const Route = createFileRoute("/_site/")({
  loader: async () => {
    const [services, articles, settings] = await Promise.all([getServices(), getArticles(), getClinicSettings()]);
    return { services, articles, settings };
  },
  head: () => ({
    meta: [
      { title: "Ergawan Curative Clinic — Healthcare that begins with listening" },
      {
        name: "description",
        content:
          "Ergawan Curative Clinic: considered consultation, preventive care and family health support in English, Dari and Pashto, with a 24/7 AI assistant and a private patient portal.",
      },
      { property: "og:title", content: "Ergawan Curative Clinic" },
      {
        property: "og:description",
        content: "A premium, multilingual healthcare platform with appointment requests, a patient portal and ERGAWAN AI.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { services, articles, settings } = Route.useLoaderData();

  return (
    <>
      <Hero />
      <ServiceCards services={services?.length ? services : SAMPLE_SERVICES} />
      <AboutSection />
      <WhyChoose />
      <KnowledgePreview articles={(articles || []).slice(0, 3)} />
      <FaqSection />
      <ContactBlock clinic={settings || SAMPLE_CLINIC} />
    </>
  );
}