import React, { useState, useEffect } from "react";
import { User } from "../types";
import { api } from "../lib/api";
import { TrendingUp, ShieldAlert, Ban, RefreshCw, CheckCircle } from "lucide-react";

interface CopyTradingProps {
  user: User;
  onRefreshUser: () => void;
  onNavigate: (tab: string) => void;
}

export default function CopyTrading({ user, onRefreshUser, onNavigate }: CopyTradingProps) {
  const [joining, setJoining] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfirmingStop, setIsConfirmingStop] = useState(false);

  const handleJoinCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const parsedAlloc = user.balance;
    if (parsedAlloc <= 0) {
      setError("Your wallet balance is empty. Please deposit USDT first before joining copy trading.");
      return;
    }

    setJoining(true);
    try {
      // Use alpha_algo traderId since backend API requires one
      const res = await api.copytrade.join({
        userId: user.id,
        traderId: "alpha_algo",
        amount: parsedAlloc,
      });

      if (res.success) {
        setSuccess(`Successfully joined copy trading with ${parsedAlloc.toFixed(2)} USDT (entire wallet balance)!`);
        onRefreshUser();
      }
    } catch (err: any) {
      setError(err.message || "Could not complete copy trade join.");
    } finally {
      setJoining(false);
    }
  };

  const handleStopCopy = async () => {
    if (!isConfirmingStop) {
      setIsConfirmingStop(true);
      return;
    }

    setError(null);
    setSuccess(null);
    setStopping(true);

    try {
      const res = await api.copytrade.stop({
        userId: user.id,
      });

      if (res.success) {
        setSuccess("Copy trading stopped successfully. Funds returned to your wallet.");
        setIsConfirmingStop(false);
        onRefreshUser();
      }
    } catch (err: any) {
      setError(err.message || "Failed to stop copy trading.");
    } finally {
      setStopping(false);
    }
  };

  return (
    <div className="space-y-6" id="copy-trading-view-main">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-900 border border-gray-800 rounded-2xl p-6 gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Institutional Copy Trading Pool</h2>
          <p className="text-xs text-gray-500 font-mono mt-0.5">Let professional institutional algorithms autocompute your profitable trades</p>
        </div>

        <div className="flex gap-4 font-mono text-xs max-w-xs p-3 bg-gray-950/55 border border-gray-800 rounded-xl">
          <div>
            <span className="text-gray-500 block uppercase text-[10px]">Allocation Strategy</span>
            <span className="text-emerald-400 font-bold block">Full Wallet Balance</span>
          </div>
          <div className="w-px bg-gray-800" />
          <div>
            <span className="text-gray-500 block uppercase text-[10px]">Settlement Group</span>
            <span className="text-white block font-semibold font-mono">Immediate</span>
          </div>
        </div>
      </div>

      {error && <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded-xl font-mono">{error}</div>}
      {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl font-mono">{success}</div>}

      {user.isCopying ? (
        /* JOINED STATUS VIEW: ONLY SHOW JOINED STATUS AND SUMMARY WITH DISENGAGE BUTTON */
        <div className="bg-gray-900 border border-emerald-500/40 rounded-2xl p-6 shadow-xl shadow-emerald-500/5 space-y-6" id="active-copying-widget">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800/60 pb-5 gap-4">
            <div className="flex items-center gap-4">
              <span className="w-14 h-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-2xl rounded-2xl flex items-center justify-center animate-pulse shadow-inner">
                🤖
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                    Copying Status: Active
                  </span>
                </div>
                <h3 className="text-lg font-bold font-display text-white mt-1">
                  You have joined Corporate Copy Trading Pool
                </h3>
              </div>
            </div>

            <button
              onClick={handleStopCopy}
              disabled={stopping}
              id="stop-copying-btn"
              className={`py-2.5 px-5 border text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow ${
                isConfirmingStop
                  ? "bg-rose-600 text-white border-rose-500 hover:bg-rose-700"
                  : "bg-rose-600/15 hover:bg-rose-600 border border-rose-500/30 text-rose-400 hover:text-white"
              }`}
            >
              {stopping ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Leaving Trading Pool...</span>
                </>
              ) : isConfirmingStop ? (
                <>
                  <Ban className="w-4 h-4" />
                  <span>Click to Confirm Stop</span>
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  <span>Stop Copy Trading</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Metrics columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="active-copy-data-grid">
            <div className="bg-gray-950 p-4 border border-gray-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider">Invested Capital</span>
              <span className="text-xl font-bold font-display text-white">${user.copyBalance.toFixed(2)} USDT</span>
            </div>

            <div className="bg-gray-950 p-4 border border-gray-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider">Accrued Return</span>
              <span className="text-xl font-bold font-display text-emerald-400">+${user.profit.toFixed(2)} USDT</span>
            </div>

            <div className="bg-gray-950 p-4 border border-gray-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider">Distribution Schedule</span>
              <span className="text-xl font-semibold font-mono text-gray-300">Daily Automated</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-gray-400 text-xs font-mono flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Your trading capital is currently synced with the top-tier algorithmic flow. Daily manual returns and profits shared by the admin will automatically compound into your copy trading asset structure.
            </p>
          </div>
        </div>
      ) : (
        /* NOT JOINED: SHOW ELEGANT CARD WITH SINGLE BUTTON TO JOIN */
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6 max-w-2xl mx-auto" id="join-trading-pool-card">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 text-3xl rounded-3xl flex items-center justify-center mx-auto shadow-inner mb-2">
              ⚡
            </div>
            <h3 className="text-xl font-bold font-display text-white">Join Institutional Copy Trading Pool</h3>
            <p className="text-xs text-gray-400 font-sans max-w-md mx-auto leading-relaxed">
              Activate automated copy trading using our flagship quant indicators. This strategy automatically allocates your full account wallet balance to copy professional Institutional trades instantly.
            </p>
          </div>

          <form onSubmit={handleJoinCopy} className="space-y-4" id="join-copy-trading-pool-form">
            {/* Balance info block */}
            <div className="p-4 bg-gray-950 border border-gray-850 rounded-xl flex justify-between items-center text-xs font-mono">
              <div>
                <span className="text-gray-500 block">Available USDT Wallet Balance:</span>
                <span className="text-white font-bold text-sm block mt-0.5">${user.balance.toFixed(2)} USDT</span>
              </div>
              <div className="text-right">
                <span className="text-gray-500 block">Required Balance:</span>
                <span className="text-emerald-400 font-bold text-sm block mt-0.5">&gt; 0.00 USDT</span>
              </div>
            </div>

            {/* Allocation statement info to replace the manual input */}
            <div className="p-4 bg-gray-950 border border-gray-850 rounded-xl space-y-1 text-xs">
              <span className="text-gray-400 block font-mono font-bold">Trading Capital Allocation:</span>
              <span className="text-emerald-400 font-display font-medium block text-sm flex items-center gap-1.5 pt-0.5">
                <span>Entire Wallet Balance Name:</span>
                <span className="font-mono font-bold font-sans bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-xs">
                  ${user.balance.toFixed(2)} USDT
                </span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono block pt-1 leading-normal">
                By joining copy trading, your current entire available wallet balance of ${user.balance.toFixed(2)} USDT will be allocated and mirrored immediately to the quant institutional account.
              </span>
            </div>

            {/* Warning info */}
            <div className="p-3 bg-gray-950 border border-gray-850 rounded-xl text-[11px] text-gray-400 font-mono flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p>
                Allocating balance locks your entire wallet balance into the trading pool. Payouts and principal can be recovered at any time without fees or waiting times.
              </p>
            </div>

            <button
              type="submit"
              disabled={joining || user.balance <= 0}
              id="join-copy-trading-pool-btn"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-40"
            >
              {joining ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Joining Copy Trading Pool...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>Join Copy Trading Now</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
