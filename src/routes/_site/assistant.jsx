import { createFileRoute } from "@tanstack/react-router";
import AssistantChat from "@/components/assistant/AssistantChat";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_site/assistant")({
  head: () => ({
    meta: [
      { title: "ERGAWAN AI — clinic information assistant" },
      {
        name: "description",
        content:
          "Ask ERGAWAN AI about clinic services, how appointments work and general health guidance, in English, Dari or Pashto.",
      },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  const { t } = useI18n();

  return (
    <div className="container-site grid gap-10 py-14 md:grid-cols-[0.85fr_1.15fr] md:gap-16 md:py-20">
      <div>
        <span className="eyebrow">ERGAWAN AI</span>
        <h1 className="display-title mt-4 text-[clamp(2rem,1.3rem+2.4vw,3.2rem)] leading-[1.1] text-primary">
          {t("assistant.title")}
        </h1>
        <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-muted-foreground">{t("assistant.greeting")}</p>

        <div className="mt-8 space-y-4 rounded-3xl border border-border bg-secondary/60 p-6">
          {["assistant.privacy", "assistant.disclaimer"].map((key) => (
            <p key={key} className="text-sm leading-relaxed text-muted-foreground">
              {t(key)}
            </p>
          ))}
        </div>
      </div>

      <div className="h-[min(680px,80vh)]">
        <AssistantChat />
      </div>
    </div>
  );
}