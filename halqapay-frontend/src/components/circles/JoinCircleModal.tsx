import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CircleJoinOrValidateResponse, CircleResponse, CurrencyCode } from "../../types";
import * as circlesApi from "../../api/circles";
import { getApiErrorMessage, parseJoinOrValidateFromError } from "../../lib/apiError";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";
import { ErrorBanner } from "../shared/ErrorBanner";
import { LoadingSpinner } from "../shared/LoadingSpinner";

function suggestedMonths(res: CircleJoinOrValidateResponse): number | null {
  if (res.suggestedMinDuration != null) return res.suggestedMinDuration;
  if (res.suggestedDuration != null) return res.suggestedDuration;
  return null;
}

export function JoinCircleModal({
  circle,
  open,
  onClose,
  onSuccess
}: {
  circle: CircleResponse | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [validating, setValidating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [validation, setValidation] = useState<CircleJoinOrValidateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joinMessage, setJoinMessage] = useState<string | null>(null);

  const activeCircle = open ? circle : null;
  const circleId = activeCircle?.id;

  useEffect(() => {
    if (!open || !activeCircle || !circleId) {
      setValidating(false);
      setValidation(null);
      setError(null);
      setJoinMessage(null);
      return;
    }

    let cancelled = false;
    setValidating(true);
    setValidation(null);
    setError(null);
    setJoinMessage(null);

    circlesApi
      .validateCircle(circleId, {
        totalValue: Number(activeCircle.totalValue),
        durationMonths: activeCircle.durationMonths
      })
      .then((res) => { if (!cancelled) setValidation(res); })
      .catch((e) => {
        if (!cancelled) {
          const parsed = parseJoinOrValidateFromError(e);
          if (parsed) setValidation(parsed);
          else setError(getApiErrorMessage(e));
        }
      })
      .finally(() => { if (!cancelled) setValidating(false); });

    return () => { cancelled = true; };
  }, [open, circleId, activeCircle]);

  if (!open || !activeCircle || !circleId) return null;

  async function handleJoin() {
    setError(null);
    setJoinMessage(null);
    setJoining(true);
    try {
      const res = await circlesApi.joinCircle(activeCircle!.id);
      if (!res.approved) {
        setValidation(res);
        const hint = suggestedMonths(res);
        setJoinMessage(
          hint != null
            ? t("joinModal.needMonths", { count: hint })
            : res.reason ?? t("joinModal.notApproved")
        );
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      await queryClient.invalidateQueries({ queryKey: ["circles"] });
      onSuccess?.();
      onClose();
    } catch (e) {
      const parsed = parseJoinOrValidateFromError(e);
      if (parsed) {
        setValidation(parsed);
        const hint = suggestedMonths(parsed);
        setJoinMessage(
          !parsed.approved && hint != null
            ? t("joinModal.tryMonths", { count: hint })
            : (parsed.reason ?? null)
        );
      } else {
        setError(getApiErrorMessage(e));
      }
    } finally {
      setJoining(false);
    }
  }

  const suggestion = validation ? suggestedMonths(validation) : null;

  // The circle's currency and what members actually deposit each month
  const circleCcy = (validation?.circleCurrency ?? activeCircle.currency) as CurrencyCode;
  const circleMonthly = validation?.circleMonthlyInCircleCurrency ?? activeCircle.monthlyContribution;

  // The user's home currency — what DTI values are expressed in
  const userCcy = (validation?.userCurrency ?? activeCircle.currency) as CurrencyCode;

  // Whether the circle currency matches the user's currency
  const sameCurrency = circleCcy === userCcy;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-modal-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-modal border border-outline-variant bg-surface-lowest p-6 shadow-cardLg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 id="join-modal-title" className="text-lg font-bold text-primary">
          {t("joinModal.title")}
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">{activeCircle.name}</p>

        {/* What you'll deposit each month — always in the circle's currency */}
        <div className="mt-4 rounded-xl bg-primary/5 border border-primary/15 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/60">
            {t("joinModal.circleMonthlyLabel")}
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums text-primary">
            <CurrencyDisplay amount={circleMonthly} currency={circleCcy} />
            <span className="ms-1 text-sm font-medium text-on-surface-variant">
              / {t("joinModal.month")}
            </span>
          </p>
          {!sameCurrency && (
            <p className="mt-1 text-[11px] text-on-surface-variant/70 italic">
              {t("joinModal.paidInCurrency", { currency: circleCcy })}
            </p>
          )}
        </div>

        {/* DTI check loading */}
        {validating && (
          <div className="mt-6">
            <LoadingSpinner label={t("joinModal.checking")} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4">
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {/* Validation result */}
        {!validating && validation && (
          <div className="mt-4 rounded-xl border border-outline-variant bg-surface-low p-4 text-sm space-y-3">

            {/* Status badge */}
            <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              validation.approved
                ? "bg-emerald-100 text-emerald-800"
                : "bg-red-100 text-red-900"
            }`}>
              <span className="material-symbols-outlined text-[14px]">
                {validation.approved ? "check_circle" : "cancel"}
              </span>
              {validation.approved ? t("joinModal.approved") : t("joinModal.rejected")}
            </div>

            {!validation.approved && (
              <p className="text-on-surface-variant text-xs">
                {t("joinModal.dtiExceeded")}
              </p>
            )}

            {!validation.approved && suggestion != null && (
              <p className="text-on-surface">
                {t("joinModal.suggestedDuration")}{" "}
                <span className="font-bold tabular-nums">{suggestion}</span>{" "}
                {t("joinModal.monthsWord")}
              </p>
            )}

            {/* Budget breakdown — expressed in user's currency */}
            <div className="border-t border-outline-variant/30 pt-3 space-y-2">
              {!sameCurrency && (
                <p className="text-[11px] font-semibold text-on-surface-variant/60 uppercase tracking-wider">
                  {t("joinModal.budgetInCurrency", { currency: userCcy })}
                </p>
              )}

              {validation.monthlyBurden != null && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-on-surface-variant">
                    {sameCurrency
                      ? t("joinModal.monthlyPayment")
                      : t("joinModal.monthlyPaymentConverted")}
                  </span>
                  <span className="font-bold tabular-nums text-on-surface">
                    <CurrencyDisplay amount={validation.monthlyBurden} currency={userCcy} />
                  </span>
                </div>
              )}

              {validation.newTotalBurden != null && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-on-surface-variant">{t("joinModal.totalBurden")}</span>
                  <span className="font-bold tabular-nums text-on-surface">
                    <CurrencyDisplay amount={validation.newTotalBurden} currency={userCcy} />
                  </span>
                </div>
              )}

              {validation.remainingCapacity != null && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-on-surface-variant">{t("joinModal.remaining")}</span>
                  <span className={`font-bold tabular-nums ${
                    Number(validation.remainingCapacity) >= 0 ? "text-emerald-700" : "text-red-700"
                  }`}>
                    <CurrencyDisplay amount={validation.remainingCapacity} currency={userCcy} />
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {joinMessage && (
          <div className="mt-3 text-sm font-medium text-secondary">{joinMessage}</div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold text-primary hover:bg-surface-low"
          >
            {t("joinModal.close")}
          </button>
          {!validating && validation?.approved && (
            <button
              type="button"
              onClick={() => void handleJoin()}
              disabled={joining}
              className="rounded-lg bg-secondary-container px-4 py-2 text-sm font-bold text-on-secondary-container shadow-card transition-all hover:brightness-95 disabled:opacity-60"
            >
              {joining ? t("joinModal.joining") : t("joinModal.confirm")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
