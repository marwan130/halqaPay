import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import * as circlesApi from "../api/circles";
import { ErrorBanner } from "../components/shared/ErrorBanner";
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

const inputClass =
  "mt-2 w-full rounded-lg border border-outline-variant bg-surface-lowest px-3 py-2.5 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25";

export function CreateCirclePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [totalValue, setTotalValue] = useState("8000");
  const [durationMonths, setDurationMonths] = useState("5");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [maxMembers, setMaxMembers] = useState("10");
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
    const tv = Number(totalValue);
    const dm = Number(durationMonths);
    const mm = Number(maxMembers);
    if (!Number.isFinite(tv) || tv <= 0) {
      setError(t("createCircle.invalidTotal"));
      return;
    }
    if (!Number.isInteger(dm) || dm < 1) {
      setError(t("createCircle.invalidDuration"));
      return;
    }
    if (!Number.isInteger(mm) || mm < 2 || mm > 20) {
      setError(t("createCircle.invalidMembers"));
      return;
    }
    setSubmitting(true);
    try {
      await circlesApi.createCircle({
        name,
        totalValue: tv,
        durationMonths: dm,
        currency,
        maxMembers: mm
      });
      navigate("/circles", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-gutter py-10">
      <p className="text-sm text-on-surface-variant">
        <Link to="/circles" className="font-bold text-secondary hover:underline">
          {t("createCircle.back")}
        </Link>
      </p>
      <h1 className="mt-4 text-2xl font-bold text-primary md:text-3xl">
        {t("createCircle.title")}
      </h1>
      <p className="mt-2 text-sm text-on-surface-variant">{t("createCircle.subtitle")}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
        <div>
          <label htmlFor="c-name" className="text-sm font-semibold text-on-surface">
            {t("createCircle.name")}
          </label>
          <input
            id="c-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="c-value" className="text-sm font-semibold text-on-surface">
              {t("createCircle.totalValue")}
            </label>
            <input
              id="c-value"
              type="number"
              min={0.01}
              step="0.01"
              required
              value={totalValue}
              onChange={(e) => setTotalValue(e.target.value)}
              onBlur={(e) => setTotalValue(normalizeMoneyInput(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="c-currency" className="text-sm font-semibold text-on-surface">
              {t("createCircle.currency")}
            </label>
            <select
              id="c-currency"
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
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="c-months" className="text-sm font-semibold text-on-surface">
              {t("createCircle.duration")}
            </label>
            <input
              id="c-months"
              type="number"
              min={1}
              step={1}
              required
              value={durationMonths}
              onChange={(e) => setDurationMonths(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="c-members" className="text-sm font-semibold text-on-surface">
              {t("createCircle.maxMembers")}
            </label>
            <input
              id="c-members"
              type="number"
              min={2}
              max={20}
              step={1}
              required
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-on shadow-card hover:opacity-95 disabled:opacity-60"
        >
          {submitting ? t("createCircle.submitting") : t("createCircle.submit")}
        </button>
      </form>
    </main>
  );
}
