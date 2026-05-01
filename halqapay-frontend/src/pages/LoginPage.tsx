import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { ErrorBanner } from "../components/shared/ErrorBanner";
import { useAuth } from "../hooks/useAuth";
import { getApiErrorMessage } from "../lib/apiError";

export function LoginPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const state = location.state as { from?: unknown } | null;
      const from  = typeof state?.from === "string" ? state.from : undefined;
      await login({ email, password }, { redirectTo: from ?? "/dashboard" });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="auth-brand-panel relative hidden flex-col items-start justify-between p-14 pt-28 lg:flex lg:w-5/12 xl:w-[42%]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -bottom-32 -left-32 h-[480px] w-[480px] rounded-full border border-white/[0.06]" />
          <div className="absolute -bottom-16 -left-16 h-[340px] w-[340px] rounded-full border border-white/[0.04]" />
          <div className="absolute top-20 right-10 h-[200px] w-[200px] rounded-full border border-accent/[0.10] animate-spin-slow" />
          <div className="absolute top-40 right-20 h-[120px] w-[120px] rounded-full bg-accent/[0.07] animate-pulse-slow" />
          <div className="absolute bottom-40 right-12 h-32 w-32 rounded-full bg-white/[0.04] animate-blob" />
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
            {t("landing.heroTitle")}
          </h2>
          <p className="text-lg leading-relaxed text-white/65 max-w-xs">
            {t("landing.heroSubtitle")}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { label: t("landing.metrics.membersLabel"), value: t("landing.metrics.membersValue") },
              { label: t("landing.metrics.payoutLabel"),  value: t("landing.metrics.payoutValue") },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl bg-white/[0.07] p-4 border border-white/[0.08]">
                <p className="text-[10px] font-black uppercase tracking-widest text-accent/80">{m.label}</p>
                <p className="mt-1.5 text-lg font-black text-white">{m.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-white/40 text-xs">
          <span className="material-symbols-outlined text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield
          </span>
          <span className="font-semibold">{t("landing.rights.item1")}</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white px-6 pt-28 pb-16 lg:px-16">
        <div className="w-full max-w-md animate-fade-in-scale">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <img src="/halqapay.png" alt="HalqaPay" className="h-9 w-9" />
            <span className="text-lg font-black text-primary">HalqaPay</span>
          </div>

          <h1 className="text-3xl font-black text-primary md:text-4xl">{t("login.title")}</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            {t("login.newHere")}{" "}
            <Link to="/register" className="font-bold text-secondary underline-offset-2 hover:underline">
              {t("login.register")}
            </Link>
          </p>

          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-bold text-on-surface">
                {t("login.email")}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="hp-input"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-bold text-on-surface">
                {t("login.password")}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="hp-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-ieee btn-shimmer relative mt-2 w-full overflow-hidden rounded-2xl bg-primary py-3.5 text-sm font-black text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {t("login.submitting")}
                </span>
              ) : (
                t("login.submit")
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
