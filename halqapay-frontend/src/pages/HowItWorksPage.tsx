import { useTranslation } from "react-i18next";

export function HowItWorksPage() {
  const { t } = useTranslation();

  const steps = [
    { title: t("howItWorks.step1"), icon: "person_add",  color: "from-blue-500/20 to-blue-600/10" },
    { title: t("howItWorks.step2"), icon: "search",      color: "from-accent/20 to-yellow-400/10" },
    { title: t("howItWorks.step3"), icon: "task_alt",    color: "from-green-500/20 to-green-600/10" },
    { title: t("howItWorks.step4"), icon: "payments",    color: "from-purple-500/20 to-purple-600/10" },
  ];

  return (
    <div className="bg-transparent min-h-screen pb-32">
      <section className="page-hero-bg px-gutter pt-28 pb-32 md:pt-36">
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=70"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.09] mix-blend-luminosity pointer-events-none select-none animate-slow-zoom"
        />
        <div className="mx-auto max-w-containerMax text-center relative">
          {/* Animated grid lines */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
            <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
            <div className="absolute left-3/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
            {/* Rotating ring */}
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/[0.06] animate-spin-slow" />
          </div>

          <div className="relative z-10">
            <div className="reveal mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-white/80 backdrop-blur-sm ring-1 ring-white/15">
              <span className="material-symbols-outlined text-lg text-accent">info</span>
              <span className="text-xs font-black uppercase tracking-widest">{t("nav.howItWorks")}</span>
            </div>
            <h1 className="reveal text-6xl font-black text-white md:text-8xl tracking-tighter leading-none">
              {t("howItWorks.title")}
            </h1>
            <p className="reveal mt-8 mx-auto max-w-2xl text-xl font-semibold text-white/60 leading-relaxed">
              {t("howItWorks.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Steps grid (overlap hero) ── */}
      <section className="relative px-gutter -mt-16">
        {/* Floating symbols in white area */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {([
            { sym: "₿", x: "1%",  top: "10%", size: "2rem",   dur: "20s", delay: "0s",  rot: "-8deg",  op: "0.04", color: "#002645" },
            { sym: "$", x: "94%", top: "8%",  size: "1.8rem", dur: "18s", delay: "3s",  rot: "12deg",  op: "0.04", color: "#fed65b" },
            { sym: "€", x: "91%", top: "55%", size: "1.6rem", dur: "22s", delay: "1s",  rot: "-6deg",  op: "0.04", color: "#002645" },
            { sym: "↗", x: "2%",  top: "60%", size: "1.4rem", dur: "16s", delay: "5s",  rot: "0deg",   op: "0.05", color: "#002645" },
            { sym: "%", x: "48%", top: "90%", size: "1.3rem", dur: "24s", delay: "7s",  rot: "-10deg", op: "0.03", color: "#fed65b" },
          ] as const).map(({ sym, x, top, size, dur, delay, rot, op, color }, i) => (
            <span key={i} className="float-symbol" style={{ left: x, top, fontSize: size, color, "--fs-dur": dur, "--fs-delay": delay, "--fs-rot": rot, "--fs-op": op } as React.CSSProperties}>{sym}</span>
          ))}
          <div className="absolute right-10 top-16 h-[180px] w-[180px] rounded-full border border-primary/[0.04] animate-spin-slow" />
          <div className="absolute left-6 bottom-24 h-[120px] w-[120px] rounded-full border border-accent/[0.05] animate-pulse-slow" />
          <div className="absolute right-1/3 bottom-10 h-[70px] w-[70px] rounded-full bg-accent/[0.03] animate-blob" />
        </div>
        <div className="mx-auto max-w-containerMax relative z-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {steps.map((step, i) => (
              <div
                key={i}
                style={{ "--reveal-delay": `${i * 120}ms` } as React.CSSProperties}
                className="reveal reveal-up group relative"
              >
                <div className="hp-glass-card card-hover-lift p-10 rounded-[2.5rem] h-full">
                  {/* Large step numeral */}
                  <div className="mb-6 flex items-start gap-6">
                    <span className="gradient-text-gold text-7xl font-black leading-none tabular-nums select-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} group-hover:scale-110 transition-transform duration-500`}>
                      <span className="material-symbols-outlined text-primary text-2xl">{step.icon}</span>
                    </div>
                  </div>

                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/30 mb-3">
                    {t("howItWorks.stepLabel", { n: i + 1 })}
                  </p>
                  <p className="text-2xl font-black text-primary leading-snug">
                    {step.title}
                  </p>

                  {/* Connector line between steps */}
                  {i % 2 === 0 && i < steps.length - 1 && (
                    <div className="absolute hidden md:block top-1/2 -right-4 w-8 h-px bg-primary/10 z-10" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="mt-20 px-gutter">
        <div className="mx-auto max-w-containerMax">
          <div className="reveal hp-glass-primary rounded-[3rem] p-14 text-center relative overflow-hidden">
            <div aria-hidden="true" className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/10 blur-2xl" />
            <div aria-hidden="true" className="absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-white/5 blur-xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                {t("about.ctaTitle")}
              </h2>
              <p className="text-white/60 mb-8 max-w-lg mx-auto font-semibold">
                {t("landing.heroSubtitle")}
              </p>
              <a
                href="/register"
                className="btn-ieee btn-shimmer inline-flex items-center gap-3 rounded-[2rem] bg-accent px-12 py-4 text-lg font-black text-primary shadow-2xl"
              >
                {t("landing.ctaStart")}
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
