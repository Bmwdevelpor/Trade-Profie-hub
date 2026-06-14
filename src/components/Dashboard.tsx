import { useState, useEffect } from "react";
import { User, Transaction } from "../types";
import MyCustomChart from "./MyCustomChart";
import { TrendingUp, Copy, ShieldCheck, Wallet, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

interface DashboardProps {
  user: User;
  onNavigate: (tab: string) => void;
  transactions: Transaction[];
  onRefreshUser: () => void;
}

export default function Dashboard({ user, onNavigate, transactions, onRefreshUser }: DashboardProps) {
  const [copied, setCopied] = useState(false);
  const [prices, setPrices] = useState({
    btc: 67340.50,
    eth: 3545.20,
    sol: 154.60,
    trx: 0.12450
  });
  const [priceChanges, setPriceChanges] = useState({
    btc: 1.45,
    eth: -0.65,
    sol: 3.82,
    trx: 0.12
  });

  // Handle address copy
  const handleCopy = () => {
    navigator.clipboard.writeText("TDvrj5yXXpdAje1bfcEvuKMWZ5UG5TrFuF");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulating market tickers
  useEffect(() => {
    const timer = setInterval(() => {
      setPrices((prev) => {
        const factor = 1 + (Math.random() - 0.5) * 0.002;
        return {
          btc: parseFloat((prev.btc * factor).toFixed(2)),
          eth: parseFloat((prev.eth * factor).toFixed(2)),
          sol: parseFloat((prev.sol * factor).toFixed(2)),
          trx: parseFloat((prev.trx * (1 + (Math.random() - 0.5) * 0.003)).toFixed(5))
        };
      });
      // Alternate slight percentage offsets
      setPriceChanges((prev) => ({
        btc: parseFloat((prev.btc + (Math.random() - 0.5) * 0.1).toFixed(2)),
        eth: parseFloat((prev.eth + (Math.random() - 0.5) * 0.1).toFixed(2)),
        sol: parseFloat((prev.sol + (Math.random() - 0.5) * 0.15).toFixed(2)),
        trx: parseFloat((prev.trx + (Math.random() - 0.5) * 0.01).toFixed(2))
      }));
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  // Compute stats helper
  const totalBalance = user.balance + user.copyBalance;
  const recentTransactions = transactions.slice(0, 4);

  // Mock index coordinates representing general daily returns progress
  const chartPerformanceData = [1.2, 1.8, 1.4, 2.3, 1.1, 1.9, 2.5, 1.6, 2.1, 2.8];
  const chartPerformanceLabels = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"];

  return (
    <div className="space-y-6" id="dashboard-view-wrapper">
      {/* Top Welcome Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-900 border border-gray-800 rounded-2xl p-6 gap-4">
        <div>
          <span className="text-gray-400 font-mono text-sm leading-none">Welcome Back, App Trader</span>
          <h2 className="text-2xl font-bold font-display text-white mt-1">{user.fullName}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-mono text-xs text-gray-400">Username: <span className="text-gray-200">{user.username}</span></span>
            <span className="text-gray-700">•</span>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-gray-400 font-mono">KYC Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                user.kycStatus === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                user.kycStatus === "pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                user.kycStatus === "rejected" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                "bg-gray-800 text-gray-400"
              }`}>
                {user.kycStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Deposit Shortcut Pill */}
        <div className="bg-gray-950/50 rounded-xl p-4 border border-gray-800 max-w-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Primary USDT Address</span>
            <span className="text-xs font-mono text-emerald-400 tracking-tight font-medium">TDvrj5yXX...G5TrFuF</span>
          </div>
          <button
            onClick={handleCopy}
            id="copy-address-shortcut-btn"
            className="p-2.5 bg-gray-800 hover:bg-emerald-500/10 hover:text-emerald-400 border border-gray-700 hover:border-emerald-500/20 rounded-lg transition-all"
            title="Copy wallet address"
          >
            {copied ? (
              <span className="text-xs text-emerald-400 font-mono px-1">Copied</span>
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="metrics-cards-grid">
        {/* Card 1: Combined Asset Volume */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-44">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">Total Portfolio Balance</span>
              <span className="text-3xl font-bold font-display text-white mt-1 block">
                ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-gray-400">USDT</span>
              </span>
            </div>
            <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono border-t border-gray-800/60 pt-4">
            <div>
              <span className="text-gray-500">Wallet: </span>
              <span className="text-gray-200">${user.balance.toFixed(2)}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-700" />
            <div>
              <span className="text-gray-500">Copy Pool: </span>
              <span className="text-emerald-400 font-semibold">${user.copyBalance.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Accumulated Profit Distributions */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-44">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">Total Profit Accrued</span>
              <span className="text-3xl font-bold font-display text-emerald-400 mt-1 block">
                +${user.profit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-emerald-500">USDT</span>
              </span>
            </div>
            <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-xs font-mono border-t border-gray-800/60 pt-4 flex justify-between items-center text-gray-500">
            <span>Aggregated Copy Gains</span>
            <span className="text-emerald-400 font-semibold">Continuous Distribution</span>
          </div>
        </div>

        {/* Card 3: Account Allocation / Action Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-44 sm:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">Copy Copying Status</span>
              {user.isCopying ? (
                <div className="mt-1 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xl font-bold text-white font-display">Active Copying</span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono block">Allocated: ${user.copyBalance.toFixed(2)} USDT</span>
                </div>
              ) : (
                <div className="mt-1 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                    <span className="text-xl font-bold text-gray-400 font-display">Inactive</span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono block">Zero Trade Allocation active</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="border-t border-gray-800/60 pt-3">
            {user.isCopying ? (
              <button
                onClick={() => onNavigate("copytrade")}
                id="dashboard-view-trader-btn"
                className="w-full text-center text-xs text-emerald-400 hover:text-emerald-300 transition-all font-mono font-medium flex items-center justify-center gap-1"
              >
                Manage Active Allocation →
              </button>
            ) : (
              <button
                onClick={() => onNavigate("copytrade")}
                id="dashboard-start-trade-btn"
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition-all"
              >
                Join Copy Trading
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Stats Graph and Crypto Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-graphics-panel">
        {/* Chart View (2 cols on desktop) */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold font-display text-white">Daily Performance Index</h3>
              <p className="text-xs text-gray-500 font-mono mt-0.5">Accruing platform compound metrics indexes</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold rounded-lg border border-emerald-500/20">
              TRC20 Auto Pool
            </span>
          </div>
          {/* Custom SVG Line Chart Component */}
          <MyCustomChart data={chartPerformanceData} labels={chartPerformanceLabels} />
        </div>

        {/* Live Cryto Index Rates Tickers */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold font-display text-white mb-1">Live Global Spot Index</h3>
            <p className="text-xs text-gray-500 font-mono mb-4">Realtime WebSocket indexed feeds</p>

            <div className="space-y-3.5">
              {/* BTC */}
              <div className="flex items-center justify-between bg-gray-950 rounded-xl p-3 border border-gray-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20 text-xs flex items-center justify-center">
                    ₿
                  </span>
                  <div>
                    <span className="font-semibold text-sm text-gray-100 block">BTC</span>
                    <span className="text-[10px] text-gray-500 font-mono">Bitcoin</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sm font-bold text-gray-100 block">${prices.btc.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  <div className={`flex items-center justify-end text-[10px] font-bold ${priceChanges.btc >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {priceChanges.btc >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{priceChanges.btc >= 0 ? "+" : ""}{priceChanges.btc}%</span>
                  </div>
                </div>
              </div>

              {/* ETH */}
              <div className="flex items-center justify-between bg-gray-950 rounded-xl p-3 border border-gray-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 text-xs flex items-center justify-center">
                    Ξ
                  </span>
                  <div>
                    <span className="font-semibold text-sm text-gray-100 block">ETH</span>
                    <span className="text-[10px] text-gray-500 font-mono">Ethereum</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sm font-bold text-gray-100 block">${prices.eth.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  <div className={`flex items-center justify-end text-[10px] font-bold ${priceChanges.eth >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {priceChanges.eth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{priceChanges.eth >= 0 ? "+" : ""}{priceChanges.eth}%</span>
                  </div>
                </div>
              </div>

              {/* SOL */}
              <div className="flex items-center justify-between bg-gray-950 rounded-xl p-3 border border-gray-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20 text-xs flex items-center justify-center">
                    ◎
                  </span>
                  <div>
                    <span className="font-semibold text-sm text-gray-100 block">SOL</span>
                    <span className="text-[10px] text-gray-500 font-mono">Solana</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sm font-bold text-gray-100 block">${prices.sol.toFixed(2)}</span>
                  <div className={`flex items-center justify-end text-[10px] font-bold ${priceChanges.sol >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {priceChanges.sol >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{priceChanges.sol >= 0 ? "+" : ""}{priceChanges.sol}%</span>
                  </div>
                </div>
              </div>

              {/* TRX */}
              <div className="flex items-center justify-between bg-gray-950 rounded-xl p-3 border border-gray-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 font-bold border border-red-500/20 text-xs flex items-center justify-center">
                    ₮
                  </span>
                  <div>
                    <span className="font-semibold text-sm text-gray-100 block">TRX</span>
                    <span className="text-[10px] text-gray-500 font-mono">TRON Foundation</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sm font-bold text-gray-100 block">${prices.trx.toFixed(5)}</span>
                  <div className={`flex items-center justify-end text-[10px] font-bold ${priceChanges.trx >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {priceChanges.trx >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{priceChanges.trx >= 0 ? "+" : ""}{priceChanges.trx}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-gray-500 flex items-center gap-1.5 mt-4 text-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure 256-bit AES Vault Link</span>
          </div>
        </div>
      </div>

      {/* Bottom Fast Grid Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="dashboard-recent-log-panel">
        {/* Quick Deposit & Withdraw Controls panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold font-display text-white">Fiat-Crypto Core Wallet</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">USDT TRC20 instant deposit and withdrawal channels</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate("deposit")}
              id="dashboard-deposit-trigger-btn"
              className="py-4 bg-emerald-600 hover:bg-emerald-500 transition-all text-white rounded-xl flex flex-col items-center justify-center gap-2 border border-emerald-500/30 group shadow-lg shadow-emerald-500/10"
            >
              <div className="p-2 bg-white/10 rounded-lg group-hover:scale-110 transition-all">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-bold font-display">Deposit USDT</span>
              <span className="text-[10px] font-mono text-emerald-100/70">TRC20 Wallet API</span>
            </button>

            <button
              onClick={() => onNavigate("withdraw")}
              id="dashboard-withdrawal-trigger-btn"
              className="py-4 bg-gray-950 hover:bg-gray-800 transition-all text-gray-100 rounded-xl flex flex-col items-center justify-center gap-2 border border-gray-800 group shadow-lg"
            >
              <div className="p-2 bg-gray-800 rounded-lg group-hover:scale-110 transition-all">
                <ArrowUpRight className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-sm font-bold font-display">Withdraw USDT</span>
              <span className="text-[10px] font-mono text-gray-500">Fast Audit Process</span>
            </button>
          </div>
        </div>

        {/* Recent Platform Ledger Activity */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-gray-100">
              <h3 className="text-base font-semibold font-display">Recent Activity Ledger</h3>
              <button
                onClick={() => onNavigate("transactions")}
                id="view-all-transactions-link"
                className="text-xs text-emerald-400 font-mono hover:text-emerald-300 transition-all"
              >
                View Ledger →
              </button>
            </div>

            <div className="space-y-2.5">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-800 rounded-xl" id="empty-ledger-view">
                  <span className="text-xs text-gray-500 font-mono">No transaction events recorded on file.</span>
                </div>
              ) : (
                recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center bg-gray-950 rounded-xl p-2.5 border border-gray-800">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${
                        tx.type === "deposit" || tx.type === "copy_trade_profit" || tx.type === "referral_bonus"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-gray-800 text-gray-400"
                      }`}>
                        {tx.type === "deposit" || tx.type === "copy_trade_profit" || tx.type === "referral_bonus" ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-gray-200 block truncate max-w-xs">{tx.description}</span>
                        <span className="text-[9px] text-gray-500 font-mono">
                          {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className={`text-xs font-bold font-mono ${
                        tx.type === "deposit" || tx.type === "copy_trade_profit" || tx.type === "referral_bonus"
                          ? "text-emerald-400"
                          : "text-gray-300"
                      }`}>
                        {tx.type === "deposit" || tx.type === "copy_trade_profit" || tx.type === "referral_bonus" ? "+" : "-"}${tx.amount.toFixed(2)}
                      </span>
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${
                        tx.status === "completed" ? "text-emerald-500/80" :
                        tx.status === "pending" ? "text-amber-500/80" :
                        "text-rose-500/80"
                      }`}>
                        {tx.status}
                      </span>
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
