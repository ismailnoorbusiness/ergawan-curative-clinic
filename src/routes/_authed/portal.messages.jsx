import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Send, ShieldCheck } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import { portalNav } from "@/components/portal/portalNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMyMessages } from "@/hooks/usePatientData";
import { markThreadRead, sendPatientMessage } from "@/lib/portal.functions";
import { useAuth } from "@/lib/AuthContext";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/portal/messages")({
  component: PortalMessages,
});

function PortalMessages() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { items, loading, reload } = useMyMessages();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scroller = useRef(null);

  useEffect(() => {
    markThreadRead().catch(() => {});
  }, []);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [items]);

  const send = async () => {
    const text = body.trim();
    if (!text) return;
    setBusy(true);
    setError("");
    try {
      await sendPatientMessage({ data: { body: text } });
      setBody("");
      await reload();
    } catch {
      setError(t("common.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell nav={portalNav(t)} eyebrow="Patient portal" title="Secure messages">
      <div className="rounded-3xl border border-border bg-background">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-accent" />
          Visible to you and authorised clinic staff only.
        </div>

        <div ref={scroller} className="max-h-[52vh] min-h-[240px] space-y-3 overflow-y-auto p-6">
          {loading ? (
            <div className="h-20 animate-pulse rounded-2xl bg-muted" />
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No messages yet. Write to the clinic team below — replies appear here.
            </p>
          ) : (
            items.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.sender_role === "patient" ? "ms-auto bg-primary text-primary-foreground" : "bg-secondary text-foreground",
                )}
              >
                {message.sender_role === "staff" && (
                  <p className="mb-1 text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                    {message.sender_name || "Clinic staff"}
                  </p>
                )}
                {message.body}
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border p-4">
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value.slice(0, 2000))}
            placeholder={`Message the clinic as ${user?.email || "patient"}…`}
            className="min-h-24"
          />
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[0.68rem] text-muted-foreground">Do not include ID numbers or test results.</p>
            <Button className="rounded-full" onClick={send} disabled={busy || !body.trim()}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rtl:-scale-x-100" />}
              {t("assistant.send")}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}