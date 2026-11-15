import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/app/AppShell";
import { adminNav } from "@/components/admin/adminNav";
import { base44 } from "@/api/base44Client";

export const Route = createFileRoute("/_authed/admin/activity")({
  component: AdminActivity,
});

function AdminActivity() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    base44.entities.ActivityLog.filter({}, { sort: "-created_date", limit: 100 })
      .then((page) => {
        if (active) setItems(page.items || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell nav={adminNav} eyebrow="Administration centre" title="Activity log">
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Appointment requests, cancellations, replies and permission changes are recorded automatically.
      </p>

      {loading ? (
        <div className="mt-6 h-40 animate-pulse rounded-2xl bg-muted" />
      ) : items.length === 0 ? (
        <p className="mt-6 rounded-3xl border border-dashed border-border p-8 text-sm text-muted-foreground">
          No activity recorded yet.
        </p>
      ) : (
        <ol className="mt-6 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-border bg-background px-4 py-3">
              <div>
                <p className="text-sm text-foreground">{item.action}</p>
                <p className="text-xs text-muted-foreground">
                  {item.target}
                  {item.detail ? ` · ${item.detail}` : ""}
                </p>
              </div>
              <div className="text-end text-[0.68rem] text-muted-foreground">
                <p>{item.actor_name || item.actor_email || "System"}</p>
                <p>{new Date(item.created_date).toLocaleString("en-GB", { timeZone: "UTC" })}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </AppShell>
  );
}