import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCircleDetail, contributeToCircle } from "../../api/circles";
import { fetchWallet } from "../../api/wallet";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";
import { ErrorBanner } from "../shared/ErrorBanner";
import { useModal } from "../../components/layout/Layout";
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
    <div className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/5 px-3 py-2">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-warning/80">{t("circleDetail.payDeadline")}</p>
        <p className="mt-0.5 text-xs font-bold text-on-surface">{formatted}</p>
      </div>
      <div className="text-right">
        <p className="text-xl font-black tabular-nums text-warning">{days}</p>
        <p className="text-[9px] font-bold text-on-surface-variant">{t("circleDetail.daysLeft")}</p>
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
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { setModalOpen } = useModal();

  useEffect(() => {
    setModalOpen(true);
    return () => {
      setModalOpen(false);
    };
  }, [setModalOpen]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["circleDetail", circleId],
    queryFn: () => getCircleDetail(circleId),
    staleTime: 30_000,
  });

  const { data: walletData } = useQuery({
    queryKey: ["wallet"],
    queryFn: fetchWallet,
    staleTime: 5_000, // Reduce to 5 seconds for more fresh data
  });

  const contributeMutation = useMutation({
    mutationFn: () => contributeToCircle(circleId),
    onMutate: async () => {
      setPaymentError(null);
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["wallet"] });
      
      // Snapshot the previous value
      const previousWallet = queryClient.getQueryData(["wallet"]);
      
      // Optimistically update wallet balance
      if (walletData && data) {
        const requiredAmount = parseFloat(String(data.monthlyContribution));
        const currentBalance = parseFloat(walletData.balance);
        const newBalance = Math.max(0, currentBalance - requiredAmount);
        
        queryClient.setQueryData(["wallet"], {
          ...walletData,
          balance: newBalance.toString(),
        });
      }
      
      return { previousWallet };
    },
    onError: (error, variables, context) => {
      const errorMessage = error instanceof Error ? error.message : t("common.error");
      setPaymentError(errorMessage);
      
      // Rollback optimistic update
      if (context?.previousWallet) {
        queryClient.setQueryData(["wallet"], context.previousWallet);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["circleDetail", circleId] });
      queryClient.invalidateQueries({ queryKey: ["myCircles"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    },
  });

  const handlePayMyTurn = () => {
    if (!data || !walletData) return;
    
    const requiredAmount = parseFloat(String(data.monthlyContribution));
    const currentBalance = parseFloat(walletData.balance);
    
    if (currentBalance < requiredAmount) {
      setPaymentError(t("circleDetail.insufficientBalance", { 
        required: requiredAmount.toLocaleString(locale),
        available: currentBalance.toLocaleString(locale),
        currency: data.currency 
      }));
      return;
    }
    
    setPaymentError(null);
    contributeMutation.mutate();
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-2xl rounded-3xl bg-surface-lowest p-8 shadow-2xl border border-outline-variant/30 animate-zoom-in text-center overflow-y-auto" style={{ maxHeight: "90vh" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-primary">{data?.name ?? circleName}</h2>
            {data && (
              <p className="text-sm text-on-surface-variant">
                {t("circleDetail.monthOf", { current: data.currentMonth, total: data.durationMonths })}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-low text-on-surface-variant transition-all hover:bg-surface-variant active:scale-90"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="space-y-6 text-left">
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
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: t("circleDetail.totalValue"), value: <CurrencyDisplay amount={String(data.totalValue)} currency={data.currency} /> },
                  { label: t("circleDetail.monthly"),    value: <CurrencyDisplay amount={String(data.monthlyContribution)} currency={data.currency} /> },
                  { label: t("circleDetail.mySlot"),     value: `#${data.mySlotNumber}` },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-outline-variant bg-surface-low p-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">{label}</p>
                    <p className="mt-1 text-lg font-black text-on-surface">{value}</p>
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
                    <>
                      <button
                        type="button"
                        disabled={contributeMutation.isPending}
                        onClick={handlePayMyTurn}
                        className="w-full rounded-xl bg-primary py-3 text-sm font-black text-primary-on shadow-card transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
                      >
                        {contributeMutation.isPending
                          ? t("circleDetail.paying")
                          : t("circleDetail.payMyTurn", {
                              amount: `${Number(data.monthlyContribution).toLocaleString(locale)} ${data.currency}`,
                            })}
                      </button>
                      {paymentError && (
                        <ErrorBanner message={paymentError} onDismiss={() => setPaymentError(null)} />
                      )}
                      {contributeMutation.isSuccess && (
                        <p className="mt-2 text-center text-xs font-semibold text-success-on">{t("circleDetail.paySuccess")}</p>
                      )}
                    </>
                  )}
                </div>
              )}

              <div>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                  {t("circleDetail.membersTitle")}
                </h3>
                <ul className="space-y-3">
                  {data.members.map((member: CircleMemberDetailItem) => {
                    const isMe = member.slotNumber === data.mySlotNumber;
                    const isCurrentMonth = member.payoutMonth === data.currentMonth;
                    const payoutFormatted = new Date(member.payoutDate).toLocaleDateString(locale, {
                      day: "numeric", month: "short", year: "numeric",
                    });

                    return (
                      <li
                        key={member.slotNumber}
                        className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-all ${
                          isMe ? "border-primary/30 bg-primary/5" : "border-outline-variant bg-surface-low"
                        }`}
                      >
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-black ${
                          isMe ? "bg-primary text-primary-on" : "bg-surface-variant text-on-surface-variant"
                        }`}>
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-bold text-on-surface">
                            {member.fullName}
                            {isMe && (
                              <span className="ms-2 text-xs font-black text-primary">({t("circleDetail.you")})</span>
                            )}
                          </p>
                          <p className="text-xs text-on-surface-variant">
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
