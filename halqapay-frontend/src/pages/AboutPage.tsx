import { useTranslation } from "react-i18next";

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-containerMax px-gutter py-12">
      <h1 className="text-3xl font-black text-primary md:text-4xl">{t("about.title")}</h1>
      <p className="mt-4 max-w-3xl leading-relaxed text-on-surface-variant">{t("about.body")}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-card border border-outline-variant bg-surface-low p-5">
          <h2 className="font-bold text-primary">{t("about.cards.securityTitle")}</h2>
          <p className="mt-2 text-sm text-on-surface-variant">{t("about.cards.securityBody")}</p>
        </div>
        <div className="rounded-card border border-outline-variant bg-surface-low p-5">
          <h2 className="font-bold text-primary">{t("about.cards.fairnessTitle")}</h2>
          <p className="mt-2 text-sm text-on-surface-variant">{t("about.cards.fairnessBody")}</p>
        </div>
        <div className="rounded-card border border-outline-variant bg-surface-low p-5">
          <h2 className="font-bold text-primary">{t("about.cards.regionalTitle")}</h2>
          <p className="mt-2 text-sm text-on-surface-variant">{t("about.cards.regionalBody")}</p>
        </div>
      </div>
    </main>
  );
}

