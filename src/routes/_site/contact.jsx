import { createFileRoute } from "@tanstack/react-router";
import ContactBlock from "@/components/site/ContactBlock";
import ContactForm from "@/components/contact/ContactForm";
import { getClinicSettings } from "@/lib/public.functions";
import { SAMPLE_CLINIC } from "@/lib/sampleContent";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_site/contact")({
  loader: () => getClinicSettings(),
  head: () => ({
    meta: [
      { title: "Contact — Ergawan Curative Clinic" },
      {
        name: "description",
        content: "Contact Ergawan Curative Clinic: send a message, call, or find the clinic on the map.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const settings = Route.useLoaderData();
  const { t } = useI18n();
  const clinic = settings || SAMPLE_CLINIC;

  return (
    <div className="pt-8">
      <div className="container-site">
        <span className="eyebrow">{t("contact.eyebrow")}</span>
        <h1 className="display-title mt-4 max-w-2xl text-[clamp(2rem,1.3rem+2.6vw,3.4rem)] leading-[1.08] text-primary">
          {t("contact.title")}
        </h1>
      </div>
      <ContactBlock clinic={clinic}>
        <ContactForm />
      </ContactBlock>
    </div>
  );
}