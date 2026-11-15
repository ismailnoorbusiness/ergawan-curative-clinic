import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/clinic";

export default function KnowledgePreview({ articles = [] }) {
  const { t, pick, lang } = useI18n();

  return (
    <section className="border-y border-border bg-secondary/60">
      <div className="container-site py-20 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1fr_1.25fr] md:gap-16">
          <div className="md:sticky md:top-28 md:self-start">
            <span className="eyebrow">{t("knowledge.eyebrow")}</span>
            <h2 className="display-title mt-4 text-[clamp(1.9rem,1.2rem+2.2vw,3rem)] leading-[1.12] text-primary">
              {t("knowledge.title")}
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">{t("knowledge.intro")}</p>
            <div className="mt-8 overflow-hidden rounded-3xl">
              <Image
                src="https://media.base44.com/images/public/6aef8119b05db231bc90d6cf/ecb77833f_generated_image.png"
                alt={t("knowledge.title")}
                className="aspect-[16/10] w-full"
                fittingType="fill"
              />
            </div>
            <Link
              to="/knowledge"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-accent"
            >
              {t("common.viewAll")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>

          <ul className="divide-y divide-border">
            {articles.map((article) => (
              <li key={article.slug || article.id}>
                <Link
                  to="/knowledge/$slug"
                  params={{ slug: article.slug }}
                  className="group flex flex-col gap-2 py-7 first:pt-0"
                >
                  <div className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5 text-accent" />
                    {article.category}
                    <span className="text-border">/</span>
                    {formatDate(article.published_date, lang)}
                  </div>
                  <h3 className="font-heading text-xl leading-snug text-primary transition-colors group-hover:text-accent md:text-[1.4rem]">
                    {pick(article, "title")}
                  </h3>
                  <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{pick(article, "summary")}</p>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                    {t("knowledge.readMore")}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1 rtl:rotate-180" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}