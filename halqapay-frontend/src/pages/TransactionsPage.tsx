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

const HERO_FLOATS = [
  { sym: "₿", x: "6%",  top: "60%", size: "3rem",   dur: "18s", delay: "0s",  rot: "-12deg", op: "0.10", color: "#fed65b" },
  { sym: "€", x: "88%", top: "50%", size: "2.5rem", dur: "20s", delay: "2s",  rot: "-6deg",  op: "0.09", color: "#fff" },
  { sym: "↑", x: "78%", top: "70%", size: "2rem",   dur: "15s", delay: "1s",  rot: "0deg",   op: "0.10", color: "#4ade80" },
  { sym: "$", x: "20%", top: "30%", size: "1.8rem", dur: "22s", delay: "3s",  rot: "8deg",   op: "0.07", color: "#fff" },
  { sym: "↗", x: "60%", top: "35%", size: "1.6rem", dur: "17s", delay: "5s",  rot: "0deg",   op: "0.07", color: "#4ade80" },
  { sym: "₹", x: "42%", top: "75%", size: "1.5rem", dur: "14s", delay: "4s",  rot: "10deg",  op: "0.06", color: "#fed65b" },
];

const CONTENT_FLOATS = [
  { sym: "₿", x: "3%",  top: "20%", size: "2.5rem", dur: "20s", delay: "0s",  rot: "-8deg",  op: "0.04", color: "#002645" },
  { sym: "$", x: "92%", top: "15%", size: "2rem",   dur: "18s", delay: "3s",  rot: "12deg",  op: "0.04", color: "#fed65b" },
  { sym: "€", x: "88%", top: "55%", size: "1.8rem", dur: "22s", delay: "1s",  rot: "-6deg",  op: "0.04", color: "#002645" },
  { sym: "↗", x: "5%",  top: "65%", size: "1.5rem", dur: "16s", delay: "5s",  rot: "0deg",   op: "0.05", color: "#002645" },
  { sym: "₹", x: "50%", top: "80%", size: "1.4rem", dur: "24s", delay: "7s",  rot: "8deg",   op: "0.03", color: "#fed65b" },
];

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
    <main className="relative min-h-screen">
      <div className="page-hero-bg px-gutter pt-28 pb-28 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1600&q=70"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.10] mix-blend-luminosity pointer-events-none select-none animate-slow-zoom"
        />
        {/* Floating currency symbols */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {HERO_FLOATS.map(({ sym, x, top, size, dur, delay, rot, op, color }, i) => (
            <span
              key={i}
              className="float-symbol"
              style={{ left: x, top, fontSize: size, color, "--fs-dur": dur, "--fs-delay": delay, "--fs-rot": rot, "--fs-op": op } as React.CSSProperties}
            >{sym}</span>
          ))}
          {/* Animated rings */}
          <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/[0.06]" />
          <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03] animate-spin-slow" />
        </div>

        <div className="mx-auto max-w-4xl relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="reveal inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-white/80 backdrop-blur-sm ring-1 ring-white/15">
              <span className="material-symbols-outlined text-lg text-accent">receipt_long</span>
              <span className="text-xs font-black uppercase tracking-widest">{t("nav.transactions", "Transactions")}</span>
            </div>
          </div>
          <h1 className="reveal text-4xl font-black text-white md:text-5xl tracking-tight">{t("transactions.title")}</h1>
          <p className="reveal mt-3 text-base font-semibold text-white/60 max-w-xl">{t("transactions.subtitle")}</p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative mx-auto max-w-4xl px-gutter -mt-14 pb-16">
        {/* Floating currency symbols in white area */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {CONTENT_FLOATS.map(({ sym, x, top, size, dur, delay, rot, op, color }, i) => (
            <span
              key={i}
              className="float-symbol"
              style={{ left: x, top, fontSize: size, color, "--fs-dur": dur, "--fs-delay": delay, "--fs-rot": rot, "--fs-op": op } as React.CSSProperties}
            >{sym}</span>
          ))}
          {/* Decorative rings */}
          <div className="absolute right-8 top-32 h-[200px] w-[200px] rounded-full border border-primary/[0.04] animate-spin-slow" />
          <div className="absolute left-4 bottom-32 h-[140px] w-[140px] rounded-full border border-accent/[0.05] animate-pulse-slow" />
          <div className="absolute right-1/3 bottom-16 h-[80px] w-[80px] rounded-full bg-accent/[0.03] animate-blob" />
        </div>

        <div className="relative z-10">
          {q.isLoading ? <LoadingSpinner label={t("transactions.loading")} /> : null}
          {q.isError ? <ErrorBanner message={getApiErrorMessage(q.error)} /> : null}
          {q.data && q.data.length === 0 ? (
            <p className="reveal rounded-card border border-dashed border-outline-variant bg-surface-lowest px-4 py-10 text-center text-sm text-on-surface-variant">
              {t("transactions.empty")}
            </p>
          ) : null}
          {q.data && q.data.length > 0 ? (
            <ul className="reveal reveal-up divide-y divide-outline-variant overflow-hidden rounded-card border border-outline-variant bg-surface-lowest shadow-card">
              {q.data.map((tx: TransactionResponse) => (
                <li
                  key={tx.id}
                  className="tx-row px-5 py-4 sm:flex sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-primary">{t(`transactions.types.${tx.type}`, tx.type)}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
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
                    <p className="text-xs text-on-surface-variant mt-0.5">{t(`transactions.status.${tx.status}`, tx.status)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </main>
  );
}