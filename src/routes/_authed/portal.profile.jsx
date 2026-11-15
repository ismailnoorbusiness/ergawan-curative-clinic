import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import { portalNav } from "@/components/portal/portalNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { ensureMyProfile } from "@/lib/portal.functions";
import { useAuth } from "@/lib/AuthContext";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authed/portal/profile")({
  component: PortalProfile,
});

function PortalProfile() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", date_of_birth: "", address: "", preferred_language: "en" });

  useEffect(() => {
    let active = true;
    ensureMyProfile()
      .then((record) => {
        if (!active) return;
        setProfile(record);
        setForm({
          full_name: record.full_name || user?.full_name || "",
          phone: record.phone || "",
          date_of_birth: record.date_of_birth || "",
          address: record.address || "",
          preferred_language: record.preferred_language || "en",
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user]);

  const save = async (event) => {
    event.preventDefault();
    if (!profile) return;
    setBusy(true);
    setSaved(false);
    try {
      await base44.entities.PatientProfile.update(profile.id, form);
      setSaved(true);
    } finally {
      setBusy(false);
    }
  };

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <AppShell nav={portalNav(t)} eyebrow="Patient portal" title="My profile">
      <form onSubmit={save} className="max-w-xl rounded-3xl border border-border bg-background p-6 md:p-8">
        <div className="grid gap-4">
          <div>
            <label htmlFor="p-name" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {t("common.name")}
            </label>
            <Input id="p-name" value={form.full_name} onChange={(event) => update("full_name", event.target.value)} className="mt-2 h-11" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-phone" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {t("common.phone")}
              </label>
              <Input id="p-phone" dir="ltr" value={form.phone} onChange={(event) => update("phone", event.target.value)} className="mt-2 h-11" />
            </div>
            <div>
              <label htmlFor="p-dob" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Date of birth
              </label>
              <Input
                id="p-dob"
                type="date"
                value={form.date_of_birth}
                onChange={(event) => update("date_of_birth", event.target.value)}
                className="mt-2 h-11"
              />
            </div>
          </div>
          <div>
            <label htmlFor="p-address" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {t("contact.address")}
            </label>
            <Input id="p-address" value={form.address} onChange={(event) => update("address", event.target.value)} className="mt-2 h-11" />
          </div>
          <div>
            <label htmlFor="p-lang" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {t("booking.language")}
            </label>
            <select
              id="p-lang"
              value={form.preferred_language}
              onChange={(event) => update("preferred_language", event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="en">English</option>
              <option value="fa">دری</option>
              <option value="ps">پښتو</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button type="submit" className="rounded-full" disabled={busy || !profile}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("common.save")}
          </Button>
          {saved && <span className="text-sm text-accent">{t("common.success")}</span>}
        </div>
        <p className="mt-5 text-xs text-muted-foreground">Signed in as {user?.email}. Language: {lang}.</p>
      </form>
    </AppShell>
  );
}