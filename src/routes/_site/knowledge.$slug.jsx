import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import ArticleBody from "@/components/knowledge/ArticleBody";
import { getArticleBySlug } from "@/lib/public.functions";
import { formatDate } from "@/lib/clinic";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_site/knowledge/$slug")({
  loader: async ({ params }) => {
    const article = await getArticleBySlug({ data: { slug: params.slug } });
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title || "Article"} — Ergawan health library` },
      { name: "description", content: loaderData?.summary || "Health education from Ergawan Curative Clinic." },
    ],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  const article = Route.useLoaderData();
  const { t, pick, lang } = useI18n();

  return (
    <article className="container-site max-w-3xl py-14 md:py-20">
      <Link to="/knowledge" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t("nav.knowledge")}
      </Link>

      <p className="mt-8 text-xs uppercase tracking-[0.18em] text-muted-foreground">{article.category}</p>
      <h1 className="display-title mt-3 text-[clamp(1.9rem,1.3rem+2.2vw,2.9rem)] leading-[1.12] text-primary">
        {pick(article, "title")}
      </h1>
      <p className="mt-5 text-[1.0625rem] leading-relaxed text-muted-foreground">{pick(article, "summary")}</p>

      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-y border-border py-4 text-xs text-muted-foreground">
        <span>
          {t("knowledge.published")}: {formatDate(article.published_date, lang)}
        </span>
        {article.reviewed_by && (
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            {t("knowledge.reviewed")}: {article.reviewed_by}
            {article.reviewed_date ? ` · ${formatDate(article.reviewed_date, lang)}` : ""}
          </span>
        )}
      </div>

      <div className="mt-8">
        <ArticleBody body={pick(article, "body")} />
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-secondary/60 p-6 text-sm leading-relaxed text-muted-foreground">
        {t("footer.disclaimer")}
      </div>

      {(article.source_name || article.source_url) && (
        <p className="mt-6 text-sm text-muted-foreground">
          Source:{" "}
          {article.source_url ? (
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary underline"
            >
              {article.source_name || article.source_url}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            article.source_name
          )}
        </p>
      )}
    </article>
  );
}