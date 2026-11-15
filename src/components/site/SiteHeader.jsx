import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/site/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

export default function SiteHeader() {
  const { t } = useI18n();
  const { user, isAuthenticated, isLoadingAuth, logout, navigateToLogin } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 12);
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/services", label: t("nav.services") },
    { to: "/knowledge", label: t("nav.knowledge") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-50">
      <div
        className={cn(
          "border-b transition-colors duration-500",
          scrolled ? "border-border/70 bg-background/85 backdrop-blur-xl" : "border-transparent bg-background/60 backdrop-blur-sm",
        )}
      >
        <div className="container-site flex h-16 items-center justify-between gap-4 md:h-20">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <span className="font-heading text-sm leading-none">EC</span>
            </span>
            <span className="leading-tight">
              <span className="block font-heading text-[0.95rem] tracking-tight">Ergawan</span>
              <span className="block text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">Curative Clinic</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.to === "/" }}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground font-medium" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher />
            {isLoadingAuth ? (
              <div className="h-9 w-20 animate-pulse rounded-full bg-muted" />
            ) : isAuthenticated ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to={user?.role === "admin" ? "/admin" : "/portal"}>
                    <LayoutDashboard className="h-4 w-4" />
                    {user?.role === "admin" ? t("nav.admin") : t("nav.portal")}
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => logout()}>
                  {t("nav.signOut")}
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigateToLogin()}>
                {t("nav.signIn")}
              </Button>
            )}
            <Button asChild size="sm" className="rounded-full">
              <Link to="/book">
                {t("nav.book")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={t("nav.menu")}
              aria-expanded={open}
              className="grid h-11 w-11 place-items-center rounded-full border border-border text-foreground"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div className="h-px w-full bg-transparent">
          <div className="h-px bg-accent transition-[width] duration-150" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {open && (
        <div className="border-b border-border bg-background md:hidden">
          <nav className="container-site flex flex-col py-3">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] items-center border-b border-border/60 text-sm text-foreground last:border-0"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 pb-2">
              <Button asChild className="rounded-full">
                <Link to="/book" onClick={() => setOpen(false)}>
                  {t("nav.book")}
                </Link>
              </Button>
              {isAuthenticated ? (
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <Link to={user?.role === "admin" ? "/admin" : "/portal"} onClick={() => setOpen(false)}>
                      {user?.role === "admin" ? t("nav.admin") : t("nav.portal")}
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={() => logout()}>
                    {t("nav.signOut")}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    navigateToLogin();
                  }}
                >
                  {t("nav.signIn")}
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}