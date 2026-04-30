import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import type { ListCirclesParams } from "../api/circles";
import * as usersApi from "../api/users";
import { CircleList } from "../components/circles/CircleList";
import { JoinCircleModal } from "../components/circles/JoinCircleModal";
import { ErrorBanner } from "../components/shared/ErrorBanner";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { useCirclesList } from "../hooks/useCircles";
import { getApiErrorMessage } from "../lib/apiError";
import { useAuthStore } from "../store/authStore";
import type { CircleResponse, CurrencyCode } from "../types";

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

export function CirclesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [currency, setCurrency] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [modalCircle, setModalCircle] = useState<CircleResponse | null>(null);

  // Fetch the user's own memberships so we can mark cards client-side
  const myCirclesQuery = useQuery({
    queryKey: ["users", "me", "circles"],
    queryFn: usersApi.fetchMyCircles,
    enabled: !!token
  });

  const joinedCircleIds = useMemo<Set<string>>(() => {
    const all = [
      ...(myCirclesQuery.data?.activeCircles ?? []),
      ...(myCirclesQuery.data?.completedCircles ?? [])
    ];
    return new Set(all.map((m) => String(m.circleId)));
  }, [myCirclesQuery.data]);

  function normalizeMoneyInput(value: string) {
    const n = Number(value);
    if (!Number.isFinite(n)) return value;
    return n.toFixed(2);
  }

  const listParams: ListCirclesParams = { status: "OPEN" };
  if (currency) listParams.currency = currency;
  const minV = minValue.trim() ? Number(minValue) : NaN;
  if (Number.isFinite(minV)) listParams.minValue = minV;
  const maxV = maxValue.trim() ? Number(maxValue) : NaN;
  if (Number.isFinite(maxV)) listParams.maxValue = maxV;

  const { data: circles, isLoading, isError, error, refetch } =
    useCirclesList(listParams);

  function handleJoinClick(circle: CircleResponse) {
    if (!token) {
      navigate("/login", { state: { from: "/circles" } });
      return;
    }
    setModalCircle(circle);
  }


  return (
    <main className="mx-auto max-w-containerMax px-gutter py-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary md:text-3xl">
            {t("circles.title")}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-on-surface-variant">
            {t("circles.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {token ? (
            <Link
              to="/circles/new"
              className="inline-flex rounded-lg bg-secondary-container px-4 py-2 text-sm font-bold text-on-secondary-container shadow-card hover:brightness-95"
            >
              {t("circles.create")}
            </Link>
          ) : null}
          {!token ? (
            <p className="text-sm text-on-surface">
              <button
                type="button"
                onClick={() => navigate("/login", { state: { from: "/circles" } })}
                className="font-bold text-secondary underline-offset-2 hover:underline"
              >
                {t("common.loginLink")}
              </button>{" "}
              {t("circles.loginToJoin")}
            </p>
          ) : null}
        </div>
      </div>

      <section className="mt-8 rounded-card border border-outline-variant bg-surface-lowest p-5 shadow-card">
        <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          {t("circles.filters")}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="filter-currency"
              className="block text-xs font-bold text-on-surface-variant"
            >
              {t("circles.currency")}
            </label>
            <select
              id="filter-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-2 w-full rounded-lg border border-outline-variant bg-surface-lowest px-3 py-2.5 text-sm font-medium text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            >
              <option value="">{t("circles.any")}</option>
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="filter-min"
              className="block text-xs font-bold text-on-surface-variant"
            >
              {t("circles.minValue")}
            </label>
            <input
              id="filter-min"
              type="number"
              min={0}
              step="0.01"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              onBlur={(e) => setMinValue(normalizeMoneyInput(e.target.value))}
              placeholder={t("circles.any")}
              className="mt-2 w-full rounded-lg border border-outline-variant bg-surface-lowest px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>
          <div>
            <label
              htmlFor="filter-max"
              className="block text-xs font-bold text-on-surface-variant"
            >
              {t("circles.maxValue")}
            </label>
            <input
              id="filter-max"
              type="number"
              min={0}
              step="0.01"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              onBlur={(e) => setMaxValue(normalizeMoneyInput(e.target.value))}
              placeholder={t("circles.any")}
              className="mt-2 w-full rounded-lg border border-outline-variant bg-surface-lowest px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setCurrency("");
                setMinValue("");
                setMaxValue("");
              }}
              className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm font-bold text-primary hover:bg-surface-low"
            >
              {t("circles.clearFilters")}
            </button>
          </div>
        </div>
      </section>

      <div className="mt-8">
        {isLoading ? <LoadingSpinner label={t("circles.loading")} /> : null}
        {isError ? <ErrorBanner message={getApiErrorMessage(error)} /> : null}
        {!isLoading && !isError && circles ? (
          <CircleList
            circles={circles}
            onJoin={handleJoinClick}
            joinedCircleIds={joinedCircleIds}
          />
        ) : null}
      </div>

      <JoinCircleModal
        circle={modalCircle}
        open={Boolean(modalCircle)}
        onClose={() => setModalCircle(null)}
        onSuccess={() => refetch()}
      />
    </main>
  );
}
