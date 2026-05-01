import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { ErrorBanner } from "../components/shared/ErrorBanner";
import { useAuth } from "../hooks/useAuth";
import { getApiErrorMessage } from "../lib/apiError";
import type { CurrencyCode } from "../types";

const currencies: CurrencyCode[] = [
  "USD","EGP","SAR","AED","KWD","QAR","BHD","OMR","JOD",
];
const middleEastCountries = [
  "Bahrain","Cyprus","Egypt","Iran","Iraq","Jordan","Kuwait",
  "Lebanon","Oman","Palestine","Qatar","Saudi Arabia","Syria",
  "Turkey","United Arab Emirates","Yemen",
];

export function RegisterPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const { register } = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone,    setPhone]    = useState("");
  const [country,  setCountry]  = useState("Saudi Arabia");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [salary,   setSalary]   = useState("10000");
  const [error,    setError]    = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function normalizeMoneyInput(value: string) {
    const n = Number(value);
    if (!Number.isFinite(n)) return value;
    return n.toFixed(2);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const salaryNum = Number(salary);
    if (!Number.isFinite(salaryNum) || salaryNum <= 0) {
      setError(t("register.invalidSalary"));
      return;
    }
    setSubmitting(true);
    try {
      const state = location.state as { from?: unknown } | null;
      const from  = typeof state?.from === "string" ? state.from : undefined;
      await register(
        { email, password, fullName, phone, country, currency, salary: salaryNum },
        { redirectTo: from ?? "/dashboard" }
      );
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const selectClass =
    "mt-2 w-full rounded-xl border border-[rgba(0,38,69,0.15)] bg-white/90 px-3 py-2.5 text-sm text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10";

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="auth-brand-panel relative hidden flex-col items-start justify-between p-14 pt-28 lg:flex lg:w-5/12 xl:w-[42%]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 right-0 h-[420px] w-[420px] rounded-full border border-white/[0.05]" />
          <div className="absolute -top-10 right-16 h-[280px] w-[280px] rounded-full border border-accent/[0.08] animate-spin-slow" />
          <div className="absolute bottom-32 left-8 h-[200px] w-[200px] rounded-full bg-white/[0.04] animate-pulse-slow" />
          <div className="absolute bottom-16 right-8 h-[140px] w-[140px] rounded-full border border-accent/[0.12] animate-blob" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <img src="/halqapay.png" alt="HalqaPay" className="h-8 w-8 object-contain" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">HalqaPay</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="hp-pill-glass w-fit">{t("landing.badge")}</div>
          <h2 className="text-4xl font-black leading-tight text-white xl:text-5xl">
            {t("register.title")}
          </h2>
          <p className="text-lg leading-relaxed text-white/60 max-w-xs">
            {t("landing.heroSubtitle")}
          </p>

          <div className="space-y-3 pt-4">
            {[
              { icon: "person_add",   label: t("landing.step1Title") },
              { icon: "search",       label: t("landing.step2Title") },
              { icon: "payments",     label: t("landing.step4Title") },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15">
                  <span className="material-symbols-outlined text-accent text-base">{s.icon}</span>
                </div>
                <span className="text-sm font-semibold text-white/70">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-white/40 text-xs">
          <span className="material-symbols-outlined text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
            lock
          </span>
          <span className="font-semibold">{t("landing.rights.item2")}</span>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-y-auto bg-white px-6 pt-28 pb-12 lg:px-16">
        <div className="w-full max-w-lg animate-fade-in-scale">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <img src="/halqapay.png" alt="HalqaPay" className="h-9 w-9" />
            <span className="text-lg font-black text-primary">HalqaPay</span>
          </div>

          <h1 className="text-3xl font-black text-primary md:text-4xl">{t("register.title")}</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            {t("register.haveAccount")}{" "}
            <Link to="/login" className="font-bold text-secondary underline-offset-2 hover:underline">
              {t("register.login")}
            </Link>
          </p>

          <form onSubmit={onSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
            {error ? (
              <div className="sm:col-span-2">
                <ErrorBanner message={error} onDismiss={() => setError(null)} />
              </div>
            ) : null}

            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="fullName" className="block text-sm font-bold text-on-surface">
                {t("register.fullName")}
              </label>
              <input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="hp-input" placeholder="John Doe" />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="email" className="block text-sm font-bold text-on-surface">
                {t("register.email")}
              </label>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="hp-input" placeholder="you@example.com" />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="password" className="block text-sm font-bold text-on-surface">
                {t("register.password")}
              </label>
              <input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="hp-input" placeholder="••••••••" />
            </div>

            <div className="space-y-1">
              <label htmlFor="phone" className="block text-sm font-bold text-on-surface">
                {t("register.phone")}
              </label>
              <input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="hp-input" placeholder="+966 5x xxx xxxx" />
            </div>

            <div className="space-y-1">
              <label htmlFor="country" className="block text-sm font-bold text-on-surface">
                {t("register.country")}
              </label>
              <select id="country" required value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass}>
                {middleEastCountries.map((c) => (
                  <option key={c} value={c}>{t(`register.countries.${c}`)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="currency" className="block text-sm font-bold text-on-surface">
                {t("register.currency")}
              </label>
              <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)} className={selectClass}>
                {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="salary" className="block text-sm font-bold text-on-surface">
                {t("register.salary")}
              </label>
              <input
                id="salary"
                type="number"
                min={1}
                step="0.01"
                required
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                onBlur={(e) => setSalary(normalizeMoneyInput(e.target.value))}
                className="hp-input"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-ieee btn-shimmer w-full rounded-2xl bg-primary py-3.5 text-sm font-black text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {t("register.submitting")}
                  </span>
                ) : (
                  t("register.submit")
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
