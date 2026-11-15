import { createFileRoute } from "@tanstack/react-router";
import ServiceCards from "@/components/site/ServiceCards";
import { getServices } from "@/lib/public.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_site/services/")({
  loader: () => getServices(),
  head: () => ({
    meta: [
      { title: "Services — Ergawan Curative Clinic" },
      {
        name: "description",
        content:
          "Consultation, maternal and child health, preventive checks, vaccination support, chronic follow-up and nutrition guidance at Ergawan Curative Clinic.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const services = Route.useLoaderData();
  const { t } = useI18n();

  return (
    <div className="pt-6">
      <div className="container-site pt-10">
        <span className="eyebrow">{t("services.eyebrow")}</span>
        <h1 className="display-title mt-4 max-w-2xl text-[clamp(2rem,1.3rem+2.6vw,3.4rem)] leading-[1.08] text-primary">
          {t("services.title")}
        </h1>
      </div>
      <ServiceCards services={services || []} />
    </div>
  );
}