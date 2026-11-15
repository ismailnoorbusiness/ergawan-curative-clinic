import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Reply, Star } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import { adminNav } from "@/components/admin/adminNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { replyToContactMessage, setFeedbackPublished } from "@/lib/admin.functions";
import { formatDate } from "@/lib/clinic";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/admin/messages")({
  component: AdminMessages,
});

function AdminMessages() {
  const [tab, setTab] = useState("inbox");
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [inbox, reviews] = await Promise.all([
      base44.entities.ContactMessage.filter({}, { sort: "-created_date", limit: 100 }),
      base44.entities.Feedback.filter({}, { sort: "-created_date", limit: 100 }),
    ]);
    setMessages(inbox.items || []);
    setFeedback(reviews.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sendReply = async (id) => {
    if (!reply.trim()) return;
    setBusy(true);
    try {
      await replyToContactMessage({ data: { id, reply: reply.trim() } });
      setReplyingId("");
      setReply("");
      await load();
    } finally {
      setBusy(false);
    }
  };

  const togglePublished = async (item) => {
    await setFeedbackPublished({ data: { id: item.id, published: !item.published } });
    await load();
  };

  return (
    <AppShell nav={adminNav} eyebrow="Administration centre" title="Messages and feedback">
      <div className="flex gap-2">
        {[
          { key: "inbox", label: "Contact inbox" },
          { key: "feedback", label: "Patient feedback" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "rounded-full border px-4 py-2 text-xs transition-colors",
              tab === item.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-accent",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 h-32 animate-pulse rounded-2xl bg-muted" />
      ) : tab === "inbox" ? (
        <ul className="mt-6 space-y-3">
          {messages.length === 0 && (
            <li className="rounded-3xl border border-dashed border-border p-8 text-sm text-muted-foreground">No messages yet.</li>
          )}
          {messages.map((item) => (
            <li key={item.id} className="rounded-2xl border border-border bg-background p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {item.name} <span className="font-normal text-muted-foreground">· {item.email}</span>
                  </p>
                  <p className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                    {item.category} · {item.priority} · {item.status} · {formatDate(item.created_date)}
                  </p>
                  {item.subject && <p className="mt-2 text-sm font-medium text-foreground">{item.subject}</p>}
                  <p className="mt-1 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  {item.ai_summary && <p className="mt-2 text-xs italic text-muted-foreground">AI summary: {item.ai_summary}</p>}
                  {item.reply && (
                    <div className="mt-3 rounded-xl bg-secondary p-3 text-xs text-foreground">
                      <span className="uppercase tracking-[0.12em] text-muted-foreground">Reply sent</span>
                      <p className="mt-1 whitespace-pre-wrap">{item.reply}</p>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setReplyingId(replyingId === item.id ? "" : item.id)}
                >
                  <Reply className="h-3.5 w-3.5" />
                  Reply
                </Button>
              </div>

              {replyingId === item.id && (
                <div className="mt-4 border-t border-border pt-3">
                  <Textarea value={reply} onChange={(event) => setReply(event.target.value.slice(0, 2000))} className="min-h-24" />
                  <p className="mt-2 text-[0.68rem] text-muted-foreground">
                    The reply is emailed to {item.email} and stored on the record.
                  </p>
                  <Button className="mt-3 rounded-full" onClick={() => sendReply(item.id)} disabled={busy || !reply.trim()}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    Send reply
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-6 space-y-3">
          {feedback.length === 0 && (
            <li className="rounded-3xl border border-dashed border-border p-8 text-sm text-muted-foreground">No feedback yet.</li>
          )}
          {feedback.map((item) => (
            <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-background p-5">
              <div>
                <span className="flex gap-0.5">
                  {Array.from({ length: Math.round(item.rating || 0) }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-accent text-accent" />
                  ))}
                </span>
                <p className="mt-2 max-w-2xl text-sm text-foreground">{item.comment}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.patient_name || "Anonymous"} · {item.service_name || "General"} · {formatDate(item.created_date)}
                </p>
              </div>
              <Button size="sm" variant={item.published ? "default" : "outline"} className="rounded-full" onClick={() => togglePublished(item)}>
                {item.published ? "Published" : "Publish"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}