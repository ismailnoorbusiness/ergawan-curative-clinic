import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import { adminNav } from "@/components/admin/adminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { formatDate } from "@/lib/clinic";

export const Route = createFileRoute("/_authed/admin/content")({
  component: AdminContent,
});

const CATEGORIES = ["Preventive care", "Maternal and child health", "Vaccination", "Healthy living", "Using the clinic"];

const EMPTY = {
  slug: "",
  category: "Preventive care",
  title: "",
  title_fa: "",
  title_ps: "",
  summary: "",
  summary_fa: "",
  summary_ps: "",
  body: "",
  body_fa: "",
  body_ps: "",
  source_name: "",
  source_url: "",
  published_date: new Date().toISOString().slice(0, 10),
  reviewed_by: "Clinic editorial review",
  reviewed_date: new Date().toISOString().slice(0, 10),
  is_sample: false,
};

function AdminContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const page = await base44.entities.Article.filter({}, { sort: "-published_date", limit: 100 });
    setItems(page.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async (event) => {
    event.preventDefault();
    if (!form?.title) return;
    setBusy(true);
    const payload = {
      ...form,
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    };
    try {
      if (form.id) await base44.entities.Article.update(form.id, payload);
      else await base44.entities.Article.create(payload);
      setForm(null);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item) => {
    await base44.entities.Article.delete(item.id);
    await load();
  };

  return (
    <AppShell
      nav={adminNav}
      eyebrow="Administration centre"
      title="Health library"
      actions={
        <Button className="rounded-full" onClick={() => setForm({ ...EMPTY })}>
          <Plus className="h-4 w-4" />
          New article
        </Button>
      }
    >
      {form && (
        <form onSubmit={save} className="mb-6 rounded-3xl border border-border bg-background p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Title (EN)
              <Input value={form.title} onChange={(event) => update("title", event.target.value)} className="mt-2 h-10" required />
            </label>
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Title (Dari)
              <Input value={form.title_fa} onChange={(event) => update("title_fa", event.target.value)} className="mt-2 h-10" dir="rtl" />
            </label>
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Title (Pashto)
              <Input value={form.title_ps} onChange={(event) => update("title_ps", event.target.value)} className="mt-2 h-10" dir="rtl" />
            </label>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Category
              <select
                value={form.category}
                onChange={(event) => update("category", event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Published date
              <Input
                type="date"
                value={form.published_date}
                onChange={(event) => update("published_date", event.target.value)}
                className="mt-2 h-10"
              />
            </label>
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Reviewed by
              <Input value={form.reviewed_by} onChange={(event) => update("reviewed_by", event.target.value)} className="mt-2 h-10" />
            </label>
          </div>
          <label className="mt-4 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Summary (EN)
            <Input value={form.summary} onChange={(event) => update("summary", event.target.value)} className="mt-2 h-10" />
          </label>
          <label className="mt-4 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Body (EN) — blank line between paragraphs, “## ” for a heading, “- ” for bullets
            <Textarea value={form.body} onChange={(event) => update("body", event.target.value)} className="mt-2 min-h-32" />
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Summary (Dari)
              <Input value={form.summary_fa} onChange={(event) => update("summary_fa", event.target.value)} className="mt-2 h-10" dir="rtl" />
            </label>
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Summary (Pashto)
              <Input value={form.summary_ps} onChange={(event) => update("summary_ps", event.target.value)} className="mt-2 h-10" dir="rtl" />
            </label>
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Body (Dari)
              <Textarea value={form.body_fa} onChange={(event) => update("body_fa", event.target.value)} className="mt-2 min-h-24" dir="rtl" />
            </label>
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Body (Pashto)
              <Textarea value={form.body_ps} onChange={(event) => update("body_ps", event.target.value)} className="mt-2 min-h-24" dir="rtl" />
            </label>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Source name
              <Input value={form.source_name} onChange={(event) => update("source_name", event.target.value)} className="mt-2 h-10" />
            </label>
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Source URL
              <Input value={form.source_url} onChange={(event) => update("source_url", event.target.value)} className="mt-2 h-10" dir="ltr" />
            </label>
          </div>
          <div className="mt-5 flex gap-2">
            <Button type="submit" className="rounded-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Save article
            </Button>
            <Button type="button" variant="ghost" onClick={() => setForm(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.category} · {formatDate(item.published_date)} · /{item.slug} {item.is_sample ? "· sample" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => setForm({ ...item })}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => remove(item)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}