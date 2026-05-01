import { useTranslation } from "react-i18next";

export function HowItWorksPage() {
  const { t } = useTranslation();
  
  const steps = [
    { title: t("howItWorks.step1"), icon: "person_add" },
    { title: t("howItWorks.step2"), icon: "search" },
    { title: t("howItWorks.step3"), icon: "task_alt" },
    { title: t("howItWorks.step4"), icon: "payments" }
  ];

  return (
    <div className="bg-transparent pb-32">
      {/* HEADER */}
      <section className="relative overflow-hidden px-gutter pt-16 pb-24 md:pt-32">
        <div className="mx-auto max-w-containerMax text-center">
          <div className="reveal mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-primary">
            <span className="material-symbols-outlined text-lg">info</span>
            <span className="text-xs font-black uppercase tracking-widest">{t("nav.howItWorks")}</span>
          </div>
          <h1 className="reveal text-6xl font-black text-primary md:text-8xl tracking-tighter">
            {t("howItWorks.title")}
          </h1>
          <p className="reveal mt-8 mx-auto max-w-3xl text-2xl font-bold text-primary opacity-80 leading-relaxed">
            {t("howItWorks.subtitle")}
          </p>
        </div>
      </section>

      {/* STEPS GRID */}
      <section className="px-gutter">
        <div className="mx-auto max-w-containerMax">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {steps.map((step, i) => (
              <div 
                key={i} 
                style={{"--reveal-delay": `${i * 150}ms`} as any} 
                className="reveal reveal-up group relative"
              >
                <div className="hp-glass-card p-12 rounded-[3.5rem] shadow-2xl transition-all duration-500 hover:bg-white/25 hover:-translate-y-2 border border-white/30 h-full">
                  <div className="flex items-start gap-10">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[2rem] bg-primary text-accent shadow-xl group-hover:scale-110 transition-transform duration-500">
                      <span className="material-symbols-outlined text-4xl">{step.icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-primary/40 mb-4">
                        {t("howItWorks.stepLabel", { n: i + 1 })}
                      </p>
                      <p className="text-2xl text-primary font-black leading-snug">{step.title}</p>
                    </div>
                  </div>
                </div>
                {/* CONNECTING LINE (Optional visual flair) */}
                {i < steps.length - 1 && (
                  <div className="absolute hidden lg:block -bottom-6 left-1/2 w-px h-12 bg-primary/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
