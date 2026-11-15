import { useCallback, useEffect, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Check, Loader2, X } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import StatusPill from "@/components/app/StatusPill";
import { adminNav } from "@/components/admin/adminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { updateAppointmentStatus } from "@/lib/admin.functions";
import { formatDate } from "@/lib/clinic";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/admin/appointments")({
  component: AdminAppointments,
});

const FILTERS = [
  { key: "requested", label: "Awaiting confirmation" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "all", label: "All" },
];

function AdminAppointments() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("requested");
  const [busyId, setBusyId] = useState("");
  const [noteFor, setNoteFor] = useState("");
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const query = filter === "all" ? {} : { status: filter };
    const page = await base44.entities.Appointment.filter(query, { sort: "-created_date", limit: 100 });
    setItems(page.items || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id, status) => {
    setBusyId(id);
    try {
      await updateAppointmentStatus({ data: { id, status, staff_note: noteFor === id ? note : "" } });
      setNoteFor("");
      setNote("");
      await load();
      router.invalidate();
    } finally {
      setBusyId("");
    }
  };

  return (
    <AppShell nav={adminNav} eyebrow="Administration centre" title="Appointments">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={cn(
              "rounded-full border px-4 py-2 text-xs transition-colors",
              filter === item.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-accent",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="mt-6 rounded-3xl border border-dashed border-border p-8 text-sm text-muted-foreground">
          Nothing in this view.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-2xl border border-border bg-background p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <StatusPill status={item.status} />
                  <p className="mt-3 font-heading text-lg text-primary">{item.patient_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.service_name} · {formatDate(item.preferred_date)} {item.preferred_time}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span dir="ltr">{item.patient_email}</span> · <span dir="ltr">{item.patient_phone}</span> ·{" "}
                    <span className="font-mono tracking-[0.14em]">{item.tracking_code}</span>
                  </p>
                  {item.notes && <p className="mt-2 max-w-xl text-xs leading-relaxed text-foreground">{item.notes}</p>}
                  {item.staff_note && (
                    <p className="mt-2 max-w-xl whitespace-pre-wrap rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
                      {item.staff_note}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    {item.status !== "confirmed" && (
                      <Button size="sm" className="rounded-full" onClick={() => act(item.id, "confirmed")} disabled={busyId === item.id}>
                        {busyId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        Confirm
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setNoteFor(noteFor === item.id ? "" : item.id)}
                    >
                      Note
                    </Button>
                    {item.status !== "declined" && (
                      <Button size="sm" variant="ghost" className="rounded-full" onClick={() => act(item.id, "declined")}>
                        <X className="h-3.5 w-3.5" />
                        Decline
                      </Button>
                    )}
                  </div>
                  {item.status === "confirmed" && (
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => act(item.id, "completed")}>
                      Mark completed
                    </Button>
                  )}
                </div>
              </div>

              {noteFor === item.id && (
                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row">
                  <Input
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Message to the patient (visible in their portal)"
                    className="h-10"
                  />
                  <Button size="sm" onClick={() => act(item.id, item.status)} disabled={busyId === item.id}>
                    Save note
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}