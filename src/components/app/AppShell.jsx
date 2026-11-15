import { Link } from "@tanstack/react-router";
import { ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/site/LanguageSwitcher";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

export default function AppShell({ nav = [], children, eyebrow, title, actions }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="container-site flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
                <span className="font-heading text-xs">EC</span>
              </span>
              <span className="hidden font-heading text-sm sm:block">Ergawan</span>
            </Link>
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              Website
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <span className="hidden max-w-[180px] truncate text-xs text-muted-foreground md:block">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="h-4 w-4 rtl:-scale-x-100" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container-site flex flex-col gap-8 py-8 lg:flex-row lg:py-12">
        <aside className="lg:w-56 lg:shrink-0">
          <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:sticky lg:top-24 lg:flex-col lg:overflow-visible">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  className={cn(
                    "flex min-h-[42px] shrink-0 items-center gap-2.5 rounded-full px-4 text-sm text-muted-foreground transition-colors lg:rounded-xl",
                    "hover:bg-background hover:text-foreground",
                  )}
                  activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" }}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
              <h1 className="display-title mt-2 text-[clamp(1.7rem,1.2rem+1.6vw,2.4rem)] leading-tight text-primary">
                {title}
              </h1>
            </div>
            {actions}
          </div>
          <div className="mt-8">{children}</div>
        </main>
      </div>
    </div>
  );
}