import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import { adminNav } from "@/components/admin/adminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { base44 } from "@/api/base44Client";

export const Route = createFileRoute("/_authed/admin/services")({
  component: AdminServices,
});

const EMPTY = {
  slug: "",
  name: "",
  name_fa: "",
  name_ps: "",
  summary: "",
  summary_fa: "",
  summary_ps: "",
  description: "",
  icon: "stethoscope",
  duration_minutes: 30,
  order: 10,
  active: true,
  is_sample: false,
};

function AdminServices() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const page = await base44.entities.Service.filter({}, { sort: "order", limit: 100 });
    setItems(page.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async (event) => {
    event.preventDefault();
    if (!form?.name) return;
    setBusy(true);
    const payload = {
      ...form,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      duration_minutes: Number(form.duration_minutes) || 30,
      order: Number(form.order) || 10,
    };
    try {
      if (form.id) await base44.entities.Service.update(form.id, payload);
      else await base44.entities.Service.create(payload);
      setForm(null);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item) => {
    await base44.entities.Service.delete(item.id);
    await load();
  };

  return (
    <AppShell
      nav={adminNav}
      eyebrow="Administration centre"
      title="Services"
      actions={
        <Button className="rounded-full" onClick={() => setForm({ ...EMPTY })}>
          <Plus className="h-4 w-4" />
          New service
        </Button>
      }
    >
      {form && (
        <form onSubmit={save} className="mb-6 rounded-3xl border border-border bg-background p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Name (EN)
              <Input value={form.name} onChange={(event) => update("name", event.target.value)} className="mt-2 h-10" required />
            </label>
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Name (Dari)
              <Input value={form.name_fa} onChange={(event) => update("name_fa", event.target.value)} className="mt-2 h-10" dir="rtl" />
            </label>
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Name (Pashto)
              <Input value={form.name_ps} onChange={(event) => update("name_ps", event.target.value)} className="mt-2 h-10" dir="rtl" />
            </label>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Summary (EN)
              <Input value={form.summary} onChange={(event) => update("summary", event.target.value)} className="mt-2 h-10" />
            </label>
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Summary (Dari)
              <Input value={form.summary_fa} onChange={(event) => update("summary_fa", event.target.value)} className="mt-2 h-10" dir="rtl" />
            </label>
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Summary (Pashto)
              <Input value={form.summary_ps} onChange={(event) => update("summary_ps", event.target.value)} className="mt-2 h-10" dir="rtl" />
            </label>
          </div>
          <label className="mt-4 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Description (EN)
            <Textarea
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              className="mt-2 min-h-20"
            />
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Icon
              <select
                value={form.icon}
                onChange={(event) => update("icon", event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
              >
                {["stethoscope", "baby", "shield", "syringe", "heart", "apple"].map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Minutes
              <Input
                type="number"
                value={form.duration_minutes}
                onChange={(event) => update("duration_minutes", event.target.value)}
                className="mt-2 h-10"
              />
            </label>
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Order
              <Input type="number" value={form.order} onChange={(event) => update("order", event.target.value)} className="mt-2 h-10" />
            </label>
            <label className="flex items-center gap-2 pt-6 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <Switch checked={form.active} onCheckedChange={(value) => update("active", value)} />
              Published
            </label>
          </div>
          <div className="mt-5 flex gap-2">
            <Button type="submit" className="rounded-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Save service
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
                <p className="font-medium text-foreground">
                  {item.name} {item.active ? "" : "· hidden"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.duration_minutes} min · /{item.slug} {item.is_sample ? "· sample" : ""}
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