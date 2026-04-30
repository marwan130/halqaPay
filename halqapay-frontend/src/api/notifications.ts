import type { Notification } from "../types";
import api from "./axios";

export async function fetchNotifications(): Promise<Notification[]> {
  const { data } = await api.get<Notification[]>("/notifications");
  return data;
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await api.get<{ count: number }>("/notifications/unread-count");
  return data.count;
}

export async function markAsRead(id: string): Promise<void> {
  await api.post(`/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await api.post("/notifications/read-all");
}
