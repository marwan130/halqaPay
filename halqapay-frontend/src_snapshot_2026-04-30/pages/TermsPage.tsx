import { useTranslation } from "react-i18next";

export function TermsPage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-containerMax px-gutter py-12">
      <h1 className="text-3xl font-black text-primary md:text-4xl">{t("terms.title")}</h1>
      <p className="mt-4 whitespace-pre-line leading-relaxed text-on-surface-variant">
        {t("terms.body")}
      </p>
    </main>
  );
}

