import { Image } from "@/components/ui/image";
import { useI18n } from "@/lib/i18n";

export default function AboutSection() {
  const { t } = useI18n();
  const stats = [
    { value: t("about.stat1v"), label: t("about.stat1l") },
    { value: t("about.stat2v"), label: t("about.stat2l") },
    { value: t("about.stat3v"), label: t("about.stat3l") },
  ];

  return (
    <section className="border-y border-border bg-secondary/60" id="about">
      <div className="container-site grid items-center gap-12 py-20 md:grid-cols-2 md:gap-16 md:py-24">
        <div className="relative">
          <div className="overflow-hidden rounded-[2rem] bg-primary">
            <Image
              src="https://media.base44.com/images/public/6aef8119b05db231bc90d6cf/00600199c_generated_image.png"
              alt={t("about.imgAlt")}
              className="aspect-[4/5] w-full"
              fittingType="fill"
            />
          </div>
          <div className="absolute -bottom-6 end-6 hidden rounded-2xl border border-border bg-background px-5 py-4 shadow-sm md:block">
            <p className="font-heading text-2xl text-primary">{t("about.stat2v")}</p>
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">{t("about.stat2l")}</p>
          </div>
        </div>

        <div>
          <span className="eyebrow">{t("about.eyebrow")}</span>
          <h2 className="display-title mt-4 text-[clamp(1.9rem,1.2rem+2.2vw,3rem)] leading-[1.12] text-primary">
            {t("about.title")}
          </h2>
          <p className="mt-6 text-[1.0625rem] leading-relaxed text-muted-foreground">{t("about.p1")}</p>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted-foreground">{t("about.p2")}</p>

          <dl className="mt-9 grid grid-cols-3 gap-4 border-t border-border pt-7">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="font-heading text-2xl text-primary md:text-3xl">{stat.value}</dt>
                <dd className="mt-1 text-[0.7rem] uppercase leading-snug tracking-[0.14em] text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}