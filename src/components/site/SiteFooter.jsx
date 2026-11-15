import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail } from "lucide-react";
import LanguageSwitcher from "@/components/site/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { isPlaceholder } from "@/lib/clinic";

export default function SiteFooter({ clinic }) {
  const { t, pick } = useI18n();
  const year = 2027;

  const explore = [
    { to: "/services", label: t("nav.services") },
    { to: "/knowledge", label: t("nav.knowledge") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];
  const patients = [
    { to: "/book", label: t("footer.book") },
    { to: "/track", label: t("footer.track") },
    { to: "/portal", label: t("footer.portal") },
    { to: "/assistant", label: "ERGAWAN AI" },
  ];

  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="container-site py-14 md:py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground">
                <span className="font-heading text-sm leading-none">EC</span>
              </span>
              <span className="font-heading text-lg tracking-tight">{pick(clinic, "name") || "Ergawan Curative Clinic"}</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/70">{t("footer.tagline")}</p>
            <div className="mt-6">
              <LanguageSwitcher className="border-white/20 bg-white/5 [&_button]:text-white/70" />
            </div>
          </div>

          <div>
            <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary-foreground/50">
              {t("footer.explore")}
            </h3>
            <ul className="mt-4 space-y-3">
              {explore.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm text-primary-foreground/80 transition-colors hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary-foreground/50">
              {t("footer.patients")}
            </h3>
            <ul className="mt-4 space-y-3">
              {patients.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm text-primary-foreground/80 transition-colors hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary-foreground/50">
              {t("footer.reach")}
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{clinic?.address || "Sample address"}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{isPlaceholder(clinic?.phone) ? "Add clinic phone" : clinic.phone}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{clinic?.email || "Add clinic email"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs leading-relaxed text-primary-foreground/60">{t("footer.disclaimer")}</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-primary-foreground/50 md:flex-row md:items-center md:justify-between">
          <p>© {year} {pick(clinic, "name") || "Ergawan Curative Clinic"}. {t("footer.rights")}</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="transition-colors hover:text-accent">{t("footer.privacy")}</Link>
            <Link to="/terms" className="transition-colors hover:text-accent">{t("footer.terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}