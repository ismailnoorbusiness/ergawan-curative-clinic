import { createFileRoute } from "@tanstack/react-router";
import TrackPanel from "@/components/booking/TrackPanel";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_site/track")({
  head: () => ({
    meta: [
      { title: "Track an appointment — Ergawan Curative Clinic" },
      {
        name: "description",
        content: "Follow an appointment request with your tracking code and email, or cancel it securely.",
      },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { t } = useI18n();
  return (
    <div className="container-site py-14 md:py-20">
      <span className="eyebrow">{t("track.eyebrow")}</span>
      <h1 className="display-title mt-4 text-[clamp(2rem,1.3rem+2.6vw,3.2rem)] leading-[1.08] text-primary">
        {t("track.title")}
      </h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">{t("track.intro")}</p>
      <div className="mt-10">
        <TrackPanel />
      </div>
    </div>
  );
}