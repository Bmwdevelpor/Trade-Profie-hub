import { User, Trader, Deposit, Withdrawal, Transaction, Notification, Stats } from "../types";

const API_BASE = "";

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong sending request.");
  }
  return data as T;
}

export const api = {
  auth: {
    register: (body: any) => request<{ success: boolean; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
    login: (body: any) => request<{ success: boolean; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
    getUser: (userId: string) => request<User>(`/api/users/${userId}`),
  },
  kyc: {
    submit: (body: { userId: string; cnicFront: string; cnicBack: string; selfie: string }) =>
      request<{ success: boolean; user: User }>("/api/kyc/submit", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  deposit: {
    request: (body: { userId: string; amount: number; txid: string; screenshot?: string }) =>
      request<{ success: boolean; deposit: Deposit }>("/api/deposit/request", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  withdrawal: {
    request: (body: { userId: string; amount: number; address: string }) =>
      request<{ success: boolean; withdrawal: Withdrawal; user: User }>("/api/withdrawal/request", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  copytrade: {
    join: (body: { userId: string; traderId: string; amount: number }) =>
      request<{ success: boolean; user: User }>("/api/copytrade/join", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    stop: (body: { userId: string }) =>
      request<{ success: boolean; user: User }>("/api/copytrade/stop", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  traders: {
    list: () => request<Trader[]>("/api/traders"),
  },
  transactions: {
    list: (userId: string) => request<Transaction[]>(`/api/transactions/${userId}`),
  },
  notifications: {
    list: (userId: string) => request<Notification[]>(`/api/notifications/${userId}`),
    markRead: (userId: string) => request<{ success: boolean }>(`/api/notifications/${userId}/read`, {
      method: "POST",
    }),
  },
  referrals: {
    get: (userId: string) => request<{ referralCode: string; referredCount: number; history: any[]; totalBonusEarned: number }>(`/api/referrals/${userId}`),
  },
  admin: {
    getUsers: () => request<User[]>("/api/admin/users"),
    adjustBalance: (userId: string, body: { amount: number; type: "primary" | "copy" | "profit" }) =>
      request<{ success: boolean; user: User }>(`/api/admin/users/${userId}/balance`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    getKyc: () => request<User[]>("/api/admin/kyc"),
    approveKyc: (body: { userId: string; approve: boolean; reason?: string }) =>
      request<{ success: boolean; user: User }>("/api/admin/kyc/approve", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    getDeposits: () => request<Deposit[]>("/api/admin/deposits"),
    approveDeposit: (body: { depositId: string; approve: boolean }) =>
      request<{ success: boolean; deposit: Deposit; user: User }>("/api/admin/deposits/approve", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    getWithdrawals: () => request<Withdrawal[]>("/api/admin/withdrawals"),
    approveWithdrawal: (body: { withdrawalId: string; approve: boolean }) =>
      request<{ success: boolean; withdrawal: Withdrawal; user: User }>("/api/admin/withdrawals/approve", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    distributeProfit: (body: { percentage: number }) =>
      request<{ success: boolean; percentage: number; distributedCount: number; totalProfitsDistributed: number }>("/api/admin/profits/add", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    getStats: () => request<{ stats: Stats; totalPendingKyc: number; totalPendingDeposits: number; totalPendingWithdrawals: number; profitHistory: any[] }>("/api/admin/stats"),
  },
};
