import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* colour-change on hover, but no underline wipe */
const footerLink =
  "block text-white/65 hover:text-accent transition-colors duration-200 leading-relaxed";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative bg-primary text-primary-on overflow-hidden">
      {/* ── Organic wavy blob transition from page into footer ── */}
      <div className="pointer-events-none" aria-hidden="true">
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full block"
          style={{ height: "100px", marginBottom: "-2px", display: "block" }}
        >
          {/* Organic blob wave filled with page bg colour */}
          <path
            d="M0,70 C180,20 360,100 540,55 C720,10 900,90 1080,45 C1260,0 1380,60 1440,40 L1440,0 L0,0 Z"
            fill="#eef2f7"
          />
        </svg>
      </div>

      {/* ── Decorative animated circles / rings (more of them) ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large slow-spin outer ring */}
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full border border-white/[0.04] animate-spin-slow" />
        {/* Inner pulsing blob */}
        <div className="absolute -top-20 -left-20 h-[320px] w-[320px] rounded-full border border-accent/[0.06] animate-pulse-slow" />
        {/* Right-side floating orb */}
        <div className="absolute top-1/4 -right-20 h-[380px] w-[380px] rounded-full bg-accent/[0.04] animate-float" />
        {/* Bottom-left blob */}
        <div className="absolute bottom-0 left-1/3 h-[200px] w-[200px] rounded-full bg-white/[0.03] animate-pulse-slow" />
        {/* Mid blob */}
        <div className="absolute bottom-10 right-1/4 h-[160px] w-[160px] rounded-full border border-white/[0.05] animate-blob" />
        {/* Accent orb */}
        <div className="absolute top-1/2 left-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.3] blur-3xl animate-spin-slow" style={{ animationDirection: "reverse" }} />
      </div>

      <div className="relative z-10 mx-auto flex max-w-containerMax flex-col gap-8 px-gutter pt-4 pb-10 md:flex-row md:items-start md:justify-between">
        {/* Brand */}
        <div className="max-w-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <img src="/halqapay.png" alt="HalqaPay logo" className="h-8 w-8 rounded-md object-contain" />
            </div>
            <p className="text-xl font-black tracking-tight text-white">HalqaPay</p>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/60">{t("footer.tagline")}</p>
          <div className="mt-5 h-px w-24 bg-gradient-to-r from-accent to-transparent" />
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-8 text-sm md:grid-cols-3">
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-accent/80">{t("footer.product")}</p>
            <Link to="/circles"     className={footerLink}>{t("footer.links.circles")}</Link>
            <Link to="/how-it-works" className={footerLink}>{t("footer.links.howItWorks")}</Link>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-accent/80">{t("footer.company")}</p>
            <Link to="/about"   className={footerLink}>{t("footer.links.about")}</Link>
            <Link to="/contact" className={footerLink}>{t("footer.links.contact")}</Link>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-accent/80">{t("footer.legal")}</p>
            <Link to="/privacy" className={footerLink}>{t("footer.links.privacy")}</Link>
            <Link to="/terms"   className={footerLink}>{t("footer.links.terms")}</Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-containerMax border-t border-white/10 px-gutter py-4">
        <p className="text-xs text-white/40">{t("footer.copyright")}</p>
      </div>
    </footer>
  );
}
