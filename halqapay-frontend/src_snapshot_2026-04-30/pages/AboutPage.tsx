import { useTranslation } from "react-i18next";

export function AboutPage() {
  const { t } = useTranslation();

  const cards = [
    { title: t("about.cards.securityTitle"), body: t("about.cards.securityBody"), icon: "shield_lock" },
    { title: t("about.cards.fairnessTitle"), body: t("about.cards.fairnessBody"), icon: "balance" },
    { title: t("about.cards.regionalTitle"), body: t("about.cards.regionalBody"), icon: "public" }
  ];

  return (
    <div className="bg-transparent pb-32">
      {/* HEADER */}
      <section className="relative overflow-hidden px-gutter pt-16 pb-24 md:pt-32">
        <div className="mx-auto max-w-containerMax text-center">
          <div className="reveal mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-primary">
            <span className="material-symbols-outlined text-lg">workspace_premium</span>
            <span className="text-xs font-black uppercase tracking-widest">{t("nav.about")}</span>
          </div>
          <h1 className="reveal text-6xl font-black text-primary md:text-8xl tracking-tighter">
            {t("about.title")}
          </h1>
          <p className="reveal mt-8 mx-auto max-w-3xl text-2xl font-bold text-primary opacity-80 leading-relaxed">
            {t("about.body")}
          </p>
        </div>
      </section>

      {/* MISSION CARDS */}
      <section className="px-gutter">
        <div className="mx-auto max-w-containerMax">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {cards.map((card, i) => (
              <div 
                key={i} 
                style={{"--reveal-delay": `${i * 150}ms`} as any} 
                className="reveal reveal-up group"
              >
                <div className="hp-glass-card p-12 rounded-[3.5rem] shadow-2xl transition-all duration-500 hover:bg-white/25 hover:-translate-y-2 border border-white/30 h-full flex flex-col items-center text-center">
                  <div className="mb-10 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-primary text-accent shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <span className="material-symbols-outlined text-5xl">{card.icon}</span>
                  </div>
                  <h2 className="text-3xl font-black text-primary leading-tight mb-6">
                    {card.title}
                  </h2>
                  <p className="text-xl text-primary font-bold opacity-80 leading-relaxed">
                    {card.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="mt-32 px-gutter">
        <div className="mx-auto max-w-containerMax reveal hp-glass-primary p-16 rounded-[4rem] text-center shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8">
            {t("about.ctaTitle")}
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="/register" className="btn-ieee bg-accent px-12 py-5 text-xl font-black text-primary shadow-xl">
              {t("landing.ctaStart")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
