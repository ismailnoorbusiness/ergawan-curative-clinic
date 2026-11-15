import { useState } from "react";
import { CircleCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContactMessage } from "@/lib/contact.functions";
import { useI18n } from "@/lib/i18n";

export default function ContactForm() {
  const { t, lang } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", body: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.body.trim().length < 5) {
      setError(t("contactForm.error"));
      return;
    }
    setBusy(true);
    setError("");
    try {
      await submitContactMessage({
        data: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: form.subject.trim(),
          body: form.body.trim(),
          language: lang,
        },
      });
      setSent(true);
    } catch {
      setError(t("contactForm.error"));
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/15 text-accent">
          <CircleCheck className="h-6 w-6" />
        </span>
        <h2 className="mt-5 font-heading text-xl text-primary">{t("contactForm.successTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("contactForm.successBody")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-6 md:p-8">
      <h2 className="font-heading text-xl text-primary">{t("contactForm.title")}</h2>
      <div className="mt-5 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="c-name" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {t("contactForm.name")}
            </label>
            <Input
              id="c-name"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              className="mt-2 h-11"
              required
            />
          </div>
          <div>
            <label htmlFor="c-email" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {t("contactForm.email")}
            </label>
            <Input
              id="c-email"
              type="email"
              dir="ltr"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              className="mt-2 h-11"
              required
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="c-phone" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {t("contactForm.phone")}
            </label>
            <Input
              id="c-phone"
              type="tel"
              dir="ltr"
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              className="mt-2 h-11"
            />
          </div>
          <div>
            <label htmlFor="c-subject" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {t("contactForm.subject")}
            </label>
            <Input
              id="c-subject"
              value={form.subject}
              onChange={(event) => update("subject", event.target.value)}
              className="mt-2 h-11"
            />
          </div>
        </div>
        <div>
          <label htmlFor="c-body" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {t("contactForm.message")}
          </label>
          <Textarea
            id="c-body"
            value={form.body}
            onChange={(event) => update("body", event.target.value.slice(0, 2000))}
            className="mt-2 min-h-32"
            required
          />
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <Button type="submit" className="mt-5 w-full rounded-full" disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {busy ? t("contactForm.sending") : t("contactForm.send")}
      </Button>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t("contactForm.privacyNote")}</p>
    </form>
  );
}