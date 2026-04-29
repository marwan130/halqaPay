import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CircleJoinOrValidateResponse, CircleResponse } from "../../types";
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

    const body = {
      totalValue: Number(activeCircle.totalValue),
      durationMonths: activeCircle.durationMonths
    };

    circlesApi
      .validateCircle(circleId, body)
      .then((res) => {
        if (!cancelled) {
          setValidation(res);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          const parsed = parseJoinOrValidateFromError(e);
          if (parsed) {
            setValidation(parsed);
          } else {
            setError(getApiErrorMessage(e));
          }
        }
      })
      .finally(() => {
        if (!cancelled) setValidating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, circleId, activeCircle]);

  if (!open || !activeCircle || !circleId) return null;
  const resolvedCircle = activeCircle;

  async function handleJoin() {
    const id = resolvedCircle.id;
    setError(null);
    setJoinMessage(null);
    setJoining(true);
    try {
      const res = await circlesApi.joinCircle(id);
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
        if (!parsed.approved && hint != null) {
          setJoinMessage(t("joinModal.tryMonths", { count: hint }));
        } else {
          setJoinMessage(parsed.reason ?? null);
        }
      } else {
        setError(getApiErrorMessage(e));
      }
    } finally {
      setJoining(false);
    }
  }

  const suggestion = validation ? suggestedMonths(validation) : null;

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
        <h2 id="join-modal-title" className="text-lg font-bold text-primary">
          {t("joinModal.title")}
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">{resolvedCircle.name}</p>
        <p className="mt-3 text-sm text-on-surface">
          {t("joinModal.monthlyObligation")}{" "}
          <CurrencyDisplay
            amount={resolvedCircle.monthlyContribution}
            currency={resolvedCircle.currency}
          />
        </p>

        {validating ? (
          <div className="mt-6">
            <LoadingSpinner label={t("joinModal.checking")} />
          </div>
        ) : null}

        {error ? (
          <div className="mt-4">
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          </div>
        ) : null}

        {!validating && validation ? (
          <div className="mt-4 rounded-xl border border-outline-variant bg-surface-low p-4 text-sm text-on-surface">
            {validation.approved ? (
              <p className="font-bold text-emerald-800">{t("joinModal.approved")}</p>
            ) : (
              <p className="font-bold text-red-900">{t("joinModal.rejected")}</p>
            )}
            {validation.reason ? (
              <p className="mt-2 text-on-surface-variant">{validation.reason}</p>
            ) : null}
            {!validation.approved && suggestion != null ? (
              <p className="mt-2 text-on-surface">
                {t("joinModal.suggestedDuration")}{" "}
                <span className="font-bold tabular-nums">{suggestion}</span>{" "}
                {t("joinModal.monthsWord")}
              </p>
            ) : null}
            {validation.monthlyBurden != null ? (
              <p className="mt-2 text-on-surface-variant">
                {t("joinModal.newBurden")}{" "}
                <CurrencyDisplay
                  amount={validation.monthlyBurden}
                  currency={resolvedCircle.currency}
                />
              </p>
            ) : null}
            {validation.newTotalBurden != null ? (
              <p className="mt-1 text-on-surface-variant">
                {t("joinModal.totalBurden")}{" "}
                <CurrencyDisplay
                  amount={validation.newTotalBurden}
                  currency={resolvedCircle.currency}
                />
              </p>
            ) : null}
            {validation.remainingCapacity != null ? (
              <p className="mt-1 text-on-surface-variant">
                {t("joinModal.remaining")}{" "}
                <CurrencyDisplay
                  amount={validation.remainingCapacity}
                  currency={resolvedCircle.currency}
                />
              </p>
            ) : null}
          </div>
        ) : null}

        {joinMessage ? (
          <div className="mt-3 text-sm font-medium text-secondary">{joinMessage}</div>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold text-primary hover:bg-surface-low"
          >
            {t("joinModal.close")}
          </button>
          {!validating && validation?.approved ? (
            <button
              type="button"
              onClick={() => void handleJoin()}
              disabled={joining}
              className="rounded-lg bg-secondary-container px-4 py-2 text-sm font-bold text-on-secondary-container shadow-card transition-all hover:brightness-95 disabled:opacity-60"
            >
              {joining ? t("joinModal.joining") : t("joinModal.confirm")}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
