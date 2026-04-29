import { useTranslation } from "react-i18next";

export function ErrorBanner({
  message,
  onDismiss
}: {
  message: string;
  onDismiss?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
    >
      <div className="flex items-start justify-between gap-3">
        <p>{message}</p>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-red-800 underline decoration-red-300 hover:text-red-950"
          >
            {t("common.dismiss")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
