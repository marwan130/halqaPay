import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import type { ActiveCircleRow } from "../../types";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";
import { CircleDetailDrawer } from "./CircleDetailDrawer";

/* ─── Countdown hook ─────────────────────────────────────────── */
function useCountdown(targetIso: string | null | undefined) {
  const [parts, setParts] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, passed: false });

  useEffect(() => {
    if (!targetIso) return;
    function tick() {
      const diff = new Date(targetIso!).getTime() - Date.now();
      if (diff <= 0) {
        setParts({ days: 0, hours: 0, minutes: 0, seconds: 0, passed: true });
        return;
      }
      const s = Math.floor(diff / 1000);
      setParts({
        days: Math.floor(s / 86400),
        hours: Math.floor((s % 86400) / 3600),
        minutes: Math.floor((s % 3600) / 60),
        seconds: s % 60,
        passed: false
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return parts;
}

/* ─── Tiny helper: pad with 0 ────────────────────────────────── */
const pad = (n: number) => String(n).padStart(2, "0");

/* ─── Per-circle countdown row ────────────────────────────────── */
function CountdownChip({ labelKey, dateIso }: { labelKey: string; dateIso: string | null | undefined }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("ar") ? "ar-EG" : "en-US";
  const c = useCountdown(dateIso);
  if (!dateIso) return null;
  const formatted = new Date(dateIso).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  return (
    <div className="mt-2 rounded-xl border border-outline-variant/40 bg-surface-low px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">{t(labelKey)}</p>
      <p className="mt-0.5 text-xs font-semibold text-on-surface-variant">{formatted}</p>
      {!c.passed ? (
        <div className="mt-1 flex gap-2">
          {[
            [c.days, t("dashboard.time.days")],
            [c.hours, t("dashboard.time.hours")],
            [c.minutes, t("dashboard.time.minutes")],
            [c.seconds, t("dashboard.time.seconds")]
          ].map(([val, label]) => (
            <div key={String(label)} className="flex flex-col items-center">
              <span className="min-w-[2ch] rounded-md bg-primary/10 px-1 py-0.5 text-center text-sm font-black tabular-nums text-primary">
                {pad(Number(val))}
              </span>
              <span className="mt-0.5 text-[9px] font-bold uppercase text-on-surface-variant/50">{label}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-xs font-bold text-success-on">{t("dashboard.time.passed")}</p>
      )}
    </div>
  );
}

/* ─── Share modal ────────────────────────────────────────────── */
function ShareModal({ row, onClose }: { row: ActiveCircleRow; onClose: () => void }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const code = row.inviteCode ?? "";
  const qrValue = `${window.location.origin}/circles?code=${code}`;

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-3xl bg-surface-lowest p-8 shadow-2xl border border-outline-variant/30 animate-fade-in-up text-center">
        <h3 className="text-xl font-black text-primary">{t("dashboard.share.title")}</h3>
        <p className="mt-1 text-sm text-on-surface-variant">{t("dashboard.share.hint")}</p>

        {code ? (
          <>
            <div className="my-6 flex justify-center">
              <div className="rounded-2xl bg-white p-4 shadow-md border border-outline-variant/20">
                <QRCode value={qrValue} size={150} bgColor="#ffffff" fgColor="#1a1a2e" level="M" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-mono font-black tracking-[0.35em] text-primary bg-primary/5 px-5 py-2.5 rounded-xl border-2 border-dashed border-primary/20">
                {code}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                title={t("dashboard.share.copy")}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container shadow-card hover:brightness-95 transition-all active:scale-90"
              >
                <span className="material-symbols-outlined text-base">
                  {copied ? "check" : "content_copy"}
                </span>
              </button>
            </div>
            {copied && (
              <p className="mt-2 text-xs font-bold text-success-on animate-fade-in-up">{t("dashboard.share.copied")}</p>
            )}
          </>
        ) : (
          <p className="my-6 text-sm text-on-surface-variant/60 italic">{t("dashboard.share.noCode")}</p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl border-2 border-primary py-2.5 text-sm font-bold text-primary hover:bg-surface-low transition-all"
        >
          {t("common.cancel")}
        </button>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
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
  const [sharingRow, setSharingRow] = useState<ActiveCircleRow | null>(null);
  const [detailCircle, setDetailCircle] = useState<{ id: string; name: string } | null>(null);

  return (
    <>
      <section className="rounded-card border border-outline-variant bg-surface-lowest p-6 shadow-card">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {t("dashboard.activeTitle")}
        </h2>
        {items.length === 0 ? (
          <p className="mt-4 text-sm text-on-surface-variant">{t("dashboard.activeEmpty")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-outline-variant">
            {items.map((row) => (
              <li
                key={row.circleId}
                className="group py-4 cursor-pointer"
                onClick={() => {
                  if (row.circleStatus === "ACTIVE" || row.circleStatus === "OPEN") {
                    setDetailCircle({ id: row.circleId, name: row.name });
                  }
                }}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary group-hover:underline">{row.name}</span>
                    {row.circleStatus === "ACTIVE" && (
                      <span className="text-[10px] text-on-surface-variant/50">{t("dashboard.clickToView")}</span>
                    )}
                    {row.isPrivate && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-surface-variant px-2 py-0.5 text-[10px] font-bold uppercase text-on-surface-variant">
                        <span className="material-symbols-outlined text-[10px]">lock</span>
                        {t("dashboard.private")}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold tabular-nums text-primary">
                    <CurrencyDisplay amount={row.monthlyAmount} currency={row.currency} />
                    <span className="ms-1 font-medium text-on-surface-variant">{t("dashboard.perMonth")}</span>
                  </span>
                </div>

                {/* Months remaining */}
                <p className="mt-1 text-sm text-on-surface-variant">
                  {t("dashboard.monthsLeft", { count: row.monthsRemaining.toLocaleString(locale) })}
                </p>

                {/* Payout / deadline countdown */}
                {(row.nextDeadline || row.nextPayoutDate) && (
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <CountdownChip labelKey="dashboard.time.deadlineLabel" dateIso={row.nextDeadline} />
                    <CountdownChip labelKey="dashboard.time.payoutLabel" dateIso={row.nextPayoutDate} />
                  </div>
                )}

                {/* Payout status + action buttons */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-on-surface">{row.payoutStatus}</p>
                  <div className="flex gap-2">
                    {/* Share button — always visible for creator/members */}
                    <button
                      type="button"
                      onClick={() => setSharingRow(row)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/10 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-sm">share</span>
                      {t("dashboard.share.button")}
                    </button>

                    {/* Leave — only for OPEN circles */}
                    {row.circleStatus === "OPEN" && onLeave ? (
                      <button
                        type="button"
                        onClick={() => onLeave(row.circleId)}
                        disabled={leavingId === row.circleId}
                        className="rounded-lg border border-error/30 px-3 py-1.5 text-xs font-bold text-error transition-all hover:bg-error/5 active:scale-95 disabled:opacity-50"
                      >
                        {leavingId === row.circleId ? t("dashboard.leaving") : t("dashboard.leaveCircle")}
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {sharingRow && <ShareModal row={sharingRow} onClose={() => setSharingRow(null)} />}
      {detailCircle && (
        <CircleDetailDrawer
          circleId={detailCircle.id}
          circleName={detailCircle.name}
          onClose={() => setDetailCircle(null)}
        />
      )}
    </>
  );
}
