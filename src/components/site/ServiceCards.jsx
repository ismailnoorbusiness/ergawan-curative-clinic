import { Apple, ArrowUpRight, Baby, HeartPulse, ShieldCheck, Stethoscope, Syringe } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

const ICONS = {
  stethoscope: Stethoscope,
  baby: Baby,
  shield: ShieldCheck,
  syringe: Syringe,
  heart: HeartPulse,
  apple: Apple,
};

export default function ServiceCards({ services = [] }) {
  const { t, pick } = useI18n();

  return (
    <section className="container-site py-20 md:py-24" id="services">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <span className="eyebrow">{t("services.eyebrow")}</span>
          <h2 className="display-title mt-4 text-[clamp(1.9rem,1.2rem+2.2vw,3rem)] leading-[1.12] text-primary">
            {t("services.title")}
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{t("services.intro")}</p>
      </div>

      {services.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-dashed border-border p-8 text-sm text-muted-foreground">
          {t("services.empty")}
        </p>
      ) : (
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = ICONS[service.icon] || Stethoscope;
            return (
              <Link
                key={service.slug || service.id}
                to="/services/$slug"
                params={{ slug: service.slug }}
                className="group relative flex flex-col rounded-3xl border border-border bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_60px_-32px_rgba(10,25,47,0.35)]"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary transition-colors duration-500 group-hover:bg-accent group-hover:text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 font-heading text-xl leading-snug text-primary">{pick(service, "name")}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{pick(service, "summary")}</p>
                <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
                  <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {service.duration_minutes} {t("services.duration")}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-primary transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}