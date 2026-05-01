import { useTranslation } from "react-i18next";
import type { CurrencyCode } from "../../types";

export function CurrencyDisplay({
  amount,
  currency
}: {
  amount: number | string;
  currency: CurrencyCode;
}) {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("ar") ? "ar-EG" : "en-US";
  const n = typeof amount === "string" ? Number(amount) : amount;
  const formatted = Number.isFinite(n)
    ? n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : String(amount);
  return (
    <span className="tabular-nums">
      {formatted} {currency}
    </span>
  );
}
