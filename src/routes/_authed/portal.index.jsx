import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus, ChevronRight, MessageSquare, Sparkles } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import { portalNav } from "@/components/portal/portalNav";
import { Button } from "@/components/ui/button";
import StatusPill from "@/components/app/StatusPill";
import { useMyAppointments, useMyMessages } from "@/hooks/usePatientData";
import { useAuth } from "@/lib/AuthContext";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/clinic";

export const Route = createFileRoute("/_authed/portal/")({
  component: PortalOverview,
});

function PortalOverview() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const { items, loading } = useMyAppointments();
  const { items: messages } = useMyMessages();

  const upcoming = items
    .filter((item) => ["requested", "confirmed"].includes(item.status))
    .sort((a, b) => String(a.preferred_date).localeCompare(String(b.preferred_date)));
  const next = upcoming[0];
  const unread = messages.filter((message) => message.sender_role === "staff" && !message.read_by_patient).length;
  const firstName = (user?.full_name || user?.email || "").split(/[ @]/)[0];

  const tiles = [
    { label: "Upcoming", value: upcoming.length, to: "/portal/appointments" },
    { label: "Total requests", value: items.length, to: "/portal/appointments" },
    { label: "Unread messages", value: unread, to: "/portal/messages" },
  ];

  return (
    <AppShell
      nav={portalNav(t)}
      eyebrow="Patient portal"
      title={`${t("nav.home")} · ${firstName || "Patient"}`}
      actions={
        <Button asChild className="rounded-full">
          <Link to="/book">
            <CalendarPlus className="h-4 w-4" />
            {t("footer.book")}
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Link
            key={tile.label}
            to={tile.to}
            className="rounded-2xl border border-border bg-background p-5 transition-colors hover:border-accent/50"
          >
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">{tile.label}</p>
            <p className="mt-2 font-heading text-3xl text-primary">{tile.value}</p>
          </Link>
        ))}
      </div>

      <section className="mt-6 rounded-3xl border border-border bg-background p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl text-primary">{t("track.title")}</h2>
          <Link to="/portal/appointments" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            {t("common.viewAll")}
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-6 h-24 animate-pulse rounded-2xl bg-muted" />
        ) : next ? (
          <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-secondary/70 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <StatusPill status={next.status} />
              <p className="mt-3 font-heading text-lg text-primary">{next.service_name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(next.preferred_date, lang)} · {next.preferred_time}
              </p>
            </div>
            <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground">{next.tracking_code}</p>
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-secondary/70 p-5 text-sm text-muted-foreground">
            No upcoming appointments. {t("booking.intro")}
          </p>
        )}
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          to="/portal/messages"
          className="group rounded-3xl border border-border bg-background p-6 transition-colors hover:border-accent/50"
        >
          <MessageSquare className="h-5 w-5 text-accent" />
          <p className="mt-4 font-heading text-lg text-primary">Secure messages</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Write to authorised clinic staff. {unread > 0 ? `${unread} unread.` : ""}
          </p>
        </Link>
        <Link
          to="/assistant"
          className="group rounded-3xl border border-border bg-background p-6 transition-colors hover:border-accent/50"
        >
          <Sparkles className="h-5 w-5 text-accent" />
          <p className="mt-4 font-heading text-lg text-primary">{t("assistant.title")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("assistant.subtitle")}</p>
        </Link>
      </div>
    </AppShell>
  );
}