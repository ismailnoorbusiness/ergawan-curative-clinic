import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServiceBySlug } from "@/lib/public.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_site/services/$slug")({
  loader: async ({ params }) => {
    const service = await getServiceBySlug({ data: { slug: params.slug } });
    if (!service) throw notFound();
    return service;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name || "Service"} — Ergawan Curative Clinic` },
      { name: "description", content: loaderData?.summary || "Clinic service at Ergawan Curative Clinic." },
    ],
  }),
  component: ServiceDetail,
});

function ServiceDetail() {
  const service = Route.useLoaderData();
  const { t, pick } = useI18n();

  return (
    <article className="container-site max-w-3xl py-14 md:py-20">
      <Link to="/services" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t("nav.services")}
      </Link>

      <p className="mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <Clock className="h-3.5 w-3.5 text-accent" />
        {service.duration_minutes} {t("services.duration")}
      </p>
      <h1 className="display-title mt-4 text-[clamp(2rem,1.3rem+2.4vw,3.2rem)] leading-[1.1] text-primary">
        {pick(service, "name")}
      </h1>
      <p className="mt-5 text-[1.0625rem] leading-relaxed text-muted-foreground">{pick(service, "summary")}</p>

      {pick(service, "description") && (
        <div className="article-body mt-8">
          {String(pick(service, "description"))
            .split(/\n\s*\n/)
            .map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
        </div>
      )}

      <div className="mt-12 flex flex-col gap-3 rounded-3xl border border-border bg-secondary/60 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-heading text-xl text-primary">{t("booking.title")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("booking.intro")}</p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/book" search={{ service: service.slug }}>
            {t("hero.ctaPrimary")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </Button>
      </div>
    </article>
  );
}