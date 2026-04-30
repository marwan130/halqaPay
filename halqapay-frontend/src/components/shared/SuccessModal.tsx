import React from "react";
import { useTranslation } from "react-i18next";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onClose,
  title,
  message,
  actionLabel,
  onAction,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-3xl bg-surface p-8 shadow-premium border border-outline-variant/30 animate-scale-in">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-container text-success-on shadow-lg shadow-success-container/20 mb-6">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          
          <h2 className="text-2xl font-black text-primary mb-2">{title}</h2>
          <p className="text-on-surface-variant font-medium leading-relaxed mb-8">
            {message}
          </p>
          
          <div className="flex flex-col gap-3 w-full">
            {onAction && actionLabel && (
              <button
                type="button"
                onClick={onAction}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-on shadow-card hover:opacity-95 active:scale-95 transition-all"
              >
                {actionLabel}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-outline-variant py-3.5 text-sm font-bold text-on-surface hover:bg-surface-low active:scale-95 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
