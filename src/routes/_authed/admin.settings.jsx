import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import { adminNav } from "@/components/admin/adminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { base44 } from "@/api/base44Client";

export const Route = createFileRoute("/_authed/admin/settings")({
  component: AdminSettings,
});

const DEFAULTS = {
  name: "Ergawan Curative Clinic",
  phone: "",
  whatsapp: "",
  email: "",
  notification_email: "",
  address: "",
  address_fa: "",
  address_ps: "",
  hours: "",
  hours_fa: "",
  hours_ps: "",
  emergency_note: "",
  latitude: 34.5553,
  longitude: 69.2075,
  notify_new_requests: true,
  notify_new_messages: true,
  is_placeholder: false,
};

function AdminSettings() {
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    base44.entities.ClinicSettings.list("-created_date", 1).then((items) => {
      if (!active) return;
      const found = Array.isArray(items) ? items[0] : items?.items?.[0];
      if (found) {
        setRecord(found);
        setForm({ ...DEFAULTS, ...found });
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setSaved(false);
    const payload = {
      ...form,
      latitude: Number(form.latitude) || 34.5553,
      longitude: Number(form.longitude) || 69.2075,
      is_placeholder: false,
    };
    try {
      if (record?.id) await base44.entities.ClinicSettings.update(record.id, payload);
      else {
        const created = await base44.entities.ClinicSettings.create(payload);
        setRecord(created);
      }
      setSaved(true);
    } finally {
      setBusy(false);
    }
  };

  const fields = [
    { key: "name", label: "Clinic name" },
    { key: "phone", label: "Phone", ltr: true },
    { key: "whatsapp", label: "WhatsApp number", ltr: true },
    { key: "email", label: "Public email", ltr: true },
    { key: "notification_email", label: "Notification inbox (staff email)", ltr: true },
    { key: "address", label: "Address (EN)" },
    { key: "address_fa", label: "Address (Dari)", rtl: true },
    { key: "address_ps", label: "Address (Pashto)", rtl: true },
    { key: "hours", label: "Opening hours (EN)" },
    { key: "hours_fa", label: "Opening hours (Dari)", rtl: true },
    { key: "hours_ps", label: "Opening hours (Pashto)", rtl: true },
  ];

  return (
    <AppShell nav={adminNav} eyebrow="Administration centre" title="Clinic settings">
      {loading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      ) : (
        <form onSubmit={save} className="max-w-3xl rounded-3xl border border-border bg-background p-6 md:p-8">
          <p className="rounded-xl bg-secondary px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            These details are shown across the public website, the appointment confirmation and the AI assistant. Replace the sample
            values before publishing.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <label key={field.key} className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {field.label}
                <Input
                  value={form[field.key] ?? ""}
                  onChange={(event) => update(field.key, event.target.value)}
                  className="mt-2 h-11"
                  dir={field.ltr ? "ltr" : field.rtl ? "rtl" : undefined}
                />
              </label>
            ))}
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Latitude
              <Input value={form.latitude} onChange={(event) => update("latitude", event.target.value)} className="mt-2 h-11" />
            </label>
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Longitude
              <Input value={form.longitude} onChange={(event) => update("longitude", event.target.value)} className="mt-2 h-11" />
            </label>
          </div>

          <label className="mt-4 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Emergency note shown by the assistant
            <Textarea
              value={form.emergency_note || ""}
              onChange={(event) => update("emergency_note", event.target.value)}
              className="mt-2 min-h-20"
              placeholder="For example: For emergencies call 112 / go to the nearest emergency department."
            />
          </label>

          <div className="mt-6 grid gap-4 rounded-2xl bg-secondary/60 p-5 sm:grid-cols-2">
            <label className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <Switch checked={Boolean(form.notify_new_requests)} onCheckedChange={(value) => update("notify_new_requests", value)} />
              Email on new appointment requests
            </label>
            <label className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <Switch checked={Boolean(form.notify_new_messages)} onCheckedChange={(value) => update("notify_new_messages", value)} />
              Email on new patient messages
            </label>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button type="submit" className="rounded-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Save settings
            </Button>
            {saved && <span className="text-sm text-accent">Saved</span>}
          </div>
          <p className="mt-4 text-[0.68rem] leading-relaxed text-muted-foreground">
            Email notifications reach registered staff addresses reliably. Reaching addresses outside the clinic requires a connected
            custom domain on a paid plan.
          </p>
        </form>
      )}
    </AppShell>
  );
}