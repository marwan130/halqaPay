import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import * as circlesApi from "../api/circles";
import { getApiErrorMessage } from "../lib/apiError";
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

const inputClass =
  "mt-2 w-full rounded-lg border border-outline-variant bg-surface-lowest px-3 py-2.5 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25";

export function CreateCirclePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [totalValue, setTotalValue] = useState("8000");
  const [durationMonths, setDurationMonths] = useState("5");
  const [currency, setCurrency] = useState<CurrencyCode>("EGP");
  const [maxMembers, setMaxMembers] = useState("5");
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdCircle, setCreatedCircle] = useState<CircleResponse | null>(null);

  const mutation = useMutation({
    mutationFn: circlesApi.createCircle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["circles"] });
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      queryClient.invalidateQueries({ queryKey: ["users", "me", "circles"] });
      setCreatedCircle(data);
      setSuccess(true);
    },
    onError: (err) => {
      const raw = getApiErrorMessage(err);
      // Detect backend eligibility rejection and show a translated message instead
      if (raw.toLowerCase().includes("not eligible")) {
        const match = raw.match(/(\d+)\s+months?/i);
        const suggested = match ? parseInt(match[1]) : null;
        setError(
          suggested != null
            ? t("createCircle.notEligibleSuggested", { count: suggested })
            : t("createCircle.notEligible")
        );
      } else {
        setError(raw);
      }
    }
  });

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

    mutation.mutate({ name, totalValue: tv, durationMonths: dm, currency, maxMembers: mm, isPrivate });
  }

  if (success && createdCircle) {
    return (
      <main className="mx-auto max-w-containerMax px-gutter pt-24 pb-12 text-center">
        <div className="flex flex-col items-center space-y-6 animate-fade-in-up">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success-container text-success-on shadow-lg shadow-success-container/20">
            <span className="material-symbols-outlined text-5xl">verified</span>
          </div>
          <h1 className="text-3xl font-black text-primary">{t("createCircle.successTitle")}</h1>

          <div className="w-full space-y-4 rounded-3xl bg-surface-lowest p-8 shadow-xl border border-outline-variant/30">
            <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/60">
              {t("createCircle.inviteFriends")}
            </p>

            <div className="relative flex flex-col items-center py-4 gap-4">
              {/* Real QR code that encodes a deep-link to the join flow */}
              <div className="rounded-2xl bg-white p-4 shadow-md border border-outline-variant/20">
                <QRCode
                  value={`${window.location.origin}/circles?code=${createdCircle.inviteCode ?? ""}`}
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#1a1a2e"
                  level="M"
                />
              </div>
              <div className="flex items-center gap-2 text-3xl font-mono font-black tracking-[0.4em] text-primary bg-primary/5 px-6 py-3 rounded-xl border-2 border-dashed border-primary/20">
                <span>{createdCircle.inviteCode ?? "—"}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdCircle.inviteCode ?? "");
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                  title="Copy code"
                >
                  <span className="material-symbols-outlined text-lg">content_copy</span>
                </button>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant px-4">
              {t("createCircle.shareCode")}
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full pt-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full rounded-xl bg-primary py-4 text-lg font-bold text-primary-on shadow-card transition-all hover:scale-[1.02] active:scale-95"
            >
              {t("createCircle.goToDashboard")}
            </button>
            <Link
              to="/circles"
              className="w-full rounded-xl border-2 border-primary py-4 text-lg font-bold text-primary transition-all hover:bg-surface-low text-center"
            >
              {t("createCircle.viewAll")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-containerMax px-gutter pt-24 pb-20 text-center">
        <div className="flex flex-col items-center space-y-6 animate-fade-in-up">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-error-container text-error-on shadow-lg shadow-error-container/20">
            <span className="material-symbols-outlined text-5xl">error</span>
          </div>
          <h1 className="text-3xl font-black text-primary">{t("createCircle.errorTitle")}</h1>
          <div className="w-full rounded-2xl bg-error-container/10 p-6 border border-error-container/30 text-left">
            <p className="text-base text-error font-bold leading-relaxed">
              {error}
            </p>
          </div>
          <p className="text-on-surface-variant font-medium">
            {t("createCircle.errorSubtitle")}
          </p>
          <div className="flex flex-col gap-3 w-full pt-2">
            <button
              onClick={() => {
                setError(null);
                mutation.reset();
              }}
              className="w-full rounded-xl bg-primary py-4 text-lg font-bold text-primary-on shadow-card transition-all hover:scale-[1.02] active:scale-95"
            >
              {t("createCircle.tryAgain")}
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full rounded-xl border-2 border-primary py-4 text-lg font-bold text-primary transition-all hover:bg-surface-low"
            >
              {t("createCircle.cancel")}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="page-hero-bg px-gutter pt-28 pb-24 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=70"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.10] mix-blend-luminosity pointer-events-none select-none animate-slow-zoom"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {[
            { sym: "₿", x: "6%",  top: "55%", size: "3rem",   dur: "18s", delay: "0s",   rot: "-12deg", op: "0.10", color: "#fed65b" },
            { sym: "€", x: "88%", top: "45%", size: "2.5rem", dur: "20s", delay: "2s",   rot: "-6deg",  op: "0.09", color: "#fff" },
            { sym: "↑", x: "78%", top: "70%", size: "2rem",   dur: "15s", delay: "1s",   rot: "0deg",   op: "0.10", color: "#4ade80" },
            { sym: "$", x: "20%", top: "25%", size: "1.8rem", dur: "22s", delay: "3s",   rot: "8deg",   op: "0.07", color: "#fff" },
            { sym: "↗", x: "65%", top: "30%", size: "1.6rem", dur: "17s", delay: "5s",   rot: "0deg",   op: "0.07", color: "#4ade80" },
          ].map(({ sym, x, top, size, dur, delay, rot, op, color }, i) => (
            <span key={i} className="float-symbol" style={{ left: x, top, fontSize: size, color, "--fs-dur": dur, "--fs-delay": delay, "--fs-rot": rot, "--fs-op": op } as React.CSSProperties}>{sym}</span>
          ))}
          <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/[0.06]" />
          <div className="absolute left-1/2 top-1/2 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03] animate-spin-slow" />
        </div>
        <div className="mx-auto max-w-containerMax relative z-10">
          <Link
            to="/circles"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white/60 hover:text-white transition-colors mb-4"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {t("createCircle.back")}
          </Link>
          <div className="hp-pill-glass mb-4 w-fit">{t("nav.newCircle")}</div>
          <h1 className="text-4xl font-black text-white tracking-tight">{t("createCircle.title")}</h1>
          <p className="mt-2 text-base text-white/60">{t("createCircle.subtitle")}</p>
        </div>
      </div>


      {/* ── Form card pulled up over hero ── */}
      <div className="relative mx-auto max-w-containerMax px-gutter -mt-8 pb-16">
        {/* Floating currency symbols in white area */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {([
            { sym: "₿", x: "2%",  top: "8%",  size: "2rem",   dur: "20s", delay: "0s",  rot: "-8deg",  op: "0.04", color: "#002645" },
            { sym: "$", x: "92%", top: "12%", size: "1.8rem", dur: "18s", delay: "3s",  rot: "12deg",  op: "0.04", color: "#fed65b" },
            { sym: "€", x: "88%", top: "55%", size: "1.6rem", dur: "22s", delay: "1s",  rot: "-6deg",  op: "0.04", color: "#002645" },
            { sym: "↗", x: "3%",  top: "65%", size: "1.4rem", dur: "16s", delay: "5s",  rot: "0deg",   op: "0.05", color: "#002645" },
          ] as const).map(({ sym, x, top, size, dur, delay, rot, op, color }, i) => (
            <span key={i} className="float-symbol" style={{ left: x, top, fontSize: size, color, "--fs-dur": dur, "--fs-delay": delay, "--fs-rot": rot, "--fs-op": op } as React.CSSProperties}>{sym}</span>
          ))}
          <div className="absolute right-2 top-24 h-[160px] w-[160px] rounded-full border border-primary/[0.04] animate-spin-slow" />
          <div className="absolute left-2 bottom-28 h-[100px] w-[100px] rounded-full border border-accent/[0.05] animate-pulse-slow" />
        </div>
        <div className="relative z-10">
          <div className="mx-auto max-w-lg">
            <div className="hp-glass-card rounded-[2rem] p-8 shadow-xl reveal reveal-up">
          <form onSubmit={onSubmit} className="space-y-5">

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
                    <option key={c} value={c}>{c}</option>
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

            {/* Visibility toggle */}
            <div className="rounded-2xl border border-outline-variant bg-surface-low p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-on-surface">{t("createCircle.visibility")}</p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    {isPrivate ? t("createCircle.privateHint") : t("createCircle.publicHint")}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isPrivate}
                  onClick={() => setIsPrivate((v) => !v)}
                  className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    isPrivate ? "border-primary bg-primary" : "border-outline-variant bg-surface-variant"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                      isPrivate ? "translate-x-7" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              <div className="mt-3 flex gap-3">
                <div className={`flex-1 rounded-xl border-2 p-3 text-center transition-all ${
                  !isPrivate ? "border-primary bg-primary/5" : "border-outline-variant/40"
                }`}>
                  <span className="material-symbols-outlined text-primary text-2xl">public</span>
                  <p className="mt-1 text-xs font-bold text-on-surface">{t("createCircle.public")}</p>
                </div>
                <div className={`flex-1 rounded-xl border-2 p-3 text-center transition-all ${
                  isPrivate ? "border-primary bg-primary/5" : "border-outline-variant/40"
                }`}>
                  <span className="material-symbols-outlined text-primary text-2xl">lock</span>
                  <p className="mt-1 text-xs font-bold text-on-surface">{t("createCircle.private")}</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-xl bg-primary py-4 text-sm font-black text-primary-on shadow-card transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95 disabled:opacity-60"
            >
              {mutation.isPending ? t("createCircle.submitting") : t("createCircle.submit")}
            </button>

          </form>
            </div>
          </div>
        </div>{/* end z-10 */}
      </div>
    </div>
  );
}
