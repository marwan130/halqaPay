import type {
  MyCirclesResponse,
  TransactionsListResponse,
  UserProfileResponse,
  UserSummary
} from "../types";
import api from "./axios";

export async function fetchMe(): Promise<UserProfileResponse> {
  const { data } = await api.get<UserProfileResponse>("/users/me");
  return data;
}

export async function fetchMyCircles(): Promise<MyCirclesResponse> {
  const { data } = await api.get<MyCirclesResponse>("/users/me/circles");
  return data;
}

export async function fetchMyTransactions(): Promise<TransactionsListResponse> {
  const { data } = await api.get<TransactionsListResponse>("/users/me/transactions");
  return data;
}

export function profileToUserSummary(p: UserProfileResponse): UserSummary {
  return {
    id: p.id,
    email: p.email,
    fullName: p.fullName,
    salary: String(p.salary),
    walletBalance: String(p.walletBalance),
    currency: p.currency,
    kycStatus: p.kycStatus
  };
}

export async function updateSalary(salary: number): Promise<{ salary: string }> {
  const { data } = await api.patch<{ salary: string }>("/users/me/salary", { salary });
  return data;
}
