import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { getArticles } from "@/lib/public.functions";
import { formatDate } from "@/lib/clinic";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/knowledge/")({
  loader: () => getArticles(),
  head: () => ({
    meta: [
      { title: "Health library — Ergawan Curative Clinic" },
      {
        name: "description",
        content:
          "Plain-language health education on prevention, maternal and child health, vaccination and healthy living, with sources listed on every article.",
      },
    ],
  }),
  component: KnowledgePage,
});

function KnowledgePage() {
  const articles = Route.useLoaderData() || [];
  const { t, pick, lang } = useI18n();
  const [category, setCategory] = useState("all");

  const categories = ["all", ...Array.from(new Set(articles.map((article) => article.category).filter(Boolean)))];
  const visible = category === "all" ? articles : articles.filter((article) => article.category === category);

  return (
    <div className="container-site py-14 md:py-20">
      <span className="eyebrow">{t("knowledge.eyebrow")}</span>
      <h1 className="display-title mt-4 max-w-2xl text-[clamp(2rem,1.3rem+2.6vw,3.4rem)] leading-[1.08] text-primary">
        {t("knowledge.title")}
      </h1>
      <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-muted-foreground">{t("knowledge.intro")}</p>

      <div className="mt-10 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={cn(
              "rounded-full border px-4 py-2 text-xs transition-colors",
              category === item
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-accent hover:text-foreground",
            )}
          >
            {item === "all" ? t("common.viewAll") : item}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {visible.map((article) => (
          <Link
            key={article.slug}
            to="/knowledge/$slug"
            params={{ slug: article.slug }}
            className="group flex flex-col rounded-3xl border border-border bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_60px_-32px_rgba(10,25,47,0.3)]"
          >
            <div className="flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
              {article.category}
              <span className="text-border">/</span>
              {formatDate(article.published_date, lang)}
            </div>
            <h2 className="mt-4 font-heading text-xl leading-snug text-primary">{pick(article, "title")}</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{pick(article, "summary")}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              {t("knowledge.readMore")}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1 rtl:rotate-180" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}