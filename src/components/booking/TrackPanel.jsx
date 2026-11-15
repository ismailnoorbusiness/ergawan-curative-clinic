import { useState } from "react";
import { Loader2, Search, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cancelAppointmentByCode, trackAppointment } from "@/lib/booking.functions";
import { formatDate, STATUS_LABELS, STATUS_STYLES } from "@/lib/clinic";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function TrackPanel() {
  const { t, lang } = useI18n();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);

  const find = async (event) => {
    event.preventDefault();
    setBusy(true);
    setNotFound(false);
    setMessage("");
    try {
      const result = await trackAppointment({ data: { code, email } });
      if (!result.found) {
        setAppointment(null);
        setNotFound(true);
      } else {
        setAppointment(result.appointment);
      }
    } catch {
      setNotFound(true);
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    setBusy(true);
    try {
      await cancelAppointmentByCode({ data: { code, email } });
      setMessage(t("track.cancelSuccess"));
      const result = await trackAppointment({ data: { code, email } });
      if (result.found) setAppointment(result.appointment);
    } catch {
      setMessage(t("track.cancelError"));
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form onSubmit={find} className="rounded-3xl border border-border bg-card p-6 md:p-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="code" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {t("track.code")}
            </label>
            <Input
              id="code"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase().slice(0, 12))}
              dir="ltr"
              className="mt-2 h-11 font-mono tracking-[0.18em]"
              placeholder="ABC123"
              required
            />
          </div>
          <div>
            <label htmlFor="track-email" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {t("track.email")}
            </label>
            <Input
              id="track-email"
              type="email"
              dir="ltr"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-11"
              required
            />
          </div>
        </div>
        <Button type="submit" className="mt-6 w-full rounded-full" disabled={busy || !code || !email}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {t("track.action")}
        </Button>
        {notFound && <p className="mt-4 text-sm text-destructive">{t("track.notFound")}</p>}
      </form>

      <div className="rounded-3xl border border-border bg-secondary/50 p-6 md:p-8">
        {!appointment ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{t("track.intro")}</p>
        ) : (
          <div>
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.14em] ring-1",
                STATUS_STYLES[appointment.status] || STATUS_STYLES.requested,
              )}
            >
              {STATUS_LABELS[appointment.status] || appointment.status}
            </span>
            <h2 className="mt-4 font-heading text-2xl leading-snug text-primary">{appointment.service_name}</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
                <dt className="text-muted-foreground">{t("booking.date")}</dt>
                <dd dir="ltr">{formatDate(appointment.preferred_date, lang)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
                <dt className="text-muted-foreground">{t("booking.time")}</dt>
                <dd dir="ltr">{appointment.preferred_time}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
                <dt className="text-muted-foreground">{t("booking.name")}</dt>
                <dd>{appointment.patient_name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{t("track.requestedOn")}</dt>
                <dd>{formatDate(appointment.created_date, lang)}</dd>
              </div>
            </dl>

            {appointment.staff_note && (
              <div className="mt-5 rounded-2xl bg-background p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">{t("track.staffNote")}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{appointment.staff_note}</p>
              </div>
            )}

            {message && <p className="mt-4 text-sm text-foreground">{message}</p>}

            {!["cancelled", "completed", "declined"].includes(appointment.status) && !message && (
              <div className="mt-6">
                {confirming ? (
                  <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
                    <p className="flex items-center gap-2 text-sm text-foreground">
                      <TriangleAlert className="h-4 w-4 text-destructive" />
                      {t("track.cancelConfirm")}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="destructive" onClick={cancel} disabled={busy}>
                        {t("track.cancel")}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                        {t("common.cancel")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" className="rounded-full" onClick={() => setConfirming(true)}>
                    {t("track.cancel")}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}