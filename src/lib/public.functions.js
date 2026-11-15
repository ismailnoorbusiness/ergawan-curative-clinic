import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getClinicSettings = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const base44 = context.getBase44();
  const items = await base44.entities.ClinicSettings.list("-created_date", 1);
  const record = Array.isArray(items) ? items[0] : items?.items?.[0];
  return record || null;
});

export const getServices = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const base44 = context.getBase44();
  const page = await base44.entities.Service.filter({ active: true }, { sort: "order", limit: 50 });
  return page.items || [];
});

export const getServiceBySlug = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1).max(120) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const page = await base44.entities.Service.filter({ slug: data.slug }, { limit: 1 });
    return page.items?.[0] || null;
  });

export const getArticles = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const base44 = context.getBase44();
  const page = await base44.entities.Article.filter({}, { sort: "-published_date", limit: 60 });
  return page.items || [];
});

export const getArticleBySlug = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1).max(120) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const page = await base44.entities.Article.filter({ slug: data.slug }, { limit: 1 });
    return page.items?.[0] || null;
  });

export const getPublishedFeedback = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const base44 = context.getBase44();
  const page = await base44.entities.Feedback.filter({ published: true }, { sort: "-created_date", limit: 6 });
  return page.items || [];
});

/** Keyword search across the published catalogue — no AI credits, instant results. */
export const smartSearch = createServerFn({ method: "GET" })
  .validator(z.object({ q: z.string().max(120).optional() }))
  .handler(async ({ data, context }) => {
    const query = (data.q || "").trim().toLowerCase();
    if (query.length < 2) return [];
    const base44 = context.getBase44();
    const [services, articles] = await Promise.all([
      base44.entities.Service.filter({ active: true }, { limit: 50 }),
      base44.entities.Article.filter({}, { sort: "-published_date", limit: 60 }),
    ]);
    const tokens = query.split(/\s+/).filter((token) => token.length > 2);
    const score = (haystack) => {
      const text = haystack.toLowerCase();
      if (text.includes(query)) return 5;
      return tokens.reduce((total, token) => (text.includes(token) ? total + 2 : total), 0);
    };

    const results = [
      ...(services.items || []).map((service) => ({
        type: "service",
        slug: service.slug,
        title: service.name,
        title_fa: service.name_fa,
        title_ps: service.name_ps,
        summary: service.summary,
        score: score(`${service.name} ${service.name_fa || ""} ${service.name_ps || ""} ${service.summary}`),
      })),
      ...(articles.items || []).map((article) => ({
        type: "article",
        slug: article.slug,
        title: article.title,
        title_fa: article.title_fa,
        title_ps: article.title_ps,
        summary: article.summary,
        category: article.category,
        score: score(`${article.title} ${article.category} ${article.summary}`),
      })),
    ]
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    return results.map(({ score: _score, ...item }) => item);
  });