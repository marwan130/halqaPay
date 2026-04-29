import type { CurrencyCode } from "../../types";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";

export function WalletCard({
  balance,
  currency,
  label
}: {
  balance: string;
  currency: CurrencyCode;
  label: string;
}) {
  return (
    <section className="rounded-card border border-outline-variant bg-surface-lowest p-6 shadow-card">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
        {label}
      </h2>
      <p className="mt-3 text-2xl font-bold tabular-nums text-primary">
        <CurrencyDisplay amount={balance} currency={currency} />
      </p>
    </section>
  );
}
