import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore";

export function AboutPage() {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);

  const cards = [
    { title: t("about.cards.securityTitle"), body: t("about.cards.securityBody"), icon: "shield_lock",  color: "bg-blue-500/10 text-blue-700" },
    { title: t("about.cards.fairnessTitle"), body: t("about.cards.fairnessBody"), icon: "balance",      color: "bg-accent/15 text-primary" },
    { title: t("about.cards.regionalTitle"), body: t("about.cards.regionalBody"), icon: "public",       color: "bg-green-500/10 text-green-700" },
  ];

  return (
    <div className="bg-transparent min-h-screen pb-32">
      <section className="page-hero-bg px-gutter pt-28 pb-32 md:pt-36">
        <img
          src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=70"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.10] mix-blend-luminosity pointer-events-none select-none animate-slow-zoom"
        />
        <div className="mx-auto max-w-containerMax text-center">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04] animate-spin-slow" />
            <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/[0.07]" />
          </div>

          <div className="relative z-10">
            <div className="reveal mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-white/80 backdrop-blur-sm ring-1 ring-white/15">
              <span className="material-symbols-outlined text-lg text-accent">workspace_premium</span>
              <span className="text-xs font-black uppercase tracking-widest">{t("nav.about")}</span>
            </div>
            <h1 className="reveal text-6xl font-black text-white md:text-8xl tracking-tighter leading-none">
              {t("about.title")}
            </h1>
            <p className="reveal mt-8 mx-auto max-w-2xl text-xl font-semibold text-white/60 leading-relaxed">
              {t("about.body")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Mission cards (overlap hero) ── */}
      <section className="relative px-gutter -mt-16">
        {/* Floating symbols in white area */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {([
            { sym: "₿", x: "1%",  top: "8%",  size: "2rem",   dur: "20s", delay: "0s",  rot: "-8deg",  op: "0.04", color: "#002645" },
            { sym: "$", x: "94%", top: "6%",  size: "1.8rem", dur: "18s", delay: "3s",  rot: "12deg",  op: "0.04", color: "#fed65b" },
            { sym: "€", x: "91%", top: "58%", size: "1.6rem", dur: "22s", delay: "1s",  rot: "-6deg",  op: "0.04", color: "#002645" },
            { sym: "↗", x: "2%",  top: "62%", size: "1.4rem", dur: "16s", delay: "5s",  rot: "0deg",   op: "0.05", color: "#002645" },
            { sym: "₹", x: "50%", top: "92%", size: "1.3rem", dur: "24s", delay: "7s",  rot: "8deg",   op: "0.03", color: "#fed65b" },
          ] as const).map(({ sym, x, top, size, dur, delay, rot, op, color }, i) => (
            <span key={i} className="float-symbol" style={{ left: x, top, fontSize: size, color, "--fs-dur": dur, "--fs-delay": delay, "--fs-rot": rot, "--fs-op": op } as React.CSSProperties}>{sym}</span>
          ))}
          <div className="absolute right-12 top-12 h-[180px] w-[180px] rounded-full border border-primary/[0.04] animate-spin-slow" />
          <div className="absolute left-6 bottom-28 h-[120px] w-[120px] rounded-full border border-accent/[0.05] animate-pulse-slow" />
          <div className="absolute left-1/3 bottom-10 h-[70px] w-[70px] rounded-full bg-accent/[0.03] animate-blob" />
        </div>
        <div className="mx-auto max-w-containerMax relative z-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {cards.map((card, i) => (
              <div
                key={i}
                style={{ "--reveal-delay": `${i * 150}ms` } as React.CSSProperties}
                className="reveal reveal-up group"
              >
                <div className="hp-glass-card card-hover-lift h-full p-10 rounded-[2.5rem] flex flex-col items-center text-center">
                  <div className={`mb-8 flex h-20 w-20 items-center justify-center rounded-[2rem] ${card.color} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    <span className="material-symbols-outlined text-4xl">{card.icon}</span>
                  </div>
                  <h2 className="text-2xl font-black text-primary leading-tight mb-4">
                    {card.title}
                  </h2>
                  <p className="text-base text-primary/70 font-semibold leading-relaxed">
                    {card.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="mt-20 px-gutter">
        <div className="mx-auto max-w-containerMax">
          <div className="reveal hp-glass-primary rounded-[3rem] overflow-hidden relative">
            {/* Decorative blob */}
            <div aria-hidden="true" className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-2xl" />
            <div className="relative z-10 grid divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
              {[
                { label: t("landing.metrics.membersLabel"), value: t("landing.metrics.membersValue"), icon: "savings" },
                { label: t("landing.metrics.payoutLabel"),  value: t("landing.metrics.payoutValue"),  icon: "payments" },
                { label: t("about.cards.regionalTitle"),    value: t("about.cards.regionalStat"),     icon: "language" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-5 p-8 md:p-10">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                    <span className="material-symbols-outlined text-accent text-2xl">{stat.icon}</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                    <p className="text-xs font-black uppercase tracking-widest text-white/50 mt-0.5">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!token && (
        <section className="mt-20 px-gutter">
          <div className="mx-auto max-w-containerMax reveal text-center">
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-8 leading-tight">
              {t("about.ctaTitle")}
            </h2>
            <a
              href="/register"
              className="btn-ieee btn-shimmer inline-flex items-center gap-3 rounded-[2rem] bg-primary px-14 py-5 text-xl font-black text-white shadow-2xl"
            >
              {t("landing.ctaStart")}
              <span className="material-symbols-outlined text-accent text-2xl">arrow_forward</span>
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
