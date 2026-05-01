import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { ErrorBanner } from "../components/shared/ErrorBanner";
import { useAuth } from "../hooks/useAuth";
import { getApiErrorMessage } from "../lib/apiError";

const inputClass =
  "mt-2 w-full rounded-lg border border-outline-variant bg-surface-lowest px-3 py-2.5 text-on-surface shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25";

export function LoginPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const state = location.state as { from?: unknown } | null;
      const from = typeof state?.from === "string" ? state.from : undefined;
      await login({ email, password }, { redirectTo: from ?? "/dashboard" });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-gutter py-12">
      <h1 className="text-2xl font-bold text-primary md:text-3xl">{t("login.title")}</h1>
      <p className="mt-2 text-sm text-on-surface-variant">
        {t("login.newHere")}{" "}
        <Link
          to="/register"
          className="font-bold text-secondary underline-offset-2 hover:underline"
        >
          {t("login.register")}
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
        <div>
          <label htmlFor="email" className="text-sm font-semibold text-on-surface">
            {t("login.email")}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-semibold text-on-surface">
            {t("login.password")}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-on shadow-card hover:opacity-95 disabled:opacity-60"
        >
          {submitting ? t("login.submitting") : t("login.submit")}
        </button>
      </form>
    </main>
  );
}
