export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  balance: number;
  profit: number;
  copyBalance: number;
  isCopying: boolean;
  copyTraderId: string | null;
  referralCode: string;
  referredBy: string | null;
  kycStatus: "none" | "pending" | "approved" | "rejected";
  kycRejectedReason?: string | null;
  kycData?: {
    cnicFront?: string; // base64
    cnicBack?: string;  // base64
    selfie?: string;    // base64
    submittedAt?: string;
  } | null;
  isAdmin: boolean;
  createdAt: string;
}

export interface Trader {
  id: string;
  name: string;
  winRate: number;
  profitShare: number;
  copiersCount: number;
  totalProfit: number;
  avatar: string;
  riskLevel: "Low" | "Medium" | "High";
  description: string;
}

export interface Deposit {
  id: string;
  userId: string;
  username: string;
  amount: number;
  bonus?: number;
  txid: string;
  status: "pending" | "approved" | "rejected";
  screenshot?: string; // base64
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  username: string;
  amount: number;
  fee?: number;
  finalAmount?: number;
  address: string;
  network: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  username: string;
  type: "deposit" | "withdrawal" | "copy_trade_profit" | "copy_trade_start" | "copy_trade_stop" | "referral_bonus" | "deposit_bonus";
  amount: number;
  description: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Stats {
  totalUsers: number;
  totalDeposited: number;
  totalWithdrawn: number;
  activeCopiers: number;
  totalCompanyProfitPaid: number;
}
