import { useState, useEffect } from "react";
import { User } from "../types";
import { api } from "../lib/api";
import { Copy, Gift, HelpCircle, Users, CheckCircle, RefreshCw, Award } from "lucide-react";

interface ReferralsProps {
  user: User;
}

export default function Referrals({ user }: ReferralsProps) {
  const [data, setData] = useState<{ referralCode: string; referredCount: number; history: any[]; totalBonusEarned: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetchReferralsData();
  }, [user.id]);

  const fetchReferralsData = async () => {
    try {
      setLoading(true);
      const res = await api.referrals.get(user.id);
      setData(res);
    } catch (e) {
      console.error("Could not fetch referrals data matrix", e);
    } finally {
      setLoading(false);
    }
  };

  const referralLink = `${window.location.origin}/?ref=${data?.referralCode || user.referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(data?.referralCode || user.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="referrals-view-main">
      {/* Referral Link & Code Widgets Header (7 columns) */}
      <div className="space-y-6 lg:col-span-7">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex gap-3 border-b border-gray-800 pb-4">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">Referral Program Matrix</h2>
              <p className="text-xs text-gray-500 font-mono">Commission bonuses for building unified investment teams</p>
            </div>
          </div>

          <p className="text-xs text-gray-300 font-sans leading-relaxed">
            Invite friends, traders or partners to copy trading portfolios on Trade Profit Hub. Automatically earn a <span className="text-emerald-400 font-bold">5% deposit bonus</span> straight to your principal balance whenever any referred team member completes an approved USDT deposit!
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 text-center font-mono">
              <span className="text-[10px] text-gray-500 block uppercase tracking-wider">Referral Deposit bonus</span>
              <span className="text-sm font-bold text-emerald-400 block mt-1">+5.00% Net Commission</span>
            </div>
            <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 text-center font-mono">
              <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Team Volume Cap</span>
              <span className="text-sm font-bold text-white block mt-1">Unlimited Assets</span>
            </div>
          </div>

          {/* Code display boxes */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1.5">Your Affiliate invite link:</label>
              <div className="flex items-center gap-2 bg-gray-950 px-3 py-2 rounded-xl border border-gray-800 relative grow">
                <span className="font-mono text-xs text-emerald-400 break-all select-all truncate shrink pr-12">
                  {referralLink}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  id="copy-referral-link-btn"
                  className="absolute right-2 top-1.5 p-1.5 bg-gray-850 hover:bg-emerald-600 font-bold hover:text-white text-gray-300 rounded-lg transition-all"
                  title="Copy link"
                >
                  {copiedLink ? <span className="text-[10px] font-mono select-none px-1 text-emerald-300">Copied</span> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1.5">Private Referral Code:</label>
              <div className="flex items-center gap-2 bg-gray-950 px-3 py-2 rounded-xl border border-gray-800 relative grow">
                <span className="font-mono text-xs text-white uppercase tracking-wider font-bold">
                  {data?.referralCode || user.referralCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  id="copy-referral-code-btn"
                  className="absolute right-2 top-1.5 p-1.5 bg-gray-850 hover:bg-emerald-600 font-bold hover:text-white text-gray-300 rounded-lg transition-all"
                  title="Copy invite code"
                >
                  {copiedCode ? <span className="text-[10px] font-mono select-none px-1 text-emerald-300">Copied</span> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Affiliate guidelines Box */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-1.5 text-gray-200">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold font-display uppercase tracking-wider">Passive Earning Instructions</span>
          </div>

          <div className="space-y-2 font-mono text-xs text-gray-400">
            <p className="leading-relaxed">
              When a new trader registers with your referral code, they are linked permanently to your account team. When they file a deposit claim and the admin approves it, 5% of their total deposited USDT size is generated out of thin air and credited straight to your balance.
            </p>
            <p className="text-[11px] text-gray-500 pt-1">
              Multi tier structures are under beta. Leverage your direct team links to accumulate substantial residual USDT returns.
            </p>
          </div>
        </div>
      </div>

      {/* Stats and referred team lists (5 columns) */}
      <div className="space-y-6 lg:col-span-12 xl:col-span-5">
        {/* Referral stats mini card */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center flex flex-col justify-between h-28">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Bonus Commissions</span>
            <span className="text-2xl font-bold text-emerald-400 font-display block mt-1">
              ${(data?.totalBonusEarned || 0).toFixed(2)} <span className="text-xs font-mono text-gray-500">USDT</span>
            </span>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center flex flex-col justify-between h-28">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Joined Affiliates</span>
            <span className="text-2xl font-bold text-white font-display block mt-1">
              {data?.referredCount || 0} <span className="text-xs font-mono text-gray-500">Traders</span>
            </span>
          </div>
        </div>

        {/* Referred list matrix */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-100 mb-4 border-b border-gray-800 pb-3">
              <Users className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold font-display">Affiliate Team Directory</h3>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-6">
                  <span className="text-xs text-gray-500 font-mono animate-pulse">Scanning team directory...</span>
                </div>
              ) : !data || data.history.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-800 rounded-xl" id="empty-referrals-history">
                  <span className="text-xs text-gray-500 font-mono">No partners have registered yet. Share invite links to build team loops.</span>
                </div>
              ) : (
                data.history.map((teamUser, index) => (
                  <div key={index} className="bg-gray-950 p-3 rounded-xl border border-gray-800 flex justify-between items-center">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold font-display text-white block truncate max-w-[150px]">{teamUser.fullName}</span>
                      <span className="text-[10px] text-gray-500 font-mono block">Joined: {new Date(teamUser.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1 font-mono text-[10px]">
                      {/* KYC status tag */}
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wide ${
                        teamUser.kycStatus === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                        teamUser.kycStatus === "pending" ? "bg-amber-500/10 text-amber-500" :
                        "bg-gray-800 text-gray-400"
                      }`}>
                        KYC {teamUser.kycStatus}
                      </span>
                      {/* Active Trade Tag */}
                      {teamUser.activeCopying ? (
                        <span className="text-emerald-400 text-[8px] font-bold uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Copying Trader</span>
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[8px] font-bold uppercase">No Active Trade</span>
                      )}
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
