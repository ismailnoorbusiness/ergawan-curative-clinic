import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import StatusPill from "@/components/app/StatusPill";
import { adminNav } from "@/components/admin/adminNav";
import { getAdminOverview } from "@/lib/admin.functions";
import { formatDate } from "@/lib/clinic";

export const Route = createFileRoute("/_authed/admin/")({
  loader: () => getAdminOverview(),
  component: AdminDashboard,
});

function AdminDashboard() {
  const data = Route.useLoaderData();
  const { counts, recentAppointments, recentActivity, newMessagesList } = data;

  const tiles = [
    { label: "Awaiting confirmation", value: counts.requested, hint: "Requests to review" },
    { label: "Confirmed", value: counts.confirmed, hint: "Upcoming" },
    { label: "Today", value: counts.todayCount, hint: "Appointments dated today" },
    { label: "This month", value: counts.monthCount, hint: "Requests received" },
    { label: "New messages", value: counts.newMessages, hint: "Contact inbox" },
    { label: "Registered patients", value: counts.patients, hint: "Portal profiles" },
  ];

  return (
    <AppShell nav={adminNav} eyebrow="Administration centre" title="Clinic overview">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-2xl border border-border bg-background p-5">
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">{tile.label}</p>
            <p className="mt-2 font-heading text-3xl text-primary">{tile.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{tile.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-3xl border border-border bg-background p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg text-primary">Latest requests</h2>
            <Link to="/admin/appointments" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              Manage <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {recentAppointments.length === 0 && <li className="py-4 text-sm text-muted-foreground">No requests yet.</li>}
            {recentAppointments.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.patient_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.service_name} · {formatDate(item.preferred_date)} {item.preferred_time}
                  </p>
                </div>
                <StatusPill status={item.status} />
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl border border-border bg-background p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg text-primary">New messages</h2>
              <Link to="/admin/messages" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                Inbox <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {newMessagesList.length === 0 && <li className="text-sm text-muted-foreground">Inbox is clear.</li>}
              {newMessagesList.map((item) => (
                <li key={item.id} className="rounded-xl bg-secondary/70 p-3">
                  <p className="text-xs font-medium text-foreground">
                    {item.name} · <span className="uppercase tracking-[0.1em]">{item.category}</span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.ai_summary || item.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="font-heading text-lg text-primary">Recent activity</h2>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {recentActivity.length === 0 && <li>Nothing logged yet.</li>}
              {recentActivity.slice(0, 6).map((item) => (
                <li key={item.id} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <span>
                    {item.action} · {item.target}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}