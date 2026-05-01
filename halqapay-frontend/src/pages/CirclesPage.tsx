import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { ListCirclesParams } from "../api/circles";
import * as circlesApi from "../api/circles";
import * as usersApi from "../api/users";
import { CircleList } from "../components/circles/CircleList";
import { JoinCircleModal } from "../components/circles/JoinCircleModal";
import { ErrorBanner } from "../components/shared/ErrorBanner";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { SuccessModal } from "../components/shared/SuccessModal";
import { useCirclesList } from "../hooks/useCircles";
import { getApiErrorMessage } from "../lib/apiError";
import { useAuthStore } from "../store/authStore";
import type { CircleResponse, CurrencyCode } from "../types";

const currencies: CurrencyCode[] = [
  "USD","EGP","SAR","AED","KWD","QAR","BHD","OMR","JOD",
];

export function CirclesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  const [modalCircle,    setModalCircle]    = useState<CircleResponse | null>(null);
  const [inviteCode,     setInviteCode]     = useState("");
  const [joinByCodeError, setJoinByCodeError] = useState<string | null>(null);
  const [showJoinSuccess, setShowJoinSuccess] = useState(false);

  const joinByCodeMutation = useMutation({
    mutationFn: (code: string) => circlesApi.joinByCode(code),
    onSuccess: (res) => {
      if (res.approved) {
        setShowJoinSuccess(true);
        setInviteCode("");
        setJoinByCodeError(null);
        refetch();
        queryClient.invalidateQueries({ queryKey: ["users", "me", "circles"] });
      } else {
        setJoinByCodeError(res.reason || "Unable to join circle");
      }
    },
    onError: (err) => setJoinByCodeError(getApiErrorMessage(err))
  });

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      const normalized = codeFromUrl.toUpperCase().trim();
      setInviteCode(normalized);
      setSearchParams({}, { replace: true });
      if (token) { setJoinByCodeError(null); joinByCodeMutation.mutate(normalized); }
    }
  }, []);

  const [currency, setCurrency] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");

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

  const { data: circles, isLoading, isError, error, refetch } = useCirclesList(listParams);

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

  function handleJoinClick(circle: CircleResponse) {
    if (!token) { navigate("/login", { state: { from: "/circles" } }); return; }
    setModalCircle(circle);
  }
  function handleJoinByCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) { navigate("/login", { state: { from: "/circles" } }); return; }
    if (!inviteCode.trim()) return;
    setJoinByCodeError(null);
    joinByCodeMutation.mutate(inviteCode.trim());
  }

  const hasFilters = !!currency || !!minValue || !!maxValue;

  return (
    <div className="min-h-screen">
      <div className="page-hero-bg px-gutter pt-28 pb-28">
        <img
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=70"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.10] mix-blend-luminosity pointer-events-none select-none animate-slow-zoom"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/[0.06]" />
          <div className="absolute left-1/2 top-1/2 h-[580px] w-[580px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03] animate-spin-slow" />
          {([
            { sym: "₿", x: "7%",  top: "55%", size: "2.8rem", dur: "18s", delay: "0s",  rot: "-12deg", op: "0.10", color: "#fed65b" },
            { sym: "€", x: "87%", top: "45%", size: "2.2rem", dur: "20s", delay: "2s",  rot: "-6deg",  op: "0.09", color: "#fff" },
            { sym: "↑", x: "76%", top: "68%", size: "2rem",   dur: "15s", delay: "1s",  rot: "0deg",   op: "0.10", color: "#4ade80" },
            { sym: "$", x: "22%", top: "28%", size: "1.6rem", dur: "22s", delay: "3s",  rot: "8deg",   op: "0.07", color: "#fff" },
          ] as const).map(({ sym, x, top, size, dur, delay, rot, op, color }, i) => (
            <span key={i} className="float-symbol" style={{ left: x, top, fontSize: size, color, "--fs-dur": dur, "--fs-delay": delay, "--fs-rot": rot, "--fs-op": op } as React.CSSProperties}>{sym}</span>
          ))}
        </div>
        <div className="mx-auto max-w-containerMax relative z-10">
          <div className="hp-pill-glass mb-4 w-fit">{t("nav.circles")}</div>
          <h1 className="text-4xl font-black text-white md:text-5xl tracking-tight">
            {t("circles.title")}
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/65">
            {t("circles.subtitle")}
          </p>

          {/* Top action bar */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {token ? (
              <>
                {/* Invite code form */}
                <form
                  onSubmit={handleJoinByCodeSubmit}
                  className="flex items-center gap-0 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm"
                >
                  <input
                    type="text"
                    placeholder={t("circles.enterCode")}
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="bg-transparent px-4 py-2.5 text-sm font-bold text-white placeholder-white/40 outline-none w-36"
                  />
                  <button
                    type="submit"
                    disabled={joinByCodeMutation.isPending}
                    className="btn-shimmer bg-accent px-4 py-2.5 text-sm font-black text-primary disabled:opacity-60"
                  >
                    {joinByCodeMutation.isPending ? "…" : t("circles.join")}
                  </button>
                </form>

                <Link
                  to="/circles/new"
                  className="btn-ieee btn-shimmer inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/20 hover:bg-white/20"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  {t("circles.create")}
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login", { state: { from: "/circles" } })}
                className="btn-ieee btn-shimmer rounded-2xl bg-accent px-6 py-2.5 text-sm font-black text-primary"
              >
                {t("common.loginLink")}
              </button>
            )}
          </div>

          {/* Error below code form */}
          {joinByCodeError && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/20 px-4 py-1.5 text-xs font-bold text-danger-container border border-danger/20">
                <span className="material-symbols-outlined text-sm">error</span>
                {joinByCodeError}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Main content, overlapping hero ── */}
      <div className="relative mx-auto max-w-containerMax px-gutter -mt-14 pb-16">
        {/* Floating currency symbols in white area */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {([
            { sym: "₿", x: "2%",  top: "10%", size: "2.5rem", dur: "20s", delay: "0s",  rot: "-8deg",  op: "0.04", color: "#002645" },
            { sym: "$", x: "93%", top: "6%",  size: "2rem",   dur: "18s", delay: "3s",  rot: "12deg",  op: "0.04", color: "#fed65b" },
            { sym: "€", x: "91%", top: "52%", size: "1.8rem", dur: "22s", delay: "1s",  rot: "-6deg",  op: "0.04", color: "#002645" },
            { sym: "↗", x: "3%",  top: "62%", size: "1.5rem", dur: "16s", delay: "5s",  rot: "0deg",   op: "0.05", color: "#002645" },
            { sym: "%", x: "50%", top: "88%", size: "1.4rem", dur: "24s", delay: "7s",  rot: "-10deg", op: "0.03", color: "#fed65b" },
          ] as const).map(({ sym, x, top, size, dur, delay, rot, op, color }, i) => (
            <span key={i} className="float-symbol" style={{ left: x, top, fontSize: size, color, "--fs-dur": dur, "--fs-delay": delay, "--fs-rot": rot, "--fs-op": op } as React.CSSProperties}>{sym}</span>
          ))}
          <div className="absolute right-8 top-28 h-[200px] w-[200px] rounded-full border border-primary/[0.04] animate-spin-slow" />
          <div className="absolute left-4 bottom-32 h-[130px] w-[130px] rounded-full border border-accent/[0.05] animate-pulse-slow" />
          <div className="absolute right-1/3 bottom-16 h-[80px] w-[80px] rounded-full bg-accent/[0.03] animate-blob" />
        </div>
        {/* ── Glass filter panel ── */}
        <div className="relative z-10">
        <div className="hp-glass-card mb-8 rounded-[2rem] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary/60">
              <span className="material-symbols-outlined text-lg text-primary/40">tune</span>
              {t("circles.filters")}
            </h2>
            {hasFilters && (
              <button
                type="button"
                onClick={() => { setCurrency(""); setMinValue(""); setMaxValue(""); }}
                className="flex items-center gap-1 rounded-full bg-primary/8 px-3 py-1 text-xs font-bold text-primary/70 hover:bg-primary/12 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                {t("circles.clearFilters")}
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="filter-currency" className="block text-xs font-bold text-on-surface-variant mb-1.5">
                {t("circles.currency")}
              </label>
              <select
                id="filter-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="hp-input"
              >
                <option value="">{t("circles.any")}</option>
                {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filter-min" className="block text-xs font-bold text-on-surface-variant mb-1.5">
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
                className="hp-input"
              />
            </div>
            <div>
              <label htmlFor="filter-max" className="block text-xs font-bold text-on-surface-variant mb-1.5">
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
                className="hp-input"
              />
            </div>
          </div>
        </div>

        {/* ── Circle list ── */}
        <div className="mt-2">
          {isLoading ? <LoadingSpinner label={t("circles.loading")} /> : null}
          {isError   ? <ErrorBanner   message={getApiErrorMessage(error)} /> : null}
          {!isLoading && !isError && circles ? (
            <CircleList circles={circles} onJoin={handleJoinClick} joinedCircleIds={joinedCircleIds} />
          ) : null}
        </div>
        </div>{/* end z-10 wrapper */}
      </div>

      <JoinCircleModal
        circle={modalCircle}
        open={Boolean(modalCircle)}
        onClose={() => setModalCircle(null)}
        onSuccess={() => refetch()}
      />
      <SuccessModal
        open={showJoinSuccess}
        onClose={() => setShowJoinSuccess(false)}
        title={t("circles.joinSuccessTitle")}
        message={t("circles.joinSuccessMessage")}
        actionLabel={t("circles.goToDashboard")}
        onAction={() => navigate("/dashboard")}
      />
    </div>
  );
}
