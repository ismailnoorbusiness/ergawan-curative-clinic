import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n";

export default function FaqSection() {
  const { t } = useI18n();
  const items = t("faq.items") || [];

  return (
    <section className="container-site py-20 md:py-24" id="faq">
      <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <div>
          <span className="eyebrow">{t("faq.eyebrow")}</span>
          <h2 className="display-title mt-4 text-[clamp(1.9rem,1.2rem+2.2vw,3rem)] leading-[1.12] text-primary">
            {t("faq.title")}
          </h2>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">{t("faq.intro")}</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {(Array.isArray(items) ? items : []).map((item, index) => (
            <AccordionItem key={item.q} value={`item-${index}`} className="border-border">
              <AccordionTrigger className="py-5 text-start font-heading text-lg leading-snug text-primary hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-sm leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}