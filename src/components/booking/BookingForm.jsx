import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, CircleCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAppointmentRequest } from "@/lib/booking.functions";
import { PREFERRED_TIMES } from "@/lib/clinic";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

const FIELDS = {
  service_slug: { labelKey: "booking.service", type: "text" },
};

export default function BookingForm({ services = [], initialService = "" }) {
  const { t, lang, pick } = useI18n();
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState(initialService ? 1 : 0);
  const [form, setForm] = useState({
    service_slug: initialService,
    preferred_date: "",
    preferred_time: "",
    patient_name: "",
    patient_email: "",
    patient_phone: "",
    notes: "",
    language: lang,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const selected = services.find((service) => service.slug === form.service_slug);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const steps = [t("booking.step1"), t("booking.step2"), t("booking.step3")];

  const canContinue = () => {
    if (step === 0) return Boolean(form.service_slug);
    if (step === 1) return Boolean(form.preferred_date && form.preferred_time);
    return (
      form.patient_name.trim().length > 1 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.patient_email) &&
      form.patient_phone.trim().length > 5
    );
  };

  const submit = async () => {
    if (!canContinue()) {
      setError(t("booking.invalidEmail"));
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await createAppointmentRequest({
        data: {
          patient_name: form.patient_name.trim(),
          patient_email: form.patient_email.trim(),
          patient_phone: form.patient_phone.trim(),
          service_slug: form.service_slug,
          preferred_date: form.preferred_date,
          preferred_time: form.preferred_time,
          notes: form.notes,
          language: form.language,
        },
      });
      setResult(response);
    } catch {
      setError(t("booking.error"));
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center md:p-12">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/15 text-accent">
          <CircleCheck className="h-7 w-7" />
        </span>
        <h2 className="display-title mt-6 text-2xl text-primary">{t("booking.successTitle")}</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{t("booking.successBody")}</p>
        <div className="mx-auto mt-6 w-fit rounded-2xl border border-dashed border-accent bg-secondary px-8 py-4">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">{t("booking.trackingLabel")}</p>
          <p className="mt-1 font-mono text-2xl tracking-[0.18em] text-primary">{result.tracking_code}</p>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="rounded-full">
            <Link to="/track">{t("booking.trackLink")}</Link>
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => {
              setResult(null);
              setStep(0);
            }}
          >
            {t("booking.bookAnother")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1.4fr_0.8fr]">
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
        <ol className="flex flex-wrap gap-2">
          {steps.map((label, index) => (
            <li
              key={label}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs",
                index === step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
              )}
            >
              <span className="grid h-4 w-4 place-items-center rounded-full border border-current text-[0.6rem]">
                {index < step ? <Check className="h-2.5 w-2.5" /> : index + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>

        <div className="mt-8">
          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <button
                  key={service.slug}
                  type="button"
                  onClick={() => update("service_slug", service.slug)}
                  className={cn(
                    "rounded-2xl border p-4 text-start transition-colors",
                    form.service_slug === service.slug
                      ? "border-accent bg-accent/5 ring-1 ring-accent"
                      : "border-border hover:border-accent/50",
                  )}
                >
                  <span className="block font-heading text-base text-primary">{pick(service, "name")}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {pick(service, "summary")}
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground" htmlFor="preferred_date">
                  {t("booking.date")}
                </label>
                <Input
                  id="preferred_date"
                  type="date"
                  min={today}
                  value={form.preferred_date}
                  onChange={(event) => update("preferred_date", event.target.value)}
                  className="mt-2 h-11"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{t("booking.time")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PREFERRED_TIMES.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => update("preferred_time", time)}
                      className={cn(
                        "min-h-[44px] rounded-full border px-4 text-sm transition-colors",
                        form.preferred_time === time
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border text-foreground hover:border-accent/60",
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4">
              <div>
                <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground" htmlFor="patient_name">
                  {t("booking.name")}
                </label>
                <Input
                  id="patient_name"
                  value={form.patient_name}
                  onChange={(event) => update("patient_name", event.target.value)}
                  className="mt-2 h-11"
                  autoComplete="name"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground" htmlFor="patient_email">
                    {t("booking.email")}
                  </label>
                  <Input
                    id="patient_email"
                    type="email"
                    dir="ltr"
                    value={form.patient_email}
                    onChange={(event) => update("patient_email", event.target.value)}
                    className="mt-2 h-11"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground" htmlFor="patient_phone">
                    {t("booking.phone")}
                  </label>
                  <Input
                    id="patient_phone"
                    type="tel"
                    dir="ltr"
                    value={form.patient_phone}
                    onChange={(event) => update("patient_phone", event.target.value)}
                    className="mt-2 h-11"
                    autoComplete="tel"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground" htmlFor="notes">
                  {t("booking.notes")} <span className="lowercase">({t("common.optional")})</span>
                </label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(event) => update("notes", event.target.value.slice(0, 1200))}
                  className="mt-2 min-h-24"
                />
                <p className="mt-2 text-xs text-muted-foreground">{t("booking.notesHint")}</p>
              </div>
            </div>
          )}
        </div>

        {error && <p className="mt-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            className="rounded-full"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0 || busy}
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t("booking.back")}
          </Button>
          {step < 2 ? (
            <Button className="rounded-full" onClick={() => setStep((value) => value + 1)} disabled={!canContinue()}>
              {t("booking.next")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          ) : (
            <Button className="rounded-full" onClick={submit} disabled={busy || !canContinue()}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? t("booking.submitting") : t("booking.submit")}
            </Button>
          )}
        </div>
      </div>

      <aside className="h-fit rounded-3xl border border-border bg-secondary/60 p-6">
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">{t("booking.summary")}</p>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">{t("booking.service")}</dt>
            <dd className="text-foreground">{selected ? pick(selected, "name") : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t("booking.date")}</dt>
            <dd className="text-foreground" dir="ltr">{form.preferred_date || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t("booking.time")}</dt>
            <dd className="text-foreground" dir="ltr">{form.preferred_time || "—"}</dd>
          </div>
        </dl>
        <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
          {isAuthenticated ? `${t("booking.signedInNote")} (${user?.email})` : t("booking.guestNote")}
        </p>
      </aside>
    </div>
  );
}