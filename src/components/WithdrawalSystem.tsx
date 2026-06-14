import React, { useState, useEffect } from "react";
import { User, Withdrawal } from "../types";
import { api } from "../lib/api";
import { AlertCircle, ArrowUpRight, CheckCircle, ShieldAlert, History, Key } from "lucide-react";

interface WithdrawalProps {
  user: User;
  onRefreshUser: () => void;
  onNavigate: (tab: string) => void;
}

export default function WithdrawalSystem({ user, onRefreshUser, onNavigate }: WithdrawalProps) {
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [history, setHistory] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchWithdrawHistory();
  }, [user.id]);

  const fetchWithdrawHistory = async () => {
    try {
      setLoading(true);
      const txs = await api.transactions.list(user.id);
      // Filter withdrawal records
      const withdrawalsOnly = txs.filter((tx) => tx.type === "withdrawal");
      const mappedWithdrawals: Withdrawal[] = withdrawalsOnly.map((w) => ({
        id: w.id,
        userId: w.userId,
        username: w.username,
        amount: w.amount,
        address: w.description.includes("address") ? w.description.split("address")[1]?.trim() || "N/A" : "Wallet Target",
        network: "TRC20",
        status: w.status === "completed" ? "approved" : w.status === "failed" ? "rejected" : "pending",
        createdAt: w.createdAt,
      }));
      setHistory(mappedWithdrawals);
    } catch (e) {
      console.error("Could not load withdrawal transactions log", e);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please input a valid withdrawal amount.");
      return;
    }

    if (parsedAmount < 10) {
      setError("The minimum withdrawal threshold is 10 USDT.");
      return;
    }

    if (!address.trim()) {
      setError("Please input a valid destination wallet address.");
      return;
    }

    if (address.length < 26 || !address.startsWith("T")) {
      setError("Please enter a valid USDT TRON (TRC20) address. These typically start with 'T' and contain 26-34 alphanumeric characters.");
      return;
    }

    setSubmitting(true);
    try {
      await api.withdrawal.request({
        userId: user.id,
        amount: parsedAmount,
        address: address.trim(),
      });

      setSuccess(true);
      setAmount("");
      setAddress("");
      onRefreshUser();
      await fetchWithdrawHistory();

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to submit withdrawal request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="withdrawal-system-panel">
      {/* Form Submission Panel (7 columns) */}
      <div className="space-y-6 lg:col-span-7">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex gap-3 border-b border-gray-800 pb-4 mb-6">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">Withdraw USDT Assets</h2>
              <p className="text-xs text-gray-500 font-mono">Deduct balances for direct blockchain distribution</p>
            </div>
          </div>

          {/* KYC GATED BLOCK OVERLAY */}
          {user.kycStatus !== "approved" ? (
            <div className="space-y-5 text-center py-6 border border-dashed border-gray-800 rounded-2xl p-4 bg-gray-950/40" id="kyc-gated-warning">
              <div className="flex justify-center">
                <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20">
                  <ShieldAlert className="w-10 h-10" />
                </div>
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider">KYC Verification Required</h3>
                <p className="text-xs text-gray-400 font-mono leading-relaxed">
                  Your KYC is currently <span className="text-rose-400 font-bold uppercase">{user.kycStatus}</span>. For compliance and AML security, we mandate complete identity verification before withdrawal requests can be submitted.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("kyc")}
                id="withdraw-view-kyc-btn"
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg shadow-emerald-500/10"
              >
                Go to KYC Verification
              </button>
            </div>
          ) : (
            <form onSubmit={handleWithdrawSubmit} className="space-y-5" id="withdrawal-request-form">
              {error && <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded-xl font-mono">{error}</div>}
              {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl font-mono">Withdrawal request successfully logged. Administrative audit pending.</div>}

              {/* Balance Summary Header */}
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex justify-between items-center text-xs font-mono">
                <div>
                  <span className="text-gray-500 block">Available Balance:</span>
                  <span className="text-white font-bold text-sm">${user.balance.toFixed(2)} USDT</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 block">Network Type:</span>
                  <span className="text-emerald-400 font-bold uppercase tracking-wider">Tether TRC20</span>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1.5">Withdrawal Amount:</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Min: 10 USDT"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                  <div className="absolute right-3.5 top-2.5 flex items-center gap-1.5 text-xs font-bold font-mono">
                    <span className="text-gray-500">USDT</span>
                    <button
                      type="button"
                      onClick={() => setAmount(user.balance.toString())}
                      className="text-emerald-400 hover:text-emerald-300 font-bold font-display"
                    >
                      MAX
                    </button>
                  </div>
                </div>
              </div>

              {/* Destination address */}
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1.5">Destination USDT TRC20 Wallet Address:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Starts with 'T' (e.g., TDvrj5yXX...)"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-gray-500 font-mono mt-1 block">Verify destination wallet carefully. Faulty transfers cannot be retrieved.</span>
              </div>

              {/* Warning note */}
              <div className="bg-gray-950 p-3 flex gap-2.5 items-start border border-gray-800 rounded-xl text-xs text-gray-400 font-mono">
                <AlertCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="leading-tight text-[11px]">
                  Each withdrawal is audited manually. Compliance operators finalize payout transfers between 10 to 60 minutes after registration.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !amount || !address}
                id="submit-withdrawal-btn"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-display font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-50"
              >
                {submitting ? "Registering withdrawal ticket..." : "Request USDT TRC20 Withdrawal"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Stats and Historic Records (5 columns) */}
      <div className="space-y-6 lg:col-span-5">
        {/* security guidelines Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-1.5 text-gray-200">
            <Key className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold font-display uppercase tracking-wider">Fund Security Policy</h3>
          </div>
          <div className="text-xs font-mono text-gray-400 space-y-2">
            <p>
              All customer funds are locked inside high-security multi-sig ledger cold-storage networks. Withdrawal approvals require key approvals on multi-node channels.
            </p>
            <p className="text-[11px] text-gray-500 border-t border-gray-800/60 pt-2">
              Withdrawal fee: <span className="text-emerald-400">0.00%</span> (Fully subsidized by Trade Profit Hub).
            </p>
          </div>
        </div>

        {/* Withdrawal ledgers log */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-200 mb-4 border-b border-gray-800 pb-3">
              <History className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold font-display">Withdrawal Request History</h3>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-6">
                  <span className="text-xs text-gray-500 font-mono animate-pulse">Loading withdrawal transactions...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-800 rounded-xl">
                  <span className="text-xs text-gray-500 font-mono">No withdrawal requests recorded.</span>
                </div>
              ) : (
                history.map((wit) => (
                  <div key={wit.id} className="bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-white font-bold">${wit.amount.toFixed(2)} USDT</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        wit.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                        wit.status === "pending" ? "bg-amber-500/10 text-amber-500" :
                        "bg-rose-500/10 text-rose-400"
                      }`}>
                        {wit.status}
                      </span>
                    </div>

                    <div className="font-mono text-[9px] text-gray-500 space-y-0.5">
                      <div className="flex justify-between">
                        <span>Destination Address:</span>
                        <span className="text-gray-300 text-right truncate max-w-[150px]">{wit.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span className="text-gray-400">{new Date(wit.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
