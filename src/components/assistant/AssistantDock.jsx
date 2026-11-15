import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import AssistantChat from "@/components/assistant/AssistantChat";
import { useI18n } from "@/lib/i18n";

export default function AssistantDock() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex h-[80vh] flex-col border-t border-border bg-background p-4 shadow-2xl sm:inset-x-auto sm:end-6 sm:bottom-24 sm:h-[560px] sm:w-[380px] sm:rounded-3xl sm:border">
          <AssistantChat compact />
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? t("common.close") : t("assistant.open")}
        className="fixed bottom-5 end-5 z-50 flex h-14 items-center gap-2.5 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-[0_18px_40px_-16px_rgba(10,25,47,0.7)] transition-transform hover:scale-[1.03]"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5 text-accent" />}
        <span className="hidden sm:inline">{open ? t("common.close") : "ERGAWAN AI"}</span>
      </button>
    </>
  );
}