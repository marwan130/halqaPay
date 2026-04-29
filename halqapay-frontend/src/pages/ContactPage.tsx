import { useTranslation } from "react-i18next";

export function ContactPage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-containerMax px-gutter py-12">
      <h1 className="text-3xl font-black text-primary md:text-4xl">{t("contact.title")}</h1>
      <p className="mt-3 max-w-2xl text-on-surface-variant">{t("contact.subtitle")}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-card border border-outline-variant bg-surface-low p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            {t("contact.emailLabel")}
          </p>
          <p className="mt-2 text-sm text-on-surface">{t("contact.emailValue")}</p>
        </div>
        <div className="rounded-card border border-outline-variant bg-surface-low p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            {t("contact.phoneLabel")}
          </p>
          <p className="mt-2 text-sm text-on-surface">{t("contact.phoneValue")}</p>
        </div>
        <div className="rounded-card border border-outline-variant bg-surface-low p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            {t("contact.hoursLabel")}
          </p>
          <p className="mt-2 text-sm text-on-surface">{t("contact.hoursValue")}</p>
        </div>
      </div>
    </main>
  );
}

