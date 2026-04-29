import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import * as usersApi from "../api/users";
import { ActiveCircles } from "../components/dashboard/ActiveCircles";
import { BurdenMeter } from "../components/dashboard/BurdenMeter";
import { WalletCard } from "../components/dashboard/WalletCard";
import { ErrorBanner } from "../components/shared/ErrorBanner";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import { getApiErrorMessage } from "../lib/apiError";
import { computeBurdenPercent, mapMembershipsToActiveRows } from "../lib/dashboardUtils";
import { useAuthStore } from "../store/authStore";

export function DashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { patchUser } = useAuth();

  const profileQuery = useQuery({
    queryKey: ["users", "me"],
    queryFn: usersApi.fetchMe
  });

  const circlesQuery = useQuery({
    queryKey: ["users", "me", "circles"],
    queryFn: usersApi.fetchMyCircles
  });

  useEffect(() => {
    if (profileQuery.data) {
      patchUser(usersApi.profileToUserSummary(profileQuery.data));
    }
  }, [profileQuery.data, patchUser]);

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

  const activeFromApi =
    circlesQuery.data?.activeCircles ?? profile.activeCircles ?? [];
  const burden = computeBurdenPercent(profile, activeFromApi);
  const activeRows = mapMembershipsToActiveRows(activeFromApi, t);
  const displayName = profile.fullName ?? user?.fullName ?? "Member";
  const walletBalance = String(profile.walletBalance);
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
        <div className="lg:col-span-2">
          <BurdenMeter usedPercent={burden} />
        </div>
        <div className="lg:col-span-2">
          {circlesQuery.isError ? (
            <ErrorBanner message={getApiErrorMessage(circlesQuery.error)} />
          ) : null}
          <ActiveCircles items={activeRows} />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/circles"
          className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-on shadow-card hover:opacity-95"
        >
          {t("dashboard.browse")}
        </Link>
        <Link
          to="/transactions"
          className="inline-flex rounded-lg border-2 border-primary px-5 py-2.5 text-sm font-bold text-primary hover:bg-surface-low"
        >
          {t("dashboard.transactions")}
        </Link>
      </div>
    </main>
  );
}
