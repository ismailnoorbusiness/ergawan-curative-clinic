import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Send, Sparkles } from "lucide-react";
import { askErgawan } from "@/lib/assistant.functions";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function AssistantChat({ compact = false }) {
  const { t, lang } = useI18n();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [error, setError] = useState("");
  const scroller = useRef(null);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [messages, busy]);

  const send = useCallback(
    async (text) => {
      const message = (text ?? input).trim();
      if (!message || busy) return;
      setInput("");
      setError("");
      const history = messages.slice(-6).map((item) => ({ role: item.role, content: item.content.slice(0, 800) }));
      setMessages((current) => [...current, { role: "user", content: message }]);
      setBusy(true);
      try {
        const result = await askErgawan({ data: { message, language: lang, history } });
        setMessages((current) => [...current, { role: "assistant", content: result.reply }]);
        if (result.urgent) setUrgent(true);
      } catch {
        setError(t("assistant.error"));
      } finally {
        setBusy(false);
      }
    },
    [busy, input, lang, messages, t],
  );

  const suggestions = t("assistant.suggestions") || [];

  return (
    <div className={cn("flex h-full min-h-0 flex-col", compact ? "" : "rounded-3xl border border-border bg-card")}>
      <div className={cn("flex items-start gap-3 border-b border-border", compact ? "pb-3" : "p-5")}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-accent">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="font-heading text-base leading-tight text-primary">{t("assistant.title")}</p>
          <p className="text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">{t("assistant.subtitle")}</p>
        </div>
      </div>

      <div ref={scroller} className={cn("flex-1 space-y-4 overflow-y-auto", compact ? "py-4" : "p-5")}>
        <div className="rounded-2xl bg-secondary p-4 text-sm leading-relaxed text-foreground">{t("assistant.greeting")}</div>

        {urgent && (
          <div className="flex gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div className="text-sm leading-relaxed text-foreground">
              <p className="font-medium">{t("assistant.urgentTitle")}</p>
              <p className="mt-1 text-muted-foreground">{t("assistant.urgentBody")}</p>
            </div>
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(suggestions) ? suggestions : []).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => send(suggestion)}
                className="rounded-full border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={cn(
              "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
              message.role === "user"
                ? "ms-auto bg-primary text-primary-foreground"
                : "bg-secondary text-foreground",
            )}
          >
            {message.content}
          </div>
        ))}

        {busy && (
          <div className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:240ms]" />
            </span>
            {t("assistant.thinking")}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className={cn("border-t border-border", compact ? "pt-3" : "p-4")}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value.slice(0, 800))}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={t("assistant.placeholder")}
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label={t("assistant.send")}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <Send className="h-4 w-4 rtl:-scale-x-100" />
          </button>
        </form>
        <p className="mt-3 text-[0.68rem] leading-relaxed text-muted-foreground">{t("assistant.privacy")}</p>
        <p className="mt-1.5 text-[0.68rem] leading-relaxed text-muted-foreground">{t("assistant.disclaimer")}</p>
        {compact && (
          <Link to="/assistant" className="mt-2 inline-block text-[0.68rem] font-medium text-primary underline">
            {t("assistant.open")}
          </Link>
        )}
      </div>
    </div>
  );
}