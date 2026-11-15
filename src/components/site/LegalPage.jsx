import { LEGAL } from "@/lib/legalContent";
import { useI18n } from "@/lib/i18n";

export default function LegalPage({ document }) {
  const { lang } = useI18n();
  const content = LEGAL[document][lang] || LEGAL[document].en;

  return (
    <div className="container-site max-w-3xl py-14 md:py-20">
      <h1 className="display-title text-[clamp(2rem,1.3rem+2.4vw,3rem)] leading-[1.08] text-primary">{content.title}</h1>
      <p className="mt-5 text-[1.0625rem] leading-relaxed text-muted-foreground">{content.intro}</p>

      <div className="mt-10 space-y-8">
        {content.sections.map((section) => (
          <section key={section.h}>
            <h2 className="font-heading text-xl text-primary">{section.h}</h2>
            <p className="mt-2 text-[1.0625rem] leading-relaxed text-muted-foreground">{section.p}</p>
          </section>
        ))}
      </div>

      <p className="mt-12 rounded-2xl border border-border bg-secondary/60 p-5 text-xs leading-relaxed text-muted-foreground">
        Ergawan Curative Clinic · Last updated 2027
      </p>
    </div>
  );
}