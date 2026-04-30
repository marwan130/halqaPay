import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCircleDetail, contributeToCircle } from "../../api/circles";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";
import type { CircleMemberDetailItem } from "../../types";

function PayoutBadge({ received, isCurrentMonth }: { received: boolean; isCurrentMonth: boolean }) {
  const { t } = useTranslation();
  if (received)
    return <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success-on">{t("circleDetail.received")}</span>;
  if (isCurrentMonth)
    return <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary animate-pulse">{t("circleDetail.thisCycle")}</span>;
  return <span className="rounded-full bg-surface-variant px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">{t("circleDetail.upcoming")}</span>;
}

function DeadlineStrip({ iso }: { iso: string }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("ar") ? "ar-EG" : "en-US";
  const days = Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 86400000));
  const formatted = new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="flex items-center justify-between rounded-xl border border-warning/30 bg-warning/5 px-4 py-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-warning/80">{t("circleDetail.payDeadline")}</p>
        <p className="mt-0.5 text-sm font-bold text-on-surface">{formatted}</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-black tabular-nums text-warning">{days}</p>
        <p className="text-[10px] font-bold text-on-surface-variant">{t("circleDetail.daysLeft")}</p>
      </div>
    </div>
  );
}

export function CircleDetailDrawer({
  circleId,
  circleName,
  onClose,
}: {
  circleId: string;
  circleName: string;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("ar") ? "ar-EG" : "en-US";
  const queryClient = useQueryClient();
  const overlayRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["circleDetail", circleId],
    queryFn: () => getCircleDetail(circleId),
    staleTime: 30_000,
  });

  const contributeMutation = useMutation({
    mutationFn: () => contributeToCircle(circleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circleDetail", circleId] });
      queryClient.invalidateQueries({ queryKey: ["myCircles"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/50 backdrop-blur-sm"
    >
      <div
        className="flex h-full w-full max-w-lg flex-col overflow-y-auto bg-surface-lowest shadow-2xl animate-slide-in-right"
        style={{ borderLeft: "1px solid var(--color-outline-variant, #e0e0e0)" }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-outline-variant bg-surface-lowest/95 px-6 py-4 backdrop-blur-md">
          <div>
            <h2 className="text-lg font-black text-primary">{data?.name ?? circleName}</h2>
            {data && (
              <p className="text-xs text-on-surface-variant">
                {t("circleDetail.monthOf", { current: data.currentMonth, total: data.durationMonths })}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-low text-on-surface-variant transition-all hover:bg-surface-variant active:scale-90"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="flex-1 space-y-5 p-6">
          {isLoading && (
            <div className="flex h-40 items-center justify-center">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
            </div>
          )}

          {isError && (
            <p className="rounded-xl bg-error/10 p-4 text-sm font-semibold text-error">{t("common.error")}</p>
          )}

          {data && (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: t("circleDetail.totalValue"), value: <CurrencyDisplay amount={String(data.totalValue)} currency={data.currency} /> },
                  { label: t("circleDetail.monthly"),    value: <CurrencyDisplay amount={String(data.monthlyContribution)} currency={data.currency} /> },
                  { label: t("circleDetail.mySlot"),     value: `#${data.mySlotNumber}` },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-outline-variant bg-surface-low p-3 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">{label}</p>
                    <p className="mt-1 text-base font-black text-on-surface">{value}</p>
                  </div>
                ))}
              </div>

              <DeadlineStrip iso={data.nextPaymentDeadline} />

              <div className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface-low px-4 py-3">
                <p className="text-sm font-semibold text-on-surface-variant">{t("circleDetail.remainingToPay")}</p>
                <p className="text-lg font-black text-primary">
                  <CurrencyDisplay amount={String(data.amountRemainingToPay)} currency={data.currency} />
                </p>
              </div>

              {data.circleStatus === "ACTIVE" && (
                <div>
                  {data.isMyPayoutMonth ? (
                    <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-center">
                      <span className="material-symbols-outlined text-2xl text-success-on">celebration</span>
                      <p className="mt-1 text-sm font-bold text-success-on">{t("circleDetail.myPayoutMonth")}</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={contributeMutation.isPending}
                      onClick={() => contributeMutation.mutate()}
                      className="w-full rounded-xl bg-primary py-3 text-sm font-black text-primary-on shadow-card transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
                    >
                      {contributeMutation.isPending
                        ? t("circleDetail.paying")
                        : t("circleDetail.payNow", {
                            amount: `${Number(data.monthlyContribution).toLocaleString(locale)} ${data.currency}`,
                          })}
                    </button>
                  )}
                  {contributeMutation.isError && (
                    <p className="mt-2 text-center text-xs font-semibold text-error">{t("common.error")}</p>
                  )}
                  {contributeMutation.isSuccess && (
                    <p className="mt-2 text-center text-xs font-semibold text-success-on">{t("circleDetail.paySuccess")}</p>
                  )}
                </div>
              )}

              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  {t("circleDetail.membersTitle")}
                </h3>
                <ul className="space-y-2">
                  {data.members.map((member: CircleMemberDetailItem) => {
                    const isMe = member.slotNumber === data.mySlotNumber;
                    const isCurrentMonth = member.payoutMonth === data.currentMonth;
                    const payoutFormatted = new Date(member.payoutDate).toLocaleDateString(locale, {
                      day: "numeric", month: "short", year: "numeric",
                    });

                    return (
                      <li
                        key={member.slotNumber}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                          isMe ? "border-primary/30 bg-primary/5" : "border-outline-variant bg-surface-low"
                        }`}
                      >
                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-black ${
                          isMe ? "bg-primary text-primary-on" : "bg-surface-variant text-on-surface-variant"
                        }`}>
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-bold text-on-surface">
                            {member.fullName}
                            {isMe && (
                              <span className="ms-1.5 text-[10px] font-black text-primary">({t("circleDetail.you")})</span>
                            )}
                          </p>
                          <p className="text-[11px] text-on-surface-variant">
                            {t("circleDetail.slotPayoutDate", { date: payoutFormatted })}
                          </p>
                        </div>
                        <PayoutBadge received={member.payoutReceived} isCurrentMonth={isCurrentMonth} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
