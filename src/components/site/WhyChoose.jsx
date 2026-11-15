import { useI18n } from "@/lib/i18n";

export default function WhyChoose() {
  const { t } = useI18n();
  const items = t("why.items") || [];

  return (
    <section className="container-site py-20 md:py-24">
      <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
        <div>
          <span className="eyebrow">{t("why.eyebrow")}</span>
          <h2 className="display-title mt-4 text-[clamp(1.9rem,1.2rem+2.2vw,3rem)] leading-[1.12] text-primary">
            {t("why.title")}
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">{t("why.intro")}</p>
        </div>

        <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {(Array.isArray(items) ? items : []).map((item, index) => (
            <li key={item.title} className="border-t border-border pt-5">
              <span className="font-mono text-[0.7rem] tracking-[0.2em] text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-heading text-lg leading-snug text-primary">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}