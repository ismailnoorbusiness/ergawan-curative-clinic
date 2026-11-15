import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus, Loader2 } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import StatusPill from "@/components/app/StatusPill";
import { portalNav } from "@/components/portal/portalNav";
import { Button } from "@/components/ui/button";
import { useMyAppointments } from "@/hooks/usePatientData";
import { cancelMyAppointment } from "@/lib/portal.functions";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/clinic";

export const Route = createFileRoute("/_authed/portal/appointments")({
  component: PortalAppointments,
});

function PortalAppointments() {
  const { t, lang } = useI18n();
  const { items, loading, reload } = useMyAppointments();
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const cancel = async (id) => {
    setBusyId(id);
    setError("");
    try {
      await cancelMyAppointment({ data: { id } });
      await reload();
    } catch {
      setError(t("track.cancelError"));
    } finally {
      setBusyId("");
    }
  };

  return (
    <AppShell
      nav={portalNav(t)}
      eyebrow="Patient portal"
      title={t("track.title")}
      actions={
        <Button asChild className="rounded-full">
          <Link to="/book">
            <CalendarPlus className="h-4 w-4" />
            {t("footer.book")}
          </Link>
        </Button>
      }
    >
      {error && <p className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border p-8 text-sm text-muted-foreground">
          No appointment requests yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-2xl border border-border bg-background p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <StatusPill status={item.status} />
                  <p className="mt-3 font-heading text-lg text-primary">{item.service_name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(item.preferred_date, lang)} · {item.preferred_time}
                  </p>
                  {item.staff_note && (
                    <p className="mt-2 max-w-xl whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                      {item.staff_note}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-mono text-xs tracking-[0.18em] text-muted-foreground">{item.tracking_code}</span>
                  {["requested", "confirmed"].includes(item.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => cancel(item.id)}
                      disabled={busyId === item.id}
                    >
                      {busyId === item.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {t("common.cancel")}
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}