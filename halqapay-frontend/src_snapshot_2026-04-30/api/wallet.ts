import api from "./axios";

export interface WalletResponse {
  balance: string;
  currency: string;
  recentTransactions: unknown[];
}

export async function fetchWallet(): Promise<WalletResponse> {
  const { data } = await api.get<WalletResponse>("/wallet");
  return data;
}

export async function topUpWallet(amount: number): Promise<{ newBalance: string }> {
  const { data } = await api.post<{ newBalance: string }>("/wallet/topup", {
    amount
  });
  return data;
}

export async function withdrawWallet(amount: number): Promise<{ newBalance: string }> {
  const { data } = await api.post<{ newBalance: string }>("/wallet/withdraw", {
    amount
  });
  return data;
}
