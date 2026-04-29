import { useTranslation } from "react-i18next";
import { setLocale } from "../../i18n";

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar" || i18n.language.startsWith("ar");

  return (
    <div
      className="flex items-center rounded-full border border-outline-variant bg-surface-low p-0.5 text-xs font-bold"
      role="group"
      aria-label={t("lang.switch")}
    >
      <button
        type="button"
        onClick={() => setLocale("ar")}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          isAr ? "bg-primary text-primary-on shadow-sm" : "text-on-surface-variant hover:text-primary"
        }`}
      >
        {t("lang.ar")}
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          !isAr ? "bg-primary text-primary-on shadow-sm" : "text-on-surface-variant hover:text-primary"
        }`}
      >
        {t("lang.en")}
      </button>
    </div>
  );
}
