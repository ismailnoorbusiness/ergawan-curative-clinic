import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { useI18n } from "@/lib/i18n";

const PHOTOS = [
  { src: "https://media.base44.com/images/public/6aef8119b05db231bc90d6cf/2c98e4c79_generated_image.png", alt: "hero.img1" },
  { src: "https://media.base44.com/images/public/6aef8119b05db231bc90d6cf/701b7dc86_generated_image.png", alt: "hero.img2" },
  { src: "https://media.base44.com/images/public/6aef8119b05db231bc90d6cf/ee2d64e56_generated_image.png", alt: "hero.img3" },
];

// Letters are only split for Latin script — Arabic-script letters are joined and must stay whole.
function splitTitle(title) {
  return title.split("").map((char, index) =>
    char === " " ? (
      <span key={`space-${index}`}> </span>
    ) : (
      <span key={`${char}-${index}`} className="hero-letter" style={{ "--hero-i": index }}>
        {char}
      </span>
    ),
  );
}

export default function Hero() {
  const { t, lang } = useI18n();
  const title = t("hero.title");

  return (
    <section aria-label={t("hero.eyebrow")} className="relative overflow-hidden bg-secondary">
      <div className="container-site flex flex-col items-center pt-12 md:pt-20">
        <span className="eyebrow hero-anim-rise">
          <BadgeCheck className="h-3.5 w-3.5 text-accent" />
          {t("hero.eyebrow")}
        </span>

        <h1
          className="display-title hero-anim-rise mt-6 max-w-4xl text-center text-[clamp(2.35rem,1.35rem+4.4vw,4.4rem)] leading-[1.08] text-primary"
          style={{ animationDelay: "0.05s" }}
        >
          {lang === "en" ? splitTitle(title) : title}
        </h1>

        <p
          className="hero-anim-rise mt-6 max-w-xl text-center text-[1.0625rem] leading-relaxed text-muted-foreground"
          style={{ animationDelay: "0.18s" }}
        >
          {t("hero.subtitle")}
        </p>

        <div
          className="hero-anim-rise mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center"
          style={{ animationDelay: "0.3s" }}
        >
          <Button asChild size="lg" className="h-12 rounded-full px-7 text-[0.95rem]">
            <Link to="/book">
              {t("hero.ctaPrimary")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-primary/20 px-7 text-[0.95rem]">
            <Link to="/assistant">
              <Sparkles className="h-4 w-4 text-accent" />
              {t("hero.ctaSecondary")}
            </Link>
          </Button>
        </div>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
          {["hero.trust1", "hero.trust2", "hero.trust3"].map((key) => (
            <li key={key} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {t(key)}
            </li>
          ))}
        </ul>
      </div>

      <div className="container-site mt-12 md:mt-14">
        <div className="hero-gallery">
          {PHOTOS.map((photo, index) => (
            <div key={photo.src} className={index === 1 ? "hero-photo hero-photo--2" : "hero-photo"}>
              <div
                className="hero-photo-frame hero-anim-photo"
                style={{ animationDelay: `${0.42 + index * 0.12}s` }}
              >
                <Image src={photo.src} alt={t(photo.alt)} className="h-full w-full" fittingType="fill" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}