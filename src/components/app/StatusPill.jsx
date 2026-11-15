import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/clinic";

export default function StatusPill({ status, label, className }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.12em] ring-1",
        STATUS_STYLES[status] || "bg-secondary text-muted-foreground ring-border",
        className,
      )}
    >
      {label || STATUS_LABELS[status] || status}
    </span>
  );
}