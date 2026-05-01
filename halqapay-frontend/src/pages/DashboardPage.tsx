import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useModal } from "../components/layout/Layout";
import * as circlesApi from "../api/circles";
import * as usersApi from "../api/users";
import * as walletApi from "../api/wallet";
import { ActiveCircles } from "../components/dashboard/ActiveCircles";
import { BurdenMeter } from "../components/dashboard/BurdenMeter";
import { CircleDetailDrawer } from "../components/dashboard/CircleDetailDrawer";
import { KycWidget } from "../components/dashboard/KycWidget";
import { WalletCard } from "../components/dashboard/WalletCard";
import type { ActiveCircleRow } from "../types";
import QRCode from "react-qr-code";
import { CurrencyDisplay } from "../components/shared/CurrencyDisplay";
import { ErrorBanner } from "../components/shared/ErrorBanner";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import { getApiErrorMessage } from "../lib/apiError";
import {
  computeBurdenPercent,
  mapMembershipsToActiveRows
} from "../lib/dashboardUtils";
import { useAuthStore } from "../store/authStore";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/* ─── Share modal ────────────────────────────────────────────── */
function ShareModal({ row, onClose }: { row: ActiveCircleRow; onClose: () => void }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { setModalOpen } = useModal();

  useEffect(() => {
    setModalOpen(true);
    return () => {
      setModalOpen(false);
    };
  }, [setModalOpen]);
  const code = row.inviteCode ?? "";
  const qrValue = `${window.location.origin}/circles?code=${code}`;

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-3xl bg-surface-lowest p-8 shadow-2xl border border-outline-variant/30 animate-zoom-in text-center">
        <h3 className="text-xl font-black text-primary">{t("dashboard.share.title")}</h3>
        <p className="mt-1 text-sm text-on-surface-variant">{t("dashboard.share.hint")}</p>

        {code ? (
          <>
            <div className="my-6 flex justify-center">
              <div className="rounded-2xl bg-white p-4 shadow-md border border-outline-variant/20">
                <QRCode value={qrValue} size={150} bgColor="#ffffff" fgColor="#1a1a2e" level="M" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-mono font-black tracking-[0.35em] text-primary bg-primary/5 px-5 py-2.5 rounded-xl border-2 border-dashed border-primary/20">
                {code}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                title={t("dashboard.share.copy")}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container shadow-card hover:brightness-95 transition-all active:scale-90"
              >
                <span className="material-symbols-outlined text-base">
                  {copied ? "check" : "content_copy"}
                </span>
              </button>
            </div>
            {copied && (
              <p className="mt-2 text-xs font-bold text-success-on animate-fade-in-up">{t("dashboard.share.copied")}</p>
            )}
          </>
        ) : (
          <p className="my-6 text-sm text-on-surface-variant/60 italic">{t("dashboard.share.noCode")}</p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl border-2 border-primary py-2.5 text-sm font-bold text-primary hover:bg-surface-low transition-all"
        >
          {t("common.cancel")}
        </button>
      </div>
    </div>
  );
}

const ModalOverlay = ({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <div
    className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="w-full max-w-sm animate-slide-up-sheet rounded-[1.75rem] bg-white p-7 shadow-2xl ring-1 ring-black/5">
      {children}
    </div>
  </div>
);

export function DashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { patchUser } = useAuth();
  const queryClient = useQueryClient();
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [sharingRow, setSharingRow] = useState<ActiveCircleRow | null>(null);
  const [detailCircle, setDetailCircle] = useState<{ id: string; name: string } | null>(null);

  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpError, setTopUpError] = useState("");
  const topUpInputRef = useRef<HTMLInputElement>(null);

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const withdrawInputRef = useRef<HTMLInputElement>(null);

  const [showSalary, setShowSalary] = useState(false);
  const [newSalary, setNewSalary] = useState("");
  const [salaryError, setSalaryError] = useState("");
  const salaryInputRef = useRef<HTMLInputElement>(null);

  const profileQuery = useQuery({
    queryKey: ["users", "me"],
    queryFn: usersApi.fetchMe
  });
  const circlesQuery = useQuery({
    queryKey: ["users", "me", "circles"],
    queryFn: usersApi.fetchMyCircles
  });

  const topUpMutation = useMutation({
    mutationFn: (amount: number) => walletApi.topUpWallet(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      setShowTopUp(false); setTopUpAmount(""); setTopUpError("");
    },
    onError: (e) => setTopUpError(getApiErrorMessage(e))
  });
  const withdrawMutation = useMutation({
    mutationFn: (amount: number) => walletApi.withdrawWallet(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      setShowWithdraw(false); setWithdrawAmount(""); setWithdrawError("");
    },
    onError: (e) => setWithdrawError(getApiErrorMessage(e))
  });
  const salaryMutation = useMutation({
    mutationFn: (amount: number) => usersApi.updateSalary(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      setShowSalary(false); setSalaryError("");
    },
    onError: (e) => setSalaryError(getApiErrorMessage(e))
  });

  useEffect(() => { if (profileQuery.data) patchUser(usersApi.profileToUserSummary(profileQuery.data)); }, [profileQuery.data, patchUser]);
  useEffect(() => { if (showTopUp) setTimeout(() => topUpInputRef.current?.focus(), 50); }, [showTopUp]);
  useEffect(() => { if (showWithdraw) setTimeout(() => withdrawInputRef.current?.focus(), 50); }, [showWithdraw]);
  useEffect(() => { if (showSalary) setTimeout(() => salaryInputRef.current?.focus(), 50); }, [showSalary]);

  function handleTopUpSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(topUpAmount);
    if (!isFinite(amt) || amt <= 0) { setTopUpError(t("dashboard.errors.validAmount")); return; }
    topUpMutation.mutate(amt);
  }
  function handleWithdrawSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    const balance = user?.walletBalance ? parseFloat(user.walletBalance) : 0;
    if (!isFinite(amt) || amt <= 0) { setWithdrawError(t("dashboard.errors.validAmount")); return; }
    if (amt > balance) { setWithdrawError(t("withdraw.insufficient")); return; }
    withdrawMutation.mutate(amt);
  }
  function handleSalarySubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(newSalary);
    if (!isFinite(amt) || amt <= 0) { setSalaryError(t("dashboard.errors.validAmount")); return; }
    salaryMutation.mutate(amt);
  }
  async function handleLeave(circleId: string) {
    setLeavingId(circleId);
    try {
      await circlesApi.leaveCircle(circleId);
      await queryClient.invalidateQueries({ queryKey: ["users", "me", "circles"] });
      await queryClient.invalidateQueries({ queryKey: ["circles"] });
    } catch (e) {
      alert(getApiErrorMessage(e));
    } finally {
      setLeavingId(null);
    }
  }

  if (profileQuery.isLoading) return (
    <main className="mx-auto max-w-containerMax px-gutter py-12">
      <LoadingSpinner label={t("dashboard.loading")} />
    </main>
  );
  if (profileQuery.isError) return (
    <main className="mx-auto max-w-containerMax px-gutter py-10">
      <ErrorBanner message={getApiErrorMessage(profileQuery.error)} />
      <p className="mt-4 text-sm text-on-surface-variant">
        <Link to="/login" className="font-bold text-secondary hover:underline">{t("dashboard.returnLogin")}</Link>
      </p>
    </main>
  );

  const profile = profileQuery.data;
  if (!profile) return (
    <main className="mx-auto max-w-containerMax px-gutter py-12 text-primary">
      <p>{t("dashboard.noProfile")}</p>
      <Link to="/login" className="mt-4 inline-block font-bold text-secondary underline">{t("common.loginLink")}</Link>
    </main>
  );

  const activeFromApi = circlesQuery.data?.activeCircles ?? [];
  const burden = computeBurdenPercent(profile, activeFromApi);
  const activeRows = mapMembershipsToActiveRows(activeFromApi, t);
  const displayName = profile.fullName ?? user?.fullName ?? t("dashboard.fallbackName");
  const walletBalance = String(profile.walletBalance);
  const salaryValue = String(profile.salary);
  const currency = profile.currency;

  const actionBtns = [
    {
      id: "browse",
      label: t("dashboard.browse"),
      icon: "search",
      as: "link" as const,
      to: "/circles",
      cls: "bg-primary text-white hover:bg-primary/90",
    },
    {
      id: "topup",
      label: t("topUp.title"),
      icon: "add_circle",
      as: "button" as const,
      onClick: () => { setTopUpError(""); setShowTopUp(true); },
      cls: "bg-accent text-primary hover:brightness-105",
    },
    {
      id: "withdraw",
      label: t("withdraw.title"),
      icon: "remove_circle",
      as: "button" as const,
      disabled: !user?.walletBalance || parseFloat(user.walletBalance) <= 0,
      onClick: () => { setWithdrawError(""); setWithdrawAmount(""); setShowWithdraw(true); },
      cls: "bg-surface-high text-primary hover:bg-surface-high/80 disabled:opacity-40",
    },
    {
      id: "transactions",
      label: t("dashboard.transactions"),
      icon: "receipt_long",
      as: "link" as const,
      to: "/transactions",
      cls: "border-2 border-primary/20 bg-white text-primary hover:bg-slate-50",
    },
  ];

  return (
    <main className="relative min-h-screen">
      <div className="page-hero-bg px-gutter pt-28 pb-24">
        <img
          src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1600&q=70"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.12] mix-blend-luminosity pointer-events-none select-none animate-slow-zoom"
        />
        <div className="mx-auto max-w-containerMax relative z-10">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent font-black text-primary text-xl shadow-lg ring-4 ring-accent/25">
              {getInitials(displayName)}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-1">
                {t("dashboard.title")}
              </p>
              <h1 className="text-2xl font-black text-white md:text-3xl">
                {t("dashboard.welcome", { name: displayName })}
              </h1>
            </div>
          </div>

          {/* Action pill row */}
          <div className="mt-8 flex flex-wrap gap-3">
            {actionBtns.map((btn) =>
              btn.as === "link" ? (
                <Link
                  key={btn.id}
                  to={btn.to}
                  className={`btn-shimmer inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold shadow-md transition-all ${btn.cls}`}
                >
                  <span className="material-symbols-outlined text-[18px]">{btn.icon}</span>
                  {btn.label}
                </Link>
              ) : (
                <button
                  key={btn.id}
                  type="button"
                  disabled={btn.disabled}
                  onClick={btn.onClick}
                  className={`btn-shimmer inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold shadow-md transition-all ${btn.cls}`}
                >
                  <span className="material-symbols-outlined text-[18px]">{btn.icon}</span>
                  {btn.label}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Content cards (pulled up over hero) ── */}
      <div className="relative mx-auto max-w-containerMax px-gutter -mt-12 pb-16">
        {/* Floating currency symbols in white area */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {([
            { sym: "₿", x: "2%", top: "12%", size: "2.5rem", dur: "20s", delay: "0s", rot: "-8deg", op: "0.04", color: "#002645" },
            { sym: "$", x: "94%", top: "8%", size: "2rem", dur: "18s", delay: "3s", rot: "12deg", op: "0.04", color: "#fed65b" },
            { sym: "€", x: "90%", top: "50%", size: "1.8rem", dur: "22s", delay: "1s", rot: "-6deg", op: "0.04", color: "#002645" },
            { sym: "↗", x: "3%", top: "60%", size: "1.5rem", dur: "16s", delay: "5s", rot: "0deg", op: "0.05", color: "#002645" },
            { sym: "₹", x: "48%", top: "85%", size: "1.4rem", dur: "24s", delay: "7s", rot: "8deg", op: "0.03", color: "#fed65b" },
            { sym: "↑", x: "75%", top: "70%", size: "1.4rem", dur: "19s", delay: "4s", rot: "0deg", op: "0.04", color: "#002645" },
          ] as const).map(({ sym, x, top, size, dur, delay, rot, op, color }, i) => (
            <span key={i} className="float-symbol" style={{ left: x, top, fontSize: size, color, "--fs-dur": dur, "--fs-delay": delay, "--fs-rot": rot, "--fs-op": op } as React.CSSProperties}>{sym}</span>
          ))}
          <div className="absolute right-12 top-24 h-[220px] w-[220px] rounded-full border border-primary/[0.04] animate-spin-slow" />
          <div className="absolute left-4 bottom-40 h-[150px] w-[150px] rounded-full border border-accent/[0.05] animate-pulse-slow" />
          <div className="absolute right-1/4 bottom-20 h-[90px] w-[90px] rounded-full bg-accent/[0.03] animate-blob" />
        </div>
        <div className="relative z-10 grid gap-5 lg:grid-cols-2">
          {/* Wallet card */}
          <div className="stat-card animate-fade-in-scale" style={{ animationDelay: "0ms" }}>
            <WalletCard balance={walletBalance} currency={currency} label={t("dashboard.wallet")} />
          </div>

          <div
            className="group flex flex-col rounded-[1.25rem] border border-primary/10 bg-white/95 p-6 shadow-[0_2px_20px_-4px_rgba(0,38,69,0.08)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_12px_40px_-8px_rgba(0,38,69,0.14)] cursor-pointer animate-fade-in-scale"
            style={{ animationDelay: "80ms" }}
            onClick={() => { setNewSalary(salaryValue); setShowSalary(true); }}
          >
            <div className="flex items-center justify-between">
              <dt className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">
                {t("dashboard.salary")}
              </dt>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/[0.07] transition-colors duration-200 group-hover:bg-accent/15">
                <span className="material-symbols-outlined text-primary/40 text-base group-hover:text-primary transition-colors duration-200">edit_square</span>
              </div>
            </div>
            <dd className="mt-4 text-3xl font-black tabular-nums text-primary">
              <CurrencyDisplay amount={salaryValue} currency={currency} />
            </dd>
            <div className="mt-auto pt-4 h-0.5 w-0 bg-gradient-to-r from-accent to-primary/30 rounded-full transition-all duration-500 group-hover:w-full" />
          </div>

          {/* KYC widget */}
          <div className="lg:col-span-2 animate-fade-in-scale" style={{ animationDelay: "160ms" }}>
            <KycWidget status={profile.kycStatus} />
          </div>

          {/* Burden meter */}
          <div className="lg:col-span-2 animate-fade-in-scale" style={{ animationDelay: "240ms" }}>
            <BurdenMeter usedPercent={burden} />
          </div>

          {/* Active circles */}
          <div className="lg:col-span-2 animate-fade-in-scale" style={{ animationDelay: "320ms" }}>
            {circlesQuery.isError ? (
              <ErrorBanner message={getApiErrorMessage(circlesQuery.error)} />
            ) : null}
            {circlesQuery.isLoading ? (
              <div className="flex justify-center p-8">
                <LoadingSpinner label={t("dashboard.loadingCircles")} />
              </div>
            ) : (
              <ActiveCircles 
                items={activeRows} 
                onLeave={handleLeave} 
                leavingId={leavingId}
                sharingRow={sharingRow}
                setSharingRow={setSharingRow}
                detailCircle={detailCircle}
                setDetailCircle={setDetailCircle}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {showTopUp && (
        <ModalOverlay onClose={() => setShowTopUp(false)}>
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15">
              <span className="material-symbols-outlined text-primary">add_circle</span>
            </div>
            <h2 className="text-lg font-black text-primary">{t("dashboard.topUpModal.title")}</h2>
          </div>
          <p className="mt-1 mb-5 text-sm text-on-surface-variant">{t("dashboard.topUpModal.hint")}</p>
          <form onSubmit={handleTopUpSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant">{t("dashboard.topUpModal.amountLabel")} ({currency})</label>
              <input
                ref={topUpInputRef}
                type="number" min="1" step="0.01" value={topUpAmount}
                onChange={(e) => { setTopUpAmount(e.target.value); setTopUpError(""); }}
                className="hp-input mt-2"
              />
            </div>
            {topUpError && <p className="text-xs font-bold text-danger">{topUpError}</p>}
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={topUpMutation.isPending} className="btn-shimmer flex-1 rounded-xl bg-primary py-3 text-sm font-black text-white shadow disabled:opacity-60">
                {topUpMutation.isPending ? t("dashboard.topUpModal.processing") : t("dashboard.topUpModal.confirm")}
              </button>
              <button type="button" onClick={() => setShowTopUp(false)} className="rounded-xl border border-outline-variant px-5 py-3 text-sm font-bold text-on-surface">
                {t("dashboard.topUpModal.cancel")}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {showWithdraw && (
        <ModalOverlay onClose={() => setShowWithdraw(false)}>
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <span className="material-symbols-outlined text-primary">remove_circle</span>
            </div>
            <h2 className="text-lg font-black text-primary">{t("withdraw.title")}</h2>
          </div>
          <p className="mt-1 mb-5 text-sm text-on-surface-variant">{t("withdraw.hint")}</p>
          <form onSubmit={handleWithdrawSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant">{t("dashboard.topUpModal.amountLabel")} ({currency})</label>
              <input
                ref={withdrawInputRef}
                type="number" min="1" step="0.01" value={withdrawAmount}
                onChange={(e) => { setWithdrawAmount(e.target.value); setWithdrawError(""); }}
                className="hp-input mt-2"
              />
            </div>
            {withdrawError && <p className="text-xs font-bold text-danger">{withdrawError}</p>}
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={withdrawMutation.isPending} className="btn-shimmer flex-1 rounded-xl bg-primary py-3 text-sm font-black text-white shadow disabled:opacity-60">
                {withdrawMutation.isPending ? t("withdraw.submitting") : t("withdraw.submit")}
              </button>
              <button type="button" onClick={() => setShowWithdraw(false)} className="rounded-xl border border-outline-variant px-5 py-3 text-sm font-bold text-on-surface">
                {t("withdraw.cancel")}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {showSalary && (
        <ModalOverlay onClose={() => setShowSalary(false)}>
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15">
              <span className="material-symbols-outlined text-primary">edit_square</span>
            </div>
            <h2 className="text-lg font-black text-primary">{t("dashboard.salaryModal.title")}</h2>
          </div>
          <p className="mt-1 mb-5 text-sm text-on-surface-variant">{t("dashboard.salaryModal.hint")}</p>
          <form onSubmit={handleSalarySubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant">{t("dashboard.salaryModal.label")} ({currency})</label>
              <input
                ref={salaryInputRef}
                type="number" min="1" step="1" value={newSalary}
                onChange={(e) => { setNewSalary(e.target.value); setSalaryError(""); }}
                className="hp-input mt-2"
              />
            </div>
            {salaryError && <p className="text-xs font-bold text-danger">{salaryError}</p>}
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={salaryMutation.isPending} className="btn-shimmer flex-1 rounded-xl bg-primary py-3 text-sm font-black text-white shadow disabled:opacity-60">
                {salaryMutation.isPending ? t("dashboard.salaryModal.updating") : t("dashboard.salaryModal.save")}
              </button>
              <button type="button" onClick={() => setShowSalary(false)} className="rounded-xl border border-outline-variant px-5 py-3 text-sm font-bold text-on-surface">
                {t("dashboard.salaryModal.cancel")}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* ── Circle Modals ── */}
      {sharingRow && <ShareModal row={sharingRow} onClose={() => setSharingRow(null)} />}
      {detailCircle && (
        <CircleDetailDrawer
          circleId={detailCircle.id}
          circleName={detailCircle.name}
          onClose={() => setDetailCircle(null)}
        />
      )}
    </main>
  );
}
