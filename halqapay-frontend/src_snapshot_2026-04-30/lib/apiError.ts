import axios from "axios";
import type { CircleJoinOrValidateResponse } from "../types";
import i18n from "../i18n";

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data && typeof data === "object" && "message" in data) {
      const m = (data as { message?: unknown }).message;
      if (typeof m === "string" && m.length > 0) return m;
    }
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return i18n.t("common.error");
}

export function parseJoinOrValidateFromError(
  err: unknown
): CircleJoinOrValidateResponse | null {
  if (!axios.isAxiosError(err)) return null;
  const data = err.response?.data;
  if (!data || typeof data !== "object") return null;
  if (!("approved" in data)) return null;
  return data as CircleJoinOrValidateResponse;
}
