import { useTranslation } from "react-i18next";
import type { ActiveCircleRow } from "../../types";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";

export function ActiveCircles({
  items,
  onLeave,
  leavingId
}: {
  items: ActiveCircleRow[];
  onLeave?: (circleId: string) => void;
  leavingId?: string | null;
}) {
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
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-sm text-on-surface">{row.payoutStatus}</p>
                {row.circleStatus === "OPEN" && onLeave ? (
                  <button
                    type="button"
                    onClick={() => onLeave(row.circleId)}
                    disabled={leavingId === row.circleId}
                    className="rounded-lg border border-error/30 px-3 py-1.5 text-xs font-bold text-error transition-all hover:bg-error/5 active:scale-95 disabled:opacity-50"
                  >
                    {leavingId === row.circleId
                      ? t("dashboard.leaving", "Leaving...")
                      : t("dashboard.leaveCircle", "Leave Circle")}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
