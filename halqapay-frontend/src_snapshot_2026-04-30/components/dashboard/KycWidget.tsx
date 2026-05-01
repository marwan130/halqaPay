import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { KycStatus } from "../../types";

interface KycWidgetProps {
  status: KycStatus;
}

export function KycWidget({ status }: KycWidgetProps) {
  const { t } = useTranslation();

  const getStatusColor = () => {
    switch (status) {
      case "VERIFIED":
        return "bg-success-container text-success-on border-success/30";
      case "PENDING":
        return "bg-warning-container text-warning-on border-warning/30";
      case "REJECTED":
        return "bg-danger-container text-danger-on border-danger/30";
      default:
        return "bg-surface-variant/50 text-on-surface-variant border-outline-variant";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "VERIFIED":
        return "verified";
      case "PENDING":
        return "hourglass_empty";
      case "REJECTED":
        return "error";
      default:
        return "pending_actions";
    }
  };

  return (
    <div className={`flex items-center justify-between gap-4 rounded-card border p-4 shadow-sm ${getStatusColor()}`}>
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          {getIcon()}
        </span>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider opacity-90">
            {t("dashboard.kyc.label")}
          </p>
          <p className="text-lg font-black">{t(`dashboard.kyc.status.${status}`)}</p>
        </div>
      </div>
      {status === "UNVERIFIED" && (
        <Link
          to="/verify-salary"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-on hover:opacity-90"
        >
          {t("dashboard.kyc.cta")}
        </Link>
      )}
    </div>
  );
}
