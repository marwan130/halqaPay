import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import type { CircleResponse } from "../../types";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";

export function CircleCard({
  circle,
  onJoin,
  isJoined = false
}: {
  circle: CircleResponse;
  onJoin: (circle: CircleResponse) => void;
  isJoined?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("ar") ? "ar-EG" : "en-US";
  const slotsLeft = Math.max(circle.maxMembers - circle.currentMembers, 0);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    return format(new Date(dateStr), "MMM d, yyyy");
  };
  return (
    <article className="flex flex-col rounded-card border border-outline-variant bg-surface-lowest p-6 shadow-card transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-fixed text-primary">
          <span className="material-symbols-outlined text-2xl text-primary-container">
            savings
          </span>
        </div>
        <div className="flex gap-2">
          {circle.isAffordable && (
            <span className="flex items-center gap-1 rounded-full bg-success-container px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-success-on border border-success/20">
              <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              {t("circles.card.affordable")}
            </span>
          )}
          <span className="rounded-full bg-surface-high px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            {t(`circles.status.${circle.status}`, circle.status)}
          </span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-primary">{circle.name}</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-xs font-bold uppercase text-on-surface-variant">
            {t("circles.card.totalValue")}
          </dt>
          <dd className="text-end font-bold tabular-nums text-primary">
            <CurrencyDisplay amount={circle.totalValue} currency={circle.currency} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-xs font-bold uppercase text-on-surface-variant">
            {t("circles.card.duration")}
          </dt>
          <dd className="text-end font-bold tabular-nums text-primary">
            {circle.durationMonths.toLocaleString(locale)} {t("circles.card.months")}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-xs font-bold uppercase text-on-surface-variant">
            {t("circles.card.monthly")}
          </dt>
          <dd className="text-end font-bold tabular-nums text-secondary">
            <CurrencyDisplay
              amount={circle.monthlyContribution}
              currency={circle.currency}
            />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-xs font-bold uppercase text-on-surface-variant">
            {t("circles.card.slotsLeft")}
          </dt>
          <dd className="text-end font-bold tabular-nums text-primary">
            {slotsLeft.toLocaleString(locale)}
          </dd>
        </div>
        {circle.status === "ACTIVE" && (
          <>
            <div className="flex items-center justify-between gap-2 border-t border-outline-variant/20 pt-3">
              <dt className="text-xs font-bold uppercase text-on-surface-variant">
                {t("circles.card.nextPayout")}
              </dt>
              <dd className="text-end font-bold tabular-nums text-success">
                {formatDate(circle.nextPayoutDate)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-xs font-bold uppercase text-on-surface-variant">
                {t("circles.card.deadline")}
              </dt>
              <dd className="text-end font-bold tabular-nums text-error">
                {formatDate(circle.nextDeadline)}
              </dd>
            </div>
          </>
        )}
      </dl>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-container">
        <div
          className="h-full rounded-full bg-secondary-container transition-all"
          style={{
            width: `${circle.maxMembers ? (circle.currentMembers / circle.maxMembers) * 100 : 0}%`
          }}
        />
      </div>
      {isJoined ? (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-success-container/10 p-3.5 text-sm font-black text-success border border-success/20">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          {t("circles.card.alreadyJoined")}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onJoin(circle)}
          disabled={slotsLeft === 0 || circle.status !== "OPEN"}
          className="mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-black text-primary-on shadow-card transition-all hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("circles.card.join")}
        </button>
      )}
    </article>
  );
}
