import { useTranslation } from "react-i18next";

export function HowItWorksPage() {
  const { t } = useTranslation();
  const steps = [
    t("howItWorks.step1"),
    t("howItWorks.step2"),
    t("howItWorks.step3"),
    t("howItWorks.step4")
  ];

  return (
    <main className="mx-auto max-w-containerMax px-gutter py-12">
      <h1 className="text-3xl font-black text-primary md:text-4xl">{t("howItWorks.title")}</h1>
      <p className="mt-3 max-w-2xl text-on-surface-variant">{t("howItWorks.subtitle")}</p>
      <ol className="mt-8 grid gap-4 md:grid-cols-2">
        {steps.map((step, i) => (
          <li key={step} className="rounded-card border border-outline-variant bg-surface-low p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              {t("howItWorks.stepLabel", { n: i + 1 })}
            </p>
            <p className="mt-2 text-sm text-on-surface">{step}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}

