import { createFileRoute } from "@tanstack/react-router";
import BookingForm from "@/components/booking/BookingForm";
import { getServices } from "@/lib/public.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_site/book")({
  validateSearch: (search) => ({
    service: typeof search.service === "string" ? search.service : undefined,
  }),
  loader: () => getServices(),
  head: () => ({
    meta: [
      { title: "Request an appointment — Ergawan Curative Clinic" },
      {
        name: "description",
        content:
          "Request an appointment at Ergawan Curative Clinic: choose a service, a preferred date and time, and receive a tracking code.",
      },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const services = Route.useLoaderData() || [];
  const { service } = Route.useSearch();
  const { t } = useI18n();

  return (
    <div className="container-site py-14 md:py-20">
      <span className="eyebrow">{t("booking.eyebrow")}</span>
      <h1 className="display-title mt-4 max-w-2xl text-[clamp(2rem,1.3rem+2.6vw,3.4rem)] leading-[1.08] text-primary">
        {t("booking.title")}
      </h1>
      <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-muted-foreground">{t("booking.intro")}</p>

      <div className="mt-10">
        <BookingForm services={services} initialService={service || ""} />
      </div>
    </div>
  );
}