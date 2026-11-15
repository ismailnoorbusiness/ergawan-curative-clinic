import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import AboutSection from "@/components/site/AboutSection";
import WhyChoose from "@/components/site/WhyChoose";
import FeedbackForm from "@/components/contact/FeedbackForm";
import { getClinicSettings, getPublishedFeedback } from "@/lib/public.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_site/about")({
  loader: async () => {
    const [settings, feedback] = await Promise.all([getClinicSettings(), getPublishedFeedback()]);
    return { settings, feedback };
  },
  head: () => ({
    meta: [
      { title: "About — Ergawan Curative Clinic" },
      {
        name: "description",
        content:
          "A calmer standard of care: unhurried consultation, plain explanations and a private digital layer for appointments and messages.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { feedback } = Route.useLoaderData() || {};
  const { t } = useI18n();

  return (
    <>
      <div className="container-site pt-12">
        <span className="eyebrow">{t("about.eyebrow")}</span>
        <h1 className="display-title mt-4 max-w-3xl text-[clamp(2.1rem,1.3rem+3vw,3.6rem)] leading-[1.06] text-primary">
          {t("about.title")}
        </h1>
      </div>

      <AboutSection />
      <WhyChoose />

      {Array.isArray(feedback) && feedback.length > 0 && (
        <section className="container-site pb-4">
          <span className="eyebrow">Patient feedback</span>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {feedback.slice(0, 3).map((item) => (
              <figure key={item.id} className="rounded-3xl border border-border bg-card p-6">
                <Quote className="h-5 w-5 text-accent" />
                <blockquote className="mt-4 text-sm leading-relaxed text-foreground">{item.comment}</blockquote>
                <figcaption className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-xs text-muted-foreground">
                  <span>{item.patient_name || "Patient"}</span>
                  <span className="flex gap-0.5" aria-label={`${item.rating} of 5`}>
                    {Array.from({ length: Math.round(item.rating || 0) }).map((_, index) => (
                      <Star key={index} className="h-3 w-3 fill-accent text-accent" />
                    ))}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="container-site grid gap-6 pb-4 md:grid-cols-2">
        <FeedbackForm />
        <div className="rounded-3xl border border-border bg-secondary/60 p-7">
          <h2 className="font-heading text-xl text-primary">{t("faq.title")}</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {(t("faq.items") || []).map((item) => (
              <li key={item.q} className="border-b border-border/60 pb-3 last:border-0">
                <p className="font-medium text-foreground">{item.q}</p>
                <p className="mt-1 leading-relaxed">{item.a}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-site py-20">
        <div className="flex flex-col gap-6 rounded-[2rem] bg-primary p-8 text-primary-foreground md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="display-title text-2xl md:text-3xl">{t("booking.title")}</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-primary-foreground/70">{t("booking.intro")}</p>
          </div>
          <Button asChild size="lg" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/book">
              {t("hero.ctaPrimary")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}