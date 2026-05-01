import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-primary-container/40 bg-primary py-10 text-primary-on">
      <div className="mx-auto flex max-w-containerMax flex-col gap-6 px-gutter md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2">
            <img src="/halqapay.png" alt="HalqaPay logo" className="h-8 w-8 rounded-md object-contain" />
            <p className="text-xl font-black tracking-tight text-primary-on">HalqaPay</p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            {t("footer.tagline")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm md:grid-cols-3">
          <div className="space-y-2">
            <p className="font-bold text-primary-on">{t("footer.product")}</p>
            <Link to="/circles" className="interactive-link block text-white/80 hover:text-white hover:underline">
              {t("footer.links.circles")}
            </Link>
            <Link to="/how-it-works" className="interactive-link block text-white/80 hover:text-white hover:underline">
              {t("footer.links.howItWorks")}
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-primary-on">{t("footer.company")}</p>
            <Link to="/about" className="interactive-link block text-white/80 hover:text-white hover:underline">
              {t("footer.links.about")}
            </Link>
            <Link to="/contact" className="interactive-link block text-white/80 hover:text-white hover:underline">
              {t("footer.links.contact")}
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-primary-on">{t("footer.legal")}</p>
            <Link to="/privacy" className="interactive-link block text-white/80 hover:text-white hover:underline">
              {t("footer.links.privacy")}
            </Link>
            <Link to="/terms" className="interactive-link block text-white/80 hover:text-white hover:underline">
              {t("footer.links.terms")}
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-containerMax border-t border-white/20 px-gutter pt-4 text-xs text-white/70">
        {t("footer.copyright")}
      </div>
    </footer>
  );
}

