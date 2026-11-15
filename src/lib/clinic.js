// Small helpers shared by the public site, the portal and the admin centre.

/** True for an unset value or an obvious sample number such as +00 000 000 0000. */
export const isPlaceholder = (value) => !value || /0{4,}/.test(String(value).replace(/[^\d]/g, ""));

export const digitsOnly = (value) => String(value || "").replace(/[^\d]/g, "");

export const whatsappHref = (number, message) => {
  const digits = digitsOnly(number);
  if (!digits) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
};

export const telHref = (number) => (digitsOnly(number) ? `tel:${String(number).replace(/[^\d+]/g, "")}` : null);

export const formatDate = (value, lang = "en") => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const locale = lang === "en" ? "en-GB" : lang === "fa" ? "fa-AF" : "ps-AF";
  return date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
};

export const formatTime = (value) => value || "—";

/** Six-character code a patient can quote to follow up a request. */
export const makeTrackingCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
};

export const STATUS_LABELS = {
  requested: "Requested",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  declined: "Declined",
};

export const STATUS_STYLES = {
  requested: "bg-amber-50 text-amber-800 ring-amber-200",
  confirmed: "bg-teal-50 text-teal-800 ring-teal-200",
  completed: "bg-slate-50 text-slate-700 ring-slate-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
  declined: "bg-rose-50 text-rose-700 ring-rose-200",
};

export const PREFERRED_TIMES = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];