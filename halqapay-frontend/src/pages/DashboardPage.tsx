import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import * as circlesApi from "../api/circles";
import * as usersApi from "../api/users";
import * as walletApi from "../api/wallet";
import { ActiveCircles } from "../components/dashboard/ActiveCircles";
import { BurdenMeter } from "../components/dashboard/BurdenMeter";
import { KycWidget } from "../components/dashboard/KycWidget";
import { WalletCard } from "../components/dashboard/WalletCard";
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

export function DashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { patchUser } = useAuth();
  const queryClient = useQueryClient();
  const [leavingId, setLeavingId] = useState<string | null>(null);

  // Top-up modal state
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpError, setTopUpError] = useState("");
  const topUpInputRef = useRef<HTMLInputElement>(null);

  // Withdraw modal state
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const withdrawInputRef = useRef<HTMLInputElement>(null);

  // Salary modal state
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
      setShowTopUp(false);
      setTopUpAmount("");
      setTopUpError("");
    },
    onError: (e) => setTopUpError(getApiErrorMessage(e))
  });

  const withdrawMutation = useMutation({
    mutationFn: (amount: number) => walletApi.withdrawWallet(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      setShowWithdraw(false);
      setWithdrawAmount("");
      setWithdrawError("");
    },
    onError: (e) => setWithdrawError(getApiErrorMessage(e))
  });

  const salaryMutation = useMutation({
    mutationFn: (amount: number) => usersApi.updateSalary(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      setShowSalary(false);
      setSalaryError("");
    },
    onError: (e) => setSalaryError(getApiErrorMessage(e))
  });

  useEffect(() => {
    if (profileQuery.data) {
      patchUser(usersApi.profileToUserSummary(profileQuery.data));
    }
  }, [profileQuery.data, patchUser]);

  useEffect(() => {
    if (showTopUp) setTimeout(() => topUpInputRef.current?.focus(), 50);
  }, [showTopUp]);

  useEffect(() => {
    if (showWithdraw) setTimeout(() => withdrawInputRef.current?.focus(), 50);
  }, [showWithdraw]);

  useEffect(() => {
    if (showSalary) setTimeout(() => salaryInputRef.current?.focus(), 50);
  }, [showSalary]);

  function handleTopUpSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(topUpAmount);
    if (!isFinite(amt) || amt <= 0) {
      setTopUpError(t("dashboard.errors.validAmount"));
      return;
    }
    topUpMutation.mutate(amt);
  }

  function handleWithdrawSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    const balance = user?.walletBalance ? parseFloat(user.walletBalance) : 0;

    if (!isFinite(amt) || amt <= 0) {
      setWithdrawError(t("dashboard.errors.validAmount"));
      return;
    }
    if (amt > balance) {
      setWithdrawError(t("withdraw.insufficient"));
      return;
    }
    withdrawMutation.mutate(amt);
  }

  function handleSalarySubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(newSalary);
    if (!isFinite(amt) || amt <= 0) {
      setSalaryError(t("dashboard.errors.validAmount"));
      return;
    }
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

  if (profileQuery.isLoading) {
    return (
      <main className="mx-auto max-w-containerMax px-gutter py-12">
        <LoadingSpinner label={t("dashboard.loading")} />
      </main>
    );
  }

  if (profileQuery.isError) {
    return (
      <main className="mx-auto max-w-containerMax px-gutter py-10">
        <ErrorBanner message={getApiErrorMessage(profileQuery.error)} />
        <p className="mt-4 text-sm text-on-surface-variant">
          <Link to="/login" className="font-bold text-secondary hover:underline">
            {t("dashboard.returnLogin")}
          </Link>
        </p>
      </main>
    );
  }

  const profile = profileQuery.data;
  if (!profile) {
    return (
      <main className="mx-auto max-w-containerMax px-gutter py-12 text-primary">
        <p>{t("dashboard.noProfile")}</p>
        <Link to="/login" className="mt-4 inline-block font-bold text-secondary underline">
          {t("common.loginLink")}
        </Link>
      </main>
    );
  }

  const activeFromApi = circlesQuery.data?.activeCircles ?? [];
  const burden = computeBurdenPercent(profile, activeFromApi);
  const activeRows = mapMembershipsToActiveRows(activeFromApi, t);
  const displayName = profile.fullName ?? user?.fullName ?? t("dashboard.fallbackName");
  const walletBalance = String(profile.walletBalance);
  const salaryValue = String(profile.salary);
  const currency = profile.currency;

  return (
    <main className="mx-auto max-w-containerMax px-gutter py-10">
      <h1 className="text-2xl font-bold text-primary md:text-3xl">{t("dashboard.title")}</h1>
      <p className="mt-2 text-on-surface-variant">
        {t("dashboard.welcome", { name: displayName })}
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <WalletCard
          balance={walletBalance}
          currency={currency}
          label={t("dashboard.wallet")}
        />
        <div 
          onClick={() => { setNewSalary(salaryValue); setShowSalary(true); }}
          className="flex cursor-pointer flex-col rounded-card border border-outline-variant bg-surface-lowest p-6 shadow-card transition-all hover:bg-surface-low"
        >
          <div className="flex items-center justify-between">
            <dt className="text-xs font-black uppercase tracking-widest text-on-surface-variant/70">
              {t("dashboard.salary")}
            </dt>
            <span className="material-symbols-outlined text-primary text-xl">edit_square</span>
          </div>
          <dd className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-primary">
              <CurrencyDisplay amount={salaryValue} currency={currency} />
            </span>
          </dd>
        </div>
        <div className="lg:col-span-2">
          <KycWidget status={profile.kycStatus} />
        </div>
        <div className="lg:col-span-2">
          <BurdenMeter usedPercent={burden} />
        </div>
        <div className="lg:col-span-2">
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
            />
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/circles"
          className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-on shadow-card hover:opacity-95"
        >
          {t("dashboard.browse")}
        </Link>
        <button
          type="button"
          onClick={() => { setTopUpError(""); setShowTopUp(true); }}
          className="inline-flex rounded-lg bg-secondary-container px-5 py-2.5 text-sm font-bold text-on-secondary-container shadow-card hover:brightness-95"
        >
          {t("topUp.title")}
        </button>
        <button
          type="button"
          disabled={!user?.walletBalance || parseFloat(user.walletBalance) <= 0}
          onClick={() => { setWithdrawError(""); setWithdrawAmount(""); setShowWithdraw(true); }}
          className="inline-flex rounded-lg bg-surface-variant px-5 py-2.5 text-sm font-bold text-on-surface-variant shadow-card hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("withdraw.title")}
        </button>
        <Link
          to="/transactions"
          className="inline-flex rounded-lg border-2 border-primary px-5 py-2.5 text-sm font-bold text-primary hover:bg-surface-low"
        >
          {t("dashboard.transactions")}
        </Link>
      </div>

      {showTopUp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowTopUp(false); }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-bold text-primary">{t("dashboard.topUpModal.title")}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">{t("dashboard.topUpModal.hint")}</p>
            <form onSubmit={handleTopUpSubmit} className="mt-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant">{t("dashboard.topUpModal.amountLabel")} ({currency})</label>
                <input
                  ref={topUpInputRef}
                  type="number" min="1" step="0.01" value={topUpAmount}
                  onChange={(e) => { setTopUpAmount(e.target.value); setTopUpError(""); }}
                  className="mt-2 w-full rounded-lg border border-outline-variant bg-surface-lowest px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                />
              </div>
              {topUpError && <p className="text-xs font-medium text-error">{topUpError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={topUpMutation.isPending} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-on shadow-card">{topUpMutation.isPending ? t("dashboard.topUpModal.processing") : t("dashboard.topUpModal.confirm")}</button>
                <button type="button" onClick={() => setShowTopUp(false)} className="rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-bold text-on-surface">{t("dashboard.topUpModal.cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWithdraw && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowWithdraw(false); }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-bold text-primary">{t("withdraw.title")}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">{t("withdraw.hint")}</p>
            <form onSubmit={handleWithdrawSubmit} className="mt-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant">{t("dashboard.topUpModal.amountLabel")} ({currency})</label>
                <input
                  ref={withdrawInputRef}
                  type="number" min="1" step="0.01" value={withdrawAmount}
                  onChange={(e) => { setWithdrawAmount(e.target.value); setWithdrawError(""); }}
                  className="mt-2 w-full rounded-lg border border-outline-variant bg-surface-lowest px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                />
              </div>
              {withdrawError && <p className="text-xs font-medium text-error">{withdrawError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={withdrawMutation.isPending} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-on shadow-card">{withdrawMutation.isPending ? t("withdraw.submitting") : t("withdraw.submit")}</button>
                <button type="button" onClick={() => setShowWithdraw(false)} className="rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-bold text-on-surface">{t("withdraw.cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSalary && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSalary(false); }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-bold text-primary">{t("dashboard.salaryModal.title")}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">{t("dashboard.salaryModal.hint")}</p>
            <form onSubmit={handleSalarySubmit} className="mt-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant">{t("dashboard.salaryModal.label")} ({currency})</label>
                <input
                  ref={salaryInputRef}
                  type="number" min="1" step="1" value={newSalary}
                  onChange={(e) => { setNewSalary(e.target.value); setSalaryError(""); }}
                  className="mt-2 w-full rounded-lg border border-outline-variant bg-surface-lowest px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                />
              </div>
              {salaryError && <p className="text-xs font-medium text-error">{salaryError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={salaryMutation.isPending} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-on shadow-card">{salaryMutation.isPending ? t("dashboard.salaryModal.updating") : t("dashboard.salaryModal.save")}</button>
                <button type="button" onClick={() => setShowSalary(false)} className="rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-bold text-on-surface">{t("dashboard.salaryModal.cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
