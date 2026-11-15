import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactMap from "@/components/site/ContactMap";
import { useI18n } from "@/lib/i18n";
import { isPlaceholder, telHref, whatsappHref } from "@/lib/clinic";

export default function ContactBlock({ clinic, children }) {
  const { t } = useI18n();
  const phoneReady = !isPlaceholder(clinic?.phone);
  const whatsappReady = !isPlaceholder(clinic?.whatsapp);
  const wa = whatsappHref(clinic?.whatsapp, "Hello Ergawan Curative Clinic, I would like to ask a question.");

  return (
    <section className="container-site py-20 md:py-24" id="contact">
      <div className="grid gap-12 md:grid-cols-2 md:gap-14">
        <div>
          <span className="eyebrow">{t("contact.eyebrow")}</span>
          <h2 className="display-title mt-4 text-[clamp(1.9rem,1.2rem+2.2vw,3rem)] leading-[1.12] text-primary">
            {t("contact.title")}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{t("contact.intro")}</p>

          <dl className="mt-9 space-y-5">
            <div className="flex items-start gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">{t("contact.address")}</dt>
                <dd className="mt-1 text-sm text-foreground">{clinic?.address}</dd>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">{t("contact.hours")}</dt>
                <dd className="mt-1 text-sm text-foreground">{clinic?.hours}</dd>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                <Phone className="h-4 w-4" />
              </span>
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">{t("contact.phone")}</dt>
                <dd className="mt-1 text-sm text-foreground">
                  {phoneReady ? (
                    <a href={telHref(clinic.phone)} className="hover:text-accent" dir="ltr">
                      {clinic.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{clinic?.phone || "—"}</span>
                  )}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">{t("contact.email")}</dt>
                <dd className="mt-1 text-sm text-foreground">
                  <a href={`mailto:${clinic?.email}`} className="hover:text-accent">
                    {clinic?.email}
                  </a>
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link to="/contact">
                {t("contact.message")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
            {whatsappReady ? (
              <Button asChild variant="outline" className="rounded-full border-primary/20">
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 text-accent" />
                  {t("contact.whatsapp")}
                </a>
              </Button>
            ) : (
              <Button variant="outline" disabled className="rounded-full border-primary/20">
                <MessageCircle className="h-4 w-4 text-accent" />
                {t("contact.whatsapp")}
              </Button>
            )}
          </div>

          {whatsappReady ? null : (
            <p className="mt-4 max-w-md rounded-xl bg-secondary px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              {t("contact.whatsappMissing")}
            </p>
          )}

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">{t("contact.sampleNote")}</p>
        </div>

        <div className="flex flex-col gap-4">
          {children}
          <ContactMap clinic={clinic} />
          <p className="text-xs text-muted-foreground">{t("contact.mapNote")}</p>
        </div>
      </div>
    </section>
  );
}