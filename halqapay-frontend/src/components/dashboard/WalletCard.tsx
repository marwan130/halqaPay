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
    <section className="flex h-full flex-col rounded-[1.25rem] border border-primary/10 bg-white/95 p-6 shadow-[0_2px_20px_-4px_rgba(0,38,69,0.08)]">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">
          {label}
        </h2>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/[0.07]">
          <span className="material-symbols-outlined text-primary/40 text-base">account_balance_wallet</span>
        </div>
      </div>
      <p className="mt-4 text-3xl font-black tabular-nums text-primary">
        <CurrencyDisplay amount={balance} currency={currency} />
      </p>
    </section>
  );
}
