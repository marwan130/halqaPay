import { useTranslation } from "react-i18next";
import type { ActiveCircleRow } from "../../types";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";

export function ActiveCircles({ items }: { items: ActiveCircleRow[] }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("ar") ? "ar-EG" : "en-US";
  return (
    <section className="rounded-card border border-outline-variant bg-surface-lowest p-6 shadow-card">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
        {t("dashboard.activeTitle")}
      </h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-on-surface-variant">{t("dashboard.activeEmpty")}</p>
      ) : (
        <ul className="mt-4 divide-y divide-outline-variant">
          {items.map((row) => (
            <li key={row.circleId} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <span className="font-bold text-primary">{row.name}</span>
                <span className="text-sm font-bold tabular-nums text-primary">
                  <CurrencyDisplay
                    amount={row.monthlyAmount}
                    currency={row.currency}
                  />
                  <span className="ms-1 font-medium text-on-surface-variant">
                    {t("dashboard.perMonth")}
                  </span>
                </span>
              </div>
              <p className="mt-1 text-sm text-on-surface-variant">
                {t("dashboard.monthsLeft", { count: row.monthsRemaining.toLocaleString(locale) })}
              </p>
              <p className="mt-2 text-sm text-on-surface">{row.payoutStatus}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
