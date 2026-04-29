import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import * as usersApi from "../api/users";
import { CurrencyDisplay } from "../components/shared/CurrencyDisplay";
import { ErrorBanner } from "../components/shared/ErrorBanner";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { getApiErrorMessage } from "../lib/apiError";
import type { TransactionResponse } from "../types";

function formatWhen(iso: string, locale: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const loc = locale.startsWith("ar") ? "ar-EG" : "en-US";
  return d.toLocaleString(loc, {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export function TransactionsPage() {
  const { t, i18n } = useTranslation();
  const q = useQuery({
    queryKey: ["users", "me", "transactions"],
    queryFn: async () => {
      const res = await usersApi.fetchMyTransactions();
      return res.transactions ?? [];
    }
  });

  return (
    <main className="mx-auto max-w-4xl px-gutter py-10">
      <h1 className="text-2xl font-bold text-primary md:text-3xl">{t("transactions.title")}</h1>
      <p className="mt-2 text-sm text-on-surface-variant">{t("transactions.subtitle")}</p>

      <div className="mt-8">
        {q.isLoading ? <LoadingSpinner label={t("transactions.loading")} /> : null}
        {q.isError ? <ErrorBanner message={getApiErrorMessage(q.error)} /> : null}
        {q.data && q.data.length === 0 ? (
          <p className="rounded-card border border-dashed border-outline-variant bg-surface-lowest px-4 py-10 text-center text-sm text-on-surface-variant">
            {t("transactions.empty")}
          </p>
        ) : null}
        {q.data && q.data.length > 0 ? (
          <ul className="divide-y divide-outline-variant overflow-hidden rounded-card border border-outline-variant bg-surface-lowest shadow-card">
            {q.data.map((tx: TransactionResponse) => (
              <li
                key={tx.id}
                className="px-4 py-4 sm:flex sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-bold text-primary">{tx.type}</p>
                  <p className="text-xs text-on-surface-variant">
                    {formatWhen(tx.createdAt, i18n.language)}
                  </p>
                  {tx.description ? (
                    <p className="mt-1 text-sm text-on-surface">{tx.description}</p>
                  ) : null}
                </div>
                <div className="mt-2 text-end sm:mt-0">
                  <p className="text-sm font-bold tabular-nums text-primary">
                    <CurrencyDisplay amount={tx.amount} currency={tx.currency} />
                  </p>
                  <p className="text-xs text-on-surface-variant">{tx.status}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  );
}
