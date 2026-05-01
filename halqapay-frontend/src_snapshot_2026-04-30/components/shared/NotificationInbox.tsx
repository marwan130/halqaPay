import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as notificationsApi from "../../api/notifications";

export function NotificationInbox() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.fetchNotifications,
    enabled: isOpen
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationsApi.fetchUnreadCount,
    refetchInterval: 30000
  });

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    }
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "WALLET_TOPUP": return "account_balance_wallet";
      case "WALLET_WITHDRAW": return "outbound";
      case "CIRCLE_PAYOUT": return "payments";
      case "PAYMENT_DEADLINE": return "event_busy";
      case "CIRCLE_ACTIVE": return "group_add";
      default: return "notifications";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface-lowest text-on-surface shadow-sm transition-all hover:bg-surface-low"
        aria-label={t("notifications.inbox")}
      >
        <span className="material-symbols-outlined text-2xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-[10px] font-bold text-error-on shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 z-50 w-80 max-h-[480px] overflow-hidden rounded-2xl bg-surface border border-outline-variant shadow-xl origin-top-right flex flex-col">
            <div className="flex items-center justify-between border-b border-outline-variant/30 px-5 py-4 shrink-0">
              <h3 className="text-sm font-black uppercase tracking-widest text-primary">
                {t("notifications.inbox")}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-xs font-bold text-secondary hover:underline"
                >
                  {t("notifications.markAllRead")}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto bg-surface-lowest">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                  <span className="material-symbols-outlined text-5xl mb-2">notifications_off</span>
                  <p className="text-sm font-medium">{t("notifications.empty")}</p>
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/20">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex gap-4 p-4 transition-colors cursor-pointer hover:bg-surface-low ${!n.read ? "bg-primary/5" : ""}`}
                      onClick={() => !n.read && markReadMutation.mutate(n.id)}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${!n.read ? "bg-primary text-primary-on" : "bg-surface-low text-on-surface-variant"}`}>
                        <span className="material-symbols-outlined text-xl">{getIcon(n.type)}</span>
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className={`text-sm leading-tight ${!n.read ? "font-bold text-on-surface" : "font-medium text-on-surface-variant"}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-on-surface-variant/80 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-tighter">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
