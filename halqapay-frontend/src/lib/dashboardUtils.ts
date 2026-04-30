import type { TFunction } from "i18next";
import type {
  ActiveCircleRow,
  CurrencyCode,
  MyCircleMembershipSummary,
  UserProfileResponse
} from "../types";

function toNumber(value: string | number | undefined): number {
  if (value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const n = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function computeBurdenPercent(
  profile: UserProfileResponse | undefined,
  active: MyCircleMembershipSummary[]
): number {
  const salary = toNumber(profile?.salary);
  if (salary <= 0) return 0;
  const limit = salary * 0.4;
  if (limit <= 0) return 0;
  let total = 0;
  for (const row of active) {
    total += toNumber(row.monthlyContribution ?? row.monthlyPayment);
  }
  return Math.min(100, (total / limit) * 100);
}

export function mapMembershipsToActiveRows(
  items: MyCircleMembershipSummary[],
  t: TFunction
): ActiveCircleRow[] {
  return items.map((m) => {
    const duration = m.durationMonths ?? 0;
    const current = m.currentMonth ?? 0;
    const monthsRemaining =
      m.monthsRemaining ?? Math.max(0, duration - current);
    const monthly = String(m.monthlyContribution ?? m.monthlyPayment ?? "0");
    const currency = (m.currency ?? "USD") as CurrencyCode;
    const payoutStatus =
      m.payoutStatus ??
      (m.slotNumber != null
        ? t("dashboard.payoutSlot", { n: m.slotNumber })
        : t("dashboard.payoutManaged"));
    return {
      circleId: m.circleId,
      name: m.name,
      monthlyAmount: monthly,
      currency,
      monthsRemaining,
      payoutStatus,
      circleStatus: m.status
    };
  });
}
