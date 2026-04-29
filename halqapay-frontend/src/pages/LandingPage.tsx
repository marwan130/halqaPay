import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore";

export function LandingPage() {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);

  const steps = [
    {
      title: t("landing.step1Title"),
      body: t("landing.step1Body"),
      icon: "person_add"
    },
    {
      title: t("landing.step2Title"),
      body: t("landing.step2Body"),
      icon: "search"
    },
    {
      title: t("landing.step3Title"),
      body: t("landing.step3Body"),
      icon: "task_alt"
    },
    {
      title: t("landing.step4Title"),
      body: t("landing.step4Body"),
      icon: "payments"
    }
  ];
  const approachItems = [
    {
      title: t("landing.approach.transparencyTitle"),
      body: t("landing.approach.transparencyBody"),
      icon: "visibility"
    },
    {
      title: t("landing.approach.eligibilityTitle"),
      body: t("landing.approach.eligibilityBody"),
      icon: "query_stats"
    },
    {
      title: t("landing.approach.automationTitle"),
      body: t("landing.approach.automationBody"),
      icon: "autorenew"
    }
  ];
  const rightsItems = [
    t("landing.rights.item1"),
    t("landing.rights.item2"),
    t("landing.rights.item3")
  ];

  return (
    <div className="bg-transparent">
      <section className="landing-hero-bg relative -mt-20 overflow-hidden border-b border-outline-variant/70 bg-transparent px-gutter pb-16 pt-28 md:px-10 md:pb-20 md:pt-32">
        <div className="pointer-events-none absolute -top-24 -start-24 h-64 w-64 rounded-full bg-secondary-container/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -end-16 h-72 w-72 rounded-full bg-primary-fixed/40 blur-3xl" />
        <div className="relative z-10 mx-auto grid max-w-containerMax grid-cols-1 items-center gap-stack-lg md:grid-cols-2 md:pt-6">
          <div className="space-y-stack-md">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary-container/80 px-3 py-1 text-primary shadow-sm backdrop-blur-sm">
              <span
                className="material-symbols-outlined text-base"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">
                {t("landing.badge")}
              </span>
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-primary md:text-5xl">
              {t("landing.heroTitle")}{" "}
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-on-surface-variant">
              {t("landing.heroSubtitle")}
            </p>
            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              {token ? (
                <Link
                  to="/dashboard"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-primary px-8 py-3 text-center text-sm font-bold text-primary-on shadow-card transition-transform active:scale-[0.98]"
                >
                  {t("landing.ctaDashboard")}
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-primary px-8 py-3 text-center text-sm font-bold text-primary-on shadow-card transition-transform active:scale-[0.98]"
                >
                  {t("landing.ctaStart")}
                </Link>
              )}
              <Link
                to="/how-it-works"
                className="inline-flex min-h-[48px] items-center justify-center rounded-lg border-2 border-primary px-8 py-3 text-center text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-secondary-container"
              >
                {t("landing.ctaLearn")}
              </Link>
            </div>
          </div>
          <div className="relative mt-10 md:mt-0">
            <div className="hero-gradient hero-card-image relative overflow-hidden rounded-3xl shadow-cardLg">
              <div className="aspect-[4/5] p-8 text-primary-on md:aspect-square">
                <p className="text-sm font-bold opacity-80">HalqaPay</p>
                <p className="mt-6 text-2xl font-black leading-snug">{t("landing.frameworkTitle")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-transparent py-20">
        <div className="mx-auto max-w-containerMax px-gutter">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold text-primary md:text-4xl">
              {t("landing.frameworkTitle")}
            </h2>
            <p className="mx-auto max-w-2xl text-on-surface-variant">
              {t("landing.frameworkSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div
                key={s.title}
                className="landing-glass-card landing-glass-card-yellow flex flex-col items-center rounded-card border border-secondary-container/35 p-6 text-center shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-cardLg"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-secondary-container">
                  <span className="material-symbols-outlined text-3xl">{s.icon}</span>
                </div>
                <h3 className="mb-3 text-lg font-bold text-primary">{s.title}</h3>
                <p className="text-sm leading-relaxed text-primary/85">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-outline-variant/70 bg-transparent py-16">
        <div className="mx-auto grid max-w-containerMax grid-cols-1 gap-8 px-gutter lg:grid-cols-2">
          <article className="landing-glass-card landing-glass-card-blue rounded-card border border-transparent p-7 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-cardLg">
            <h3 className="text-2xl font-bold text-secondary-container">{t("landing.platformTitle")}</h3>
            <p className="mt-4 leading-relaxed text-secondary-container/85">{t("landing.platformBody")}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-secondary-container/80">
                  {t("landing.metrics.membersLabel")}
                </p>
                <p className="mt-1 text-xl font-black text-secondary-container">{t("landing.metrics.membersValue")}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-secondary-container/80">
                  {t("landing.metrics.payoutLabel")}
                </p>
                <p className="mt-1 text-xl font-black text-secondary-container">{t("landing.metrics.payoutValue")}</p>
              </div>
            </div>
          </article>

          <article className="landing-glass-card landing-glass-card-yellow rounded-card border border-secondary-container/35 p-7 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-cardLg">
            <h3 className="text-2xl font-bold text-primary">{t("landing.approach.title")}</h3>
            <div className="mt-5 space-y-4">
              {approachItems.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-xl bg-white/45 p-4 backdrop-blur-sm transition-colors hover:bg-white/65">
                  <span className="material-symbols-outlined mt-0.5 text-primary">{item.icon}</span>
                  <div>
                    <p className="font-bold text-primary">{item.title}</p>
                    <p className="mt-1 text-sm text-primary/85">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="border-t border-outline-variant/70 bg-transparent py-14">
        <div className="mx-auto max-w-containerMax px-gutter">
          <div className="landing-glass-card rounded-2xl border border-primary-container/30 bg-white/55 p-7 shadow-card backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-cardLg">
            <h3 className="text-2xl font-bold text-primary">{t("landing.rights.title")}</h3>
            <p className="mt-3 leading-relaxed text-on-surface-variant">{t("landing.rights.subtitle")}</p>
            <ul className="mt-5 space-y-3">
              {rightsItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-on-surface">
                  <span className="material-symbols-outlined text-base text-secondary">check_circle</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/terms"
                className="interactive-link rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-secondary-container"
              >
                {t("landing.rights.readTerms")}
              </Link>
              <Link
                to="/privacy"
                className="interactive-link rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-secondary-container"
              >
                {t("landing.rights.readPrivacy")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
