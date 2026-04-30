import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { ErrorBanner } from "../components/shared/ErrorBanner";
import { useAuth } from "../hooks/useAuth";
import { getApiErrorMessage } from "../lib/apiError";
import type { CurrencyCode } from "../types";

const currencies: CurrencyCode[] = [
  "USD",
  "EGP",
  "SAR",
  "AED",
  "KWD",
  "QAR",
  "BHD",
  "OMR",
  "JOD"
];

const middleEastCountries = [
  "Bahrain",
  "Cyprus",
  "Egypt",
  "Iran",
  "Iraq",
  "Jordan",
  "Kuwait",
  "Lebanon",
  "Oman",
  "Palestine",
  "Qatar",
  "Saudi Arabia",
  "Syria",
  "Turkey",
  "United Arab Emirates",
  "Yemen"
];

const inputClass =
  "mt-2 w-full rounded-lg border border-outline-variant bg-surface-lowest px-3 py-2.5 text-on-surface shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25";

export function RegisterPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Saudi Arabia");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [salary, setSalary] = useState("10000");
  const [error, setError] = useState<string | null>(null);
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
      const from = typeof state?.from === "string" ? state.from : undefined;
      await register(
        {
          email,
          password,
          fullName,
          phone,
          country,
          currency,
          salary: salaryNum
        },
        { redirectTo: from ?? "/dashboard" }
      );
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-gutter py-12">
      <h1 className="text-2xl font-bold text-primary md:text-3xl">{t("register.title")}</h1>
      <p className="mt-2 text-sm text-on-surface-variant">
        {t("register.haveAccount")}{" "}
        <Link
          to="/login"
          className="font-bold text-secondary underline-offset-2 hover:underline"
        >
          {t("register.login")}
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
        {error ? (
          <div className="sm:col-span-2">
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          </div>
        ) : null}
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className="text-sm font-semibold text-on-surface">
            {t("register.fullName")}
          </label>
          <input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="email" className="text-sm font-semibold text-on-surface">
            {t("register.email")}
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
        <div className="sm:col-span-2">
          <label htmlFor="password" className="text-sm font-semibold text-on-surface">
            {t("register.password")}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-semibold text-on-surface">
            {t("register.phone")}
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="country" className="text-sm font-semibold text-on-surface">
            {t("register.country")}
          </label>
          <select
            id="country"
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={inputClass}
          >
            {middleEastCountries.map((c) => (
              <option key={c} value={c}>
                {t(`register.countries.${c}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="currency" className="text-sm font-semibold text-on-surface">
            {t("register.currency")}
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className={inputClass}
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="salary" className="text-sm font-semibold text-on-surface">
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
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-secondary-container py-3 text-sm font-bold text-on-secondary-container shadow-card hover:brightness-95 disabled:opacity-60"
          >
            {submitting ? t("register.submitting") : t("register.submit")}
          </button>
        </div>
      </form>
    </main>
  );
}
