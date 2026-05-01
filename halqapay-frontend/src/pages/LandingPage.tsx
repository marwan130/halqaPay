import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore";
import { useState } from "react";

export function LandingPage() {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const pillars = [
    { title: t("landing.pillar1Title"), body: t("landing.pillar1Body"), icon: "account_balance" },
    { title: t("landing.pillar2Title"), body: t("landing.pillar2Body"), icon: "group_off" },
    { title: t("landing.pillar3Title"), body: t("landing.pillar3Body"), icon: "trending_up" }
  ];

  const features = [
    { title: t("landing.features.p1Title"), body: t("landing.features.p1Body"), icon: "auto_mode" },
    { title: t("landing.features.p2Title"), body: t("landing.features.p2Body"), icon: "verified" },
    { title: t("landing.features.p3Title"), body: t("landing.features.p3Body"), icon: "published_with_changes" },
    { title: t("landing.features.p4Title"), body: t("landing.features.p4Body"), icon: "account_balance_wallet" }
  ];

  const steps = [
    { title: t("landing.step1Title"), body: t("landing.step1Body"), icon: "person_add" },
    { title: t("landing.step2Title"), body: t("landing.step2Body"), icon: "search" },
    { title: t("landing.step3Title"), body: t("landing.step3Body"), icon: "task_alt" },
    { title: t("landing.step4Title"), body: t("landing.step4Body"), icon: "payments" }
  ];

  const approachItems = [
    { title: t("landing.approach.transparencyTitle"), body: t("landing.approach.transparencyBody"), icon: "visibility" },
    { title: t("landing.approach.eligibilityTitle"), body: t("landing.approach.eligibilityBody"), icon: "fact_check" },
    { title: t("landing.approach.automationTitle"), body: t("landing.approach.automationBody"), icon: "auto_mode" }
  ];

  const forWhom = [
    { title: t("landing.forWhom.indivTitle"), body: t("landing.forWhom.indivBody"), icon: "person" },
    { title: t("landing.forWhom.groupTitle"), body: t("landing.forWhom.groupBody"), icon: "groups" }
  ];

  return (
    <div className="bg-transparent font-sans min-h-screen">
      <section className="relative overflow-hidden px-gutter pb-24 pt-28 md:pt-40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { sym: "₿", x: "8%",  top: "75%", size: "3.5rem", dur: "16s", delay: "0s",    rot: "-12deg", op: "0.08", color: "#fed65b" },
          { sym: "$", x: "18%", top: "60%", size: "5rem",   dur: "20s", delay: "2.5s",  rot: "8deg",   op: "0.06", color: "#002645" },
          { sym: "€", x: "72%", top: "80%", size: "4rem",   dur: "18s", delay: "1s",    rot: "-6deg",  op: "0.07", color: "#002645" },
          { sym: "£", x: "85%", top: "65%", size: "2.8rem", dur: "14s", delay: "4s",    rot: "15deg",  op: "0.07", color: "#fed65b" },
          { sym: "¥", x: "55%", top: "85%", size: "3rem",   dur: "22s", delay: "1.8s",  rot: "-8deg",  op: "0.05", color: "#002645" },
          { sym: "₹", x: "40%", top: "70%", size: "2.5rem", dur: "17s", delay: "3.2s",  rot: "10deg",  op: "0.06", color: "#002645" },
          { sym: "₪", x: "92%", top: "50%", size: "2rem",   dur: "13s", delay: "5s",    rot: "-18deg", op: "0.05", color: "#fed65b" },
          { sym: "€", x: "62%", top: "55%", size: "2rem",   dur: "19s", delay: "6s",    rot: "5deg",   op: "0.04", color: "#002645" },
          { sym: "₿", x: "30%", top: "90%", size: "2rem",   dur: "25s", delay: "7.5s",  rot: "-3deg",  op: "0.04", color: "#fed65b" },
          { sym: "↑", x: "12%", top: "40%", size: "3rem",   dur: "15s", delay: "0.5s",  rot: "0deg",   op: "0.09", color: "#006d3d" },
          { sym: "↗", x: "25%", top: "50%", size: "2.5rem", dur: "21s", delay: "3s",    rot: "0deg",   op: "0.07", color: "#006d3d" },
          { sym: "%", x: "78%", top: "40%", size: "3.5rem", dur: "18s", delay: "2s",    rot: "-10deg", op: "0.06", color: "#002645" },
          { sym: "↑", x: "90%", top: "75%", size: "2rem",   dur: "12s", delay: "8s",    rot: "5deg",   op: "0.07", color: "#006d3d" },
          { sym: "↗", x: "50%", top: "45%", size: "2rem",   dur: "24s", delay: "9s",    rot: "0deg",   op: "0.05", color: "#006d3d" },
        ].map(({ sym, x, top, size, dur, delay, rot, op, color }, i) => (
          <span
            key={i}
            className="float-symbol"
            style={{
              left: x,
              top,
              fontSize: size,
              color,
              "--fs-dur": dur,
              "--fs-delay": delay,
              "--fs-rot": rot,
              "--fs-op": op,
            } as React.CSSProperties}
          >
            {sym}
          </span>
        ))}

        {/* Extra interactive rings that move with scroll — using the ambient orb style */}
        <div className="absolute top-1/3 right-1/4 h-[220px] w-[220px] rounded-full border border-primary/[0.04] animate-spin-slow" />
        <div className="absolute bottom-1/4 left-1/5 h-[160px] w-[160px] rounded-full border border-accent/[0.06] animate-pulse-slow" />
        <div className="absolute top-2/3 right-1/3 h-[100px] w-[100px] rounded-full bg-accent/[0.04] animate-blob" />
      </div>

      <div className="mx-auto grid max-w-containerMax grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="reveal space-y-10 text-left">
            <div className="hp-pill inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="text-xs font-black uppercase tracking-widest">{t("landing.badge")}</span>
            </div>
            <h1 className="text-6xl font-black leading-[1] tracking-tighter text-primary md:text-8xl">
              {t("landing.heroTitle")}
            </h1>
            <p className="max-w-xl text-2xl leading-relaxed text-primary font-medium opacity-90">
              {t("landing.heroSubtitle")}
            </p>
            <div className="flex flex-col gap-5 pt-8 sm:flex-row">
              {token ? (
                <Link to="/dashboard" className="btn-ieee inline-flex min-h-[72px] items-center justify-center rounded-[2rem] bg-primary px-14 py-6 text-center text-2xl font-black text-white shadow-2xl active:scale-95">
                  {t("landing.ctaDashboard")}
                </Link>
              ) : (
                <Link to="/register" className="btn-ieee inline-flex min-h-[72px] items-center justify-center rounded-[2rem] bg-primary px-14 py-6 text-center text-2xl font-black text-white shadow-2xl active:scale-95">
                  {t("landing.ctaStart")}
                </Link>
              )}
              <Link to="/how-it-works" className="btn-ieee hp-glass-card inline-flex min-h-[72px] items-center justify-center rounded-[2rem] px-14 py-6 text-center text-2xl font-black text-primary transition-all hover:bg-slate-50">
                {t("landing.ctaLearn")}
              </Link>
            </div>
          </div>

          <div className="reveal reveal-right relative group">
            {/* HERO IMAGE */}
            <div className="rounded-[4rem] shadow-2xl transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_80px_150px_-30px_rgba(0,38,69,0.5)] overflow-hidden">
              <div className="image-ieee-container bg-primary/95 relative z-10 aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200"
                  className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-primary/20 pointer-events-none" />
                <div className="absolute inset-0 p-12 text-white pointer-events-none flex flex-col justify-end">
                  <div className="reveal space-y-2">
                    <p className="text-xl font-bold opacity-80 tracking-wide uppercase text-xs">{t("landing.platformLabel")}</p>
                    <p className="text-4xl font-black leading-tight tracking-tight">{t("landing.frameworkTitle")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS SECTION */}
      <section className="relative overflow-hidden py-32 bg-[#eef2f7] border-y border-slate-200/60">
        <div className="mx-auto max-w-containerMax px-gutter">
          <div className="reveal mb-20 text-center">
            <h2 className="text-5xl font-black text-primary md:text-6xl">{t("landing.whyTitle")}</h2>
            <p className="mt-6 text-2xl text-primary font-bold">{t("landing.whySubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {pillars.map((p, i) => (
              <div key={i} style={{ "--reveal-delay": `${i * 150}ms` } as any} className="reveal reveal-up flex flex-col items-center text-center p-8">
                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-accent text-primary shadow-lg">
                  <span className="material-symbols-outlined text-4xl">{p.icon}</span>
                </div>
                <h3 className="mb-5 text-3xl font-black text-primary">{p.title}</h3>
                <p className="text-xl text-primary leading-relaxed font-bold opacity-80">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative overflow-hidden py-40">
        <div className="mx-auto max-w-containerMax px-gutter">
          <div className="reveal mb-24 text-center">
            <h2 className="text-6xl font-black text-primary md:text-7xl">{t("landing.features.title")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div key={i} style={{ "--reveal-delay": `${i * 120}ms` } as any} className="reveal reveal-up group hp-glass-card p-12 text-left rounded-[3rem]">
                <div className="mb-10 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-white transition-transform group-hover:scale-110 shadow-lg">
                  <span className="material-symbols-outlined text-4xl">{f.icon}</span>
                </div>
                <h3 className="mb-5 text-2xl font-black text-primary leading-tight">{f.title}</h3>
                <p className="text-primary leading-relaxed text-lg font-bold opacity-80">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE SECTION */}
      <section className="relative py-24 px-gutter">
        <div className="mx-auto max-w-containerMax relative overflow-hidden rounded-[4rem] shadow-2xl min-h-[500px] group flex items-center">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=2000"
              alt={t("landing.alt.platform")}
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-primary/75 backdrop-blur-[2px]" />
          </div>

          <div className="relative z-10 w-full px-10 py-20 lg:px-24">
            <div className="reveal space-y-10 text-white max-w-4xl mx-auto text-center lg:text-left lg:mx-0">
              <h2 className="text-6xl font-black md:text-7xl leading-[1.1]">{t("landing.showcaseTitle")}</h2>
              <p className="text-3xl font-bold leading-relaxed opacity-90">{t("landing.showcaseSubtitle")}</p>
              <div className="pt-6">
                <Link to="/register" className="btn-ieee inline-flex items-center gap-4 bg-accent px-14 py-6 text-2xl font-black text-primary shadow-2xl transition-transform hover:scale-105 active:scale-95">
                  {t("landing.browse")}
                  <span className="material-symbols-outlined text-4xl">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SAVINGS CIRCLES SECTION */}
      <section className="relative py-32 px-gutter">
        <div className="mx-auto max-w-containerMax relative overflow-hidden rounded-[4rem] px-10 py-24 shadow-2xl lg:px-24 group min-h-[600px] bg-white/10 backdrop-blur-xl border border-white/20 transition-all duration-700 hover:bg-white/15 hover:-translate-y-2">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=2000"
              alt={t("landing.alt.community")}
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80"
            />
            <div className="absolute inset-0 bg-primary/60" />
          </div>

          <div className="reveal mb-24 text-center relative z-10">
            <h2 className="text-6xl font-black text-white md:text-7xl">{t("landing.frameworkTitle")}</h2>
            <p className="mt-8 text-3xl text-white font-bold opacity-80">{t("landing.frameworkSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 relative z-10">
            {steps.map((s, i) => (
              <div key={i} style={{ "--reveal-delay": `${i * 150}ms` } as any} className="reveal reveal-up group bg-white/15 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/30 shadow-2xl transition-all hover:bg-white/25">
                <div className="absolute -top-8 -left-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-accent font-black text-primary shadow-2xl border-4 border-white">
                  {i + 1}
                </div>
                <div className="mb-10 text-accent">
                  <span className="material-symbols-outlined text-6xl">{s.icon}</span>
                </div>
                <h3 className="mb-5 text-3xl font-black text-white">{s.title}</h3>
                <p className="text-xl leading-relaxed text-white font-bold opacity-80">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR WHOM SECTION */}
      <section className="relative overflow-hidden py-32 bg-primary/5">
        <div className="mx-auto max-w-containerMax px-gutter">
          <div className="reveal mb-20 text-center">
            <h2 className="text-5xl font-black text-primary md:text-6xl">{t("landing.forWhom.title")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {forWhom.map((item, i) => (
              <div key={i} style={{ "--reveal-delay": `${i * 150}ms` } as any} className="reveal reveal-up hp-glass-card p-12 rounded-[3.5rem] flex items-center gap-10 border-white shadow-xl">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2.5rem] bg-primary text-accent shadow-xl">
                  <span className="material-symbols-outlined text-5xl">{item.icon}</span>
                </div>
                <div>
                  <h3 className="mb-4 text-3xl font-black text-primary">{item.title}</h3>
                  <p className="text-xl text-primary leading-relaxed font-bold opacity-80">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARTICLES SECTION */}
      <section className="border-t border-slate-200 bg-transparent py-40">
        <div className="mx-auto grid max-w-containerMax grid-cols-1 gap-12 px-gutter lg:grid-cols-2">
          {/* ARTICLE 1 */}
          <article className="reveal reveal-left hp-glass-primary p-12 shadow-[0_32px_64px_-16px_rgba(0,38,69,0.4)] rounded-[3.5rem]">
            <h3 className="text-4xl font-black text-accent leading-tight">{t("landing.platformTitle")}</h3>
            <p className="mt-8 text-2xl leading-relaxed text-white font-bold opacity-90">{t("landing.platformBody")}</p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <div className="rounded-[2rem] bg-white/10 p-8 border border-white/10">
                <p className="text-xs font-black uppercase tracking-widest text-accent">{t("landing.metrics.membersLabel")}</p>
                <p className="mt-3 text-2xl font-black text-white">{t("landing.metrics.membersValue")}</p>
              </div>
              <div className="rounded-[2rem] bg-white/10 p-8 border border-white/10">
                <p className="text-xs font-black uppercase tracking-widest text-accent">{t("landing.metrics.payoutLabel")}</p>
                <p className="mt-3 text-2xl font-black text-white">{t("landing.metrics.payoutValue")}</p>
              </div>
            </div>
          </article>

          {/* ARTICLE 2 */}
          <article className="reveal reveal-right hp-glass-card p-12 shadow-xl rounded-[3.5rem] border-accent/20">
            <h3 className="text-4xl font-black text-primary leading-tight">{t("landing.approach.title")}</h3>
            <div className="mt-10 space-y-6">
              {approachItems.map((item, i) => (
                <div key={i} style={{ "--reveal-delay": `${i * 120}ms` } as any} className="reveal reveal-up flex items-start gap-6 rounded-[2.5rem] bg-slate-50 p-8 transition-all hover:bg-slate-100">
                  <span className="material-symbols-outlined mt-1 text-primary text-4xl">{item.icon}</span>
                  <div>
                    <p className="text-2xl font-black text-primary leading-tight">{item.title}</p>
                    <p className="mt-3 text-lg text-primary font-bold opacity-80 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* RIGHTS SECTION */}
      <section className="relative border-t border-slate-200/60 py-32 bg-[#eef2f7]">
        <div className="mx-auto max-w-containerMax px-gutter">
          <div className="reveal reveal-scale hp-glass-card rounded-[4rem] p-16 shadow-2xl border-slate-100">
            <h3 className="text-5xl font-black text-primary leading-tight">{t("landing.rights.title")}</h3>
            <p className="mt-6 text-2xl text-primary font-bold opacity-80 leading-relaxed max-w-4xl">{t("landing.rights.subtitle")}</p>
            <ul className="mt-12 grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <li key={n} style={{ "--reveal-delay": `${n * 120}ms` } as any} className="reveal reveal-up flex items-start gap-4 text-xl font-bold text-primary bg-slate-50 p-8 rounded-[2.5rem]">
                  <span className="material-symbols-outlined text-accent text-3xl">check_circle</span>
                  <span>{t(`landing.rights.item${n}`)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-16 flex flex-wrap gap-6">
              <Link to="/terms" className="btn-ieee rounded-2xl bg-primary px-10 py-5 text-xl font-black text-white shadow-xl">
                {t("landing.rights.readTerms")}
              </Link>
              <Link to="/privacy" className="btn-ieee rounded-2xl border-2 border-primary px-10 py-5 text-xl font-black text-primary hover:bg-slate-50">
                {t("landing.rights.readPrivacy")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="relative py-40">
        <div className="mx-auto max-w-4xl px-gutter text-center">
          <h2 className="reveal mb-20 text-6xl font-black text-primary">{t("landing.faq.title")}</h2>
          <div className="space-y-8 text-left">
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ "--reveal-delay": `${i * 150}ms` } as any} className="reveal reveal-up overflow-hidden hp-glass-card rounded-[3rem] shadow-lg border-slate-100">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-10 text-left"
                >
                  <span className="text-2xl font-black text-primary leading-tight">{t(`landing.faq.q${i}`)}</span>
                  <span className={`material-symbols-outlined text-primary/30 transition-transform text-5xl ${openFaq === i ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaq === i ? "max-h-[600px]" : "max-h-0"}`}>
                  <p className="border-t border-slate-100 p-10 text-2xl text-primary font-bold opacity-80 leading-relaxed">
                    {t(`landing.faq.a${i}`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
