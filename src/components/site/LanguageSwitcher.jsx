import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher({ className }) {
  const { lang, setLang } = useI18n();

  return (
    <div
      className={cn("inline-flex items-center gap-0.5 rounded-full border border-border bg-background/70 p-0.5", className)}
      role="group"
      aria-label="Language"
    >
      {[
        { code: "en", label: "EN" },
        { code: "fa", label: "دری" },
        { code: "ps", label: "پښتو" },
      ].map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => setLang(option.code)}
          aria-pressed={lang === option.code}
          className={cn(
            "min-h-[32px] rounded-full px-2.5 text-xs font-medium transition-colors",
            lang === option.code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}