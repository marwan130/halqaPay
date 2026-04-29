import { useTranslation } from "react-i18next";

export function BurdenMeter({ usedPercent }: { usedPercent: number }) {
  const { t } = useTranslation();
  const pct = Math.min(100, Math.max(0, usedPercent));
  const barColor =
    pct > 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-400" : "bg-emerald-600";
  return (
    <section className="rounded-card border border-outline-variant bg-surface-lowest p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {t("dashboard.capacity")}
        </h2>
        <span className="text-sm font-bold tabular-nums text-primary">{pct.toFixed(0)}%</span>
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-surface-container">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-on-surface-variant">{t("dashboard.capacityHint")}</p>
    </section>
  );
}
