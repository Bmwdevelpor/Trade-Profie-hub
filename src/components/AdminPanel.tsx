import React, { useState, useEffect } from "react";
import { User, Deposit, Withdrawal, Stats } from "../types";
import { api } from "../lib/api";
import { Users, UserCheck, ShieldCheck, DollarSign, ArrowDownCircle, ArrowUpRight, TrendingUp, Search, Eye, RefreshCw, XCircle, CheckCircle, ShieldAlert, Edit2 } from "lucide-react";

interface AdminPanelProps {
  onRefreshUser: () => void;
}

export default function AdminPanel({ onRefreshUser }: AdminPanelProps) {
  // Global states
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingKycCount, setPendingKycCount] = useState(0);
  const [pendingDepositCount, setPendingDepositCount] = useState(0);
  const [pendingWithdrawalCount, setPendingWithdrawalCount] = useState(0);

  const [users, setUsers] = useState<User[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [pendingKyc, setPendingKyc] = useState<User[]>([]);

  // Active view states
  const [activeTab, setActiveTab] = useState<"users" | "kyc" | "deposits" | "withdrawals" | "profits">("users");

  // Filter keys
  const [searchUser, setSearchUser] = useState("");

  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Loading indicator states
  const [loading, setLoading] = useState(true);
  const [distributing, setDistributing] = useState(false);
  const [actingOnId, setActingOnId] = useState<string | null>(null);

  // Profit distribution fields
  const [profitPercent, setProfitPercent] = useState("");
  const [profitDistributionData, setProfitDistributionData] = useState<any>(null);
  const [distributionError, setDistributionError] = useState<string | null>(null);
  const [isConfirmingDistribute, setIsConfirmingDistribute] = useState(false);

  // Dynamic Modals/Subcomponents
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [editBalanceAmount, setEditBalanceAmount] = useState("");
  const [editBalanceType, setEditBalanceType] = useState<"primary" | "copy" | "profit">("primary");

  const [inspectKycUser, setInspectKycUser] = useState<User | null>(null);
  const [kycRejectReason, setKycRejectReason] = useState("");

  const [inspectDeposit, setInspectDeposit] = useState<Deposit | null>(null);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const statsRes = await api.admin.getStats();
      setStats(statsRes.stats);
      setPendingKycCount(statsRes.totalPendingKyc);
      setPendingDepositCount(statsRes.totalPendingDeposits);
      setPendingWithdrawalCount(statsRes.totalPendingWithdrawals);

      const usersList = await api.admin.getUsers();
      setUsers(usersList);

      const depList = await api.admin.getDeposits();
      setDeposits(depList);

      const withList = await api.admin.getWithdrawals();
      setWithdrawals(withList);

      const kycList = await api.admin.getKyc();
      setPendingKyc(kycList);
    } catch (e) {
      console.error("Could not load administrative console parameters.", e);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const parsedVal = parseFloat(editBalanceAmount);
    if (isNaN(parsedVal) || parsedVal < 0) {
      setErrorMessage("Please input a valid positive aggregate balance size.");
      return;
    }

    try {
      setActingOnId(selectedUserForEdit.id);
      const res = await api.admin.adjustBalance(selectedUserForEdit.id, {
        amount: parsedVal,
        type: editBalanceType,
      });

      if (res.success) {
        setSelectedUserForEdit(null);
        setEditBalanceAmount("");
        setSuccessMessage(`Successfully adjusted ${editBalanceType} balance for @${res.user.username} to $${parsedVal.toFixed(2)} USDT.`);
        onRefreshUser();
        await loadAllAdminData();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Balance overwrite failed on central database.");
    } finally {
      setActingOnId(null);
    }
  };

  const handleKycAudit = async (userId: string, approve: boolean) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!approve && !kycRejectReason.trim()) {
      setErrorMessage("Please input a valid rejection description reason for the customer compliance log.");
      return;
    }

    try {
      setActingOnId(userId);
      const res = await api.admin.approveKyc({
        userId,
        approve,
        reason: approve ? undefined : kycRejectReason.trim(),
      });

      if (res.success) {
        setInspectKycUser(null);
        setKycRejectReason("");
        setSuccessMessage(approve 
          ? `Successfully approved KYC validation file for @${res.user.username}.` 
          : `Rejected KYC validation file for @${res.user.username} with reason details.`
        );
        onRefreshUser();
        await loadAllAdminData();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to commit KYC audit.");
    } finally {
      setActingOnId(null);
    }
  };

  const handleDepositAudit = async (depositId: string, approve: boolean) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      setActingOnId(depositId);
      const res = await api.admin.approveDeposit({
        depositId,
        approve,
      });

      if (res.success) {
        setInspectDeposit(null);
        setSuccessMessage(approve 
          ? `Successfully approved deposit of $${res.deposit.amount.toFixed(2)} USDT for @${res.user.username}.`
          : `Rejected deposit reference ${depositId} for @${res.user.username}.`
        );
        onRefreshUser();
        await loadAllAdminData();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to commit Deposit audit.");
    } finally {
      setActingOnId(null);
    }
  };

  const handleWithdrawalAudit = async (withdrawalId: string, approve: boolean) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      setActingOnId(withdrawalId);
      const res = await api.admin.approveWithdrawal({
        withdrawalId,
        approve,
      });

      if (res.success) {
        setSuccessMessage(approve
          ? `Successfully approved withdrawal payouts file of $${res.withdrawal.amount.toFixed(2)} USDT for @${res.user.username}.`
          : `Rejected withdrawal payouts request and reversed held funds back to @${res.user.username}'s primary wallet.`
        );
        onRefreshUser();
        await loadAllAdminData();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to commit withdrawal payout audit.");
    } finally {
      setActingOnId(null);
    }
  };

  const handleDistributeProfitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(profitPercent);

    if (isNaN(rate) || rate <= 0) {
      setDistributionError("Profit growth rate must represent a positive percentage decimal.");
      return;
    }

    if (!isConfirmingDistribute) {
      setIsConfirmingDistribute(true);
      setDistributionError(null);
      return;
    }

    setDistributing(true);
    setProfitDistributionData(null);
    setDistributionError(null);

    try {
      const res = await api.admin.distributeProfit({
        percentage: rate,
      });

      if (res.success) {
        setProfitPercent("");
        setProfitDistributionData(res);
        setIsConfirmingDistribute(false);
        onRefreshUser();
        await loadAllAdminData();
      }
    } catch (err: any) {
      setDistributionError(err.message || "Global profit distributions failed.");
    } finally {
      setDistributing(false);
    }
  };

  // Searching matcher
  const filteredUsers = users.filter((u) => {
    const s = searchUser.toLowerCase();
    return u.username.toLowerCase().includes(s) || u.fullName.toLowerCase().includes(s) || u.id.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6" id="admin-panel-viewport-wrapper">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4" id="admin-global-metrics-banner">
        <div className="bg-gray-900 border border-gray-850 p-4 rounded-xl font-mono">
          <span className="text-[10px] text-gray-500 block uppercase">Total platform Users</span>
          <span className="text-xl font-bold text-white block mt-1">{stats?.totalUsers || 0}</span>
        </div>
        <div className="bg-gray-900 border border-gray-850 p-4 rounded-xl font-mono">
          <span className="text-[10px] text-gray-500 block uppercase">Approved Deposits</span>
          <span className="text-xl font-bold text-emerald-400 block mt-1">${stats?.totalDeposited.toLocaleString()}</span>
        </div>
        <div className="bg-gray-900 border border-gray-850 p-4 rounded-xl font-mono">
          <span className="text-[10px] text-gray-500 block uppercase">Approved Payouts</span>
          <span className="text-xl font-bold text-gray-300 block mt-1">${stats?.totalWithdrawn.toLocaleString()}</span>
        </div>
        <div className="bg-gray-900 border border-gray-850 p-4 rounded-xl font-mono col-span-2 md:col-span-1">
          <span className="text-[10px] text-gray-400 block uppercase font-bold">Total distributed yields</span>
          <span className="text-xl font-bold text-emerald-400 block mt-1">${stats?.totalCompanyProfitPaid.toLocaleString()}</span>
        </div>
        <div className="bg-gray-900 border border-gray-850 p-4 rounded-xl font-mono col-span-2 md:col-span-1">
          <span className="text-[10px] text-gray-500 block uppercase">Active Copiers</span>
          <span className="text-xl font-bold text-emerald-400 block mt-1">{stats?.activeCopiers || 0}</span>
        </div>
      </div>

      {/* Admin Central Nav Headers */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Navigation buttons */}
        <div className="flex flex-wrap gap-2 text-xs font-mono font-bold" id="admin-nav-tabs">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "users" ? "bg-emerald-600 text-white" : "bg-gray-950 text-gray-400 hover:text-white"
            }`}
          >
            Manage Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("kyc")}
            className={`px-4 py-2 rounded-xl transition-all relative ${
              activeTab === "kyc" ? "bg-emerald-600 text-white" : "bg-gray-950 text-gray-400 hover:text-white"
            }`}
          >
            KYC Audits
            {pendingKycCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-rose-500 text-white rounded text-[9px]">{pendingKycCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("deposits")}
            className={`px-4 py-2 rounded-xl transition-all relative ${
              activeTab === "deposits" ? "bg-emerald-600 text-white" : "bg-gray-950 text-gray-400 hover:text-white"
            }`}
          >
            USDT Deposits
            {pendingDepositCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-rose-500 text-white rounded text-[9px]">{pendingDepositCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`px-4 py-2 rounded-xl transition-all relative ${
              activeTab === "withdrawals" ? "bg-emerald-600 text-white" : "bg-gray-950 text-gray-400 hover:text-white"
            }`}
          >
            USDT Withdrawals
            {pendingWithdrawalCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-rose-500 text-white rounded text-[9px]">{pendingWithdrawalCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("profits")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "profits" ? "bg-emerald-600 text-white" : "bg-gray-950 text-gray-400 hover:text-white"
            }`}
          >
            Copy Trading & Profits
          </button>
        </div>

        {/* Manual Refresh Trigger */}
        <button
          onClick={loadAllAdminData}
          className="p-2 bg-gray-950 hover:bg-gray-850 hover:text-emerald-400 transition-all rounded-lg border border-gray-800 text-gray-400"
          title="Refresh statistics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Dynamic Action Alerts */}
      {(errorMessage || successMessage) && (
        <div className="space-y-2" id="admin-actions-alert-banner">
          {errorMessage && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-mono flex items-center justify-between shadow-lg">
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </span>
              <button onClick={() => setErrorMessage(null)} className="text-gray-400 hover:text-white font-bold px-2">✕</button>
            </div>
          )}
          {successMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-mono flex items-center justify-between shadow-lg animate-fadeIn">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{successMessage}</span>
              </span>
              <button onClick={() => setSuccessMessage(null)} className="text-gray-400 hover:text-white font-bold px-2">✕</button>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl font-mono text-xs text-gray-500 animate-pulse">
          Refreshing system databases...
        </div>
      )}

      {/* VIEW: MANAGE USERS */}
      {!loading && activeTab === "users" && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4" id="admin-manage-users-tab">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-850 pb-4 gap-4">
            <div>
              <h3 className="text-base font-semibold font-display text-white">Platform Users Directory</h3>
              <p className="text-xs text-gray-500 font-mono mt-0.5">Edit credit lines, audit KYC state levels, view parameters</p>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Search username, email, full name..."
                className="w-full bg-gray-950 border border-gray-850 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto" id="admin-user-table-scroller">
            <table className="w-full text-xs font-mono text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-850 text-gray-500">
                  <th className="pb-3 pr-4 font-bold uppercase text-[10px]">Full Name / ID</th>
                  <th className="pb-3 px-4 font-bold uppercase text-[10px]">Username/Email</th>
                  <th className="pb-3 px-4 font-bold uppercase text-[10px]">KYC State</th>
                  <th className="pb-3 px-4 font-bold uppercase text-[10px]">Principal Balance</th>
                  <th className="pb-3 px-4 font-bold uppercase text-[10px]">Copy Pool Balance</th>
                  <th className="pb-3 px-4 font-bold uppercase text-[10px]">Total Profits Earned</th>
                  <th className="pb-3 pl-4 font-bold uppercase text-[10px] text-right">Balance edit</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-500 italic">No users matching search conditions on catalog.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-850 hover:bg-gray-950/20">
                      <td className="py-3.5 pr-4 font-display">
                        <span className="font-bold text-white block leading-none">{u.fullName}</span>
                        <span className="text-[10px] text-gray-500 font-mono mt-1 block">ID: {u.id}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-gray-350 font-bold">@{u.username}</span>
                        <span className="text-[10px] text-gray-500 block truncate max-w-[140px] mt-0.5">{u.email}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                          u.kycStatus === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                          u.kycStatus === "pending" ? "bg-amber-500/10 text-amber-500" :
                          u.kycStatus === "rejected" ? "bg-rose-500/10 text-rose-400" :
                          "bg-gray-800 text-gray-400"
                        }`}>
                          {u.kycStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-white font-bold">${u.balance.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">${u.copyBalance.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">${u.profit.toFixed(2)}</td>
                      <td className="py-3.5 pl-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedUserForEdit(u);
                            setEditBalanceAmount(u.balance.toString());
                          }}
                          className="p-2 bg-gray-950 hover:bg-emerald-600 hover:text-white border border-gray-850 rounded-lg text-emerald-400 transition-all font-bold"
                          title="Edit Balance Overwrites"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: KYC AUDITS */}
      {!loading && activeTab === "kyc" && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4" id="admin-kyc-audits-tab">
          <div>
            <h3 className="text-base font-semibold font-display text-white">Identity Files Verification Matrix</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Approve, audit passport credentials, or reject CNICs holding fraudulent logs</p>
          </div>

          <div className="space-y-4">
            {pendingKyc.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-850 rounded-xl bg-gray-955">
                <p className="text-xs text-gray-500 font-mono">All identity verify lines are audited. Zero pending dossiers.</p>
              </div>
            ) : (
              pendingKyc.map((kycU) => (
                <div key={kycU.id} className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-4">
                  <div className="flex justify-between items-start border-b border-gray-900 pb-3">
                    <div>
                      <span className="font-bold text-sm text-white block">{kycU.fullName}</span>
                      <span className="text-[10px] text-gray-500 font-mono mt-0.5">Username: @{kycU.username} | Email: {kycU.email}</span>
                    </div>

                    <button
                      onClick={() => setInspectKycUser(kycU)}
                      className="py-1.5 px-3 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/10 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Inspect ID Documents</span>
                    </button>
                  </div>

                  {/* Submission date info */}
                  <div className="text-[10px] font-mono text-gray-500 flex justify-between">
                    <span>Filing system ID: {kycU.id}</span>
                    <span>Submitted: {kycU.kycData?.submittedAt ? new Date(kycU.kycData.submittedAt).toLocaleString() : "Unknown date"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW: DEPOSITS APPROVALS */}
      {!loading && activeTab === "deposits" && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4" id="admin-deposits-approvals-tab">
          <div>
            <h3 className="text-base font-semibold font-display text-white">USDT TRC20 Top-up claims ledger</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5 font-bold">Approved approvals distribute referral commissions instantly</p>
          </div>

          <div className="space-y-4">
            {deposits.filter((d) => d.status === "pending").length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-850 rounded-xl bg-gray-955">
                <p className="text-xs text-gray-500 font-mono">No pending deposit audit requests found.</p>
              </div>
            ) : (
              deposits.filter((d) => d.status === "pending").map((dep) => (
                <div key={dep.id} className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-900 pb-3 gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 font-mono">Top-up Value</span>
                          <span className="text-base font-bold text-white font-mono">${dep.amount.toFixed(2)} USDT</span>
                        </div>
                        <div className="text-gray-700 font-mono text-xs self-end mb-0.5">+</div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 font-mono">10% Promo Bonus</span>
                          <span className="text-emerald-400 font-bold font-mono text-sm">${(dep.amount * 0.10).toFixed(2)} USDT</span>
                        </div>
                        <div className="text-gray-700 font-mono text-xs self-end mb-0.5">→</div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 font-mono font-medium">Total Balance Credit</span>
                          <span className="text-emerald-400 font-extrabold font-mono text-base">${(dep.amount + dep.amount * 0.10).toFixed(2)} USDT</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-300 font-sans block mt-2">Submitted by: <span className="text-white font-bold font-mono">@{dep.username}</span> | ID: {dep.userId}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {dep.screenshot && (
                        <button
                          onClick={() => setInspectDeposit(dep)}
                          className="py-1.5 px-3 bg-gray-850 hover:bg-gray-800 text-white border border-gray-850 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Receipt Proof</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDepositAudit(dep.id, false)}
                        disabled={actingOnId === dep.id}
                        className="py-1.5 px-3 bg-rose-600/10 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/10 rounded-lg text-xs font-mono font-bold transition-all"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => handleDepositAudit(dep.id, true)}
                        disabled={actingOnId === dep.id}
                        className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 shadow-lg shadow-emerald-500/10"
                      >
                        Approve Deposit
                      </button>
                    </div>
                  </div>

                  <div className="font-mono text-[10px] text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>USDT TRC20 TXID Hash:</span>
                      <span className="text-gray-200 break-all select-all font-bold">{dep.txid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Filing date:</span>
                      <span className="text-gray-400">{new Date(dep.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW: WITHDRAWALS APPROVALS */}
      {!loading && activeTab === "withdrawals" && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4" id="admin-withdrawals-approvals-tab">
          <div>
            <h3 className="text-base font-semibold font-display text-white">USDT TRC20 Withdrawal Audit queue</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Approving triggers blockchain payout notification. Rejecting reverses held USDT assets to user profiles.</p>
          </div>

          <div className="space-y-4">
            {withdrawals.filter((w) => w.status === "pending").length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-850 rounded-xl bg-gray-955">
                <p className="text-xs text-gray-500 font-mono">No pending withdrawal payouts queue found.</p>
              </div>
            ) : (
              withdrawals.filter((w) => w.status === "pending").map((wit) => (
                <div key={wit.id} className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-900 pb-3 gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 font-mono">Gross Amount</span>
                          <span className="text-base font-bold text-white font-mono">${wit.amount.toFixed(2)} USDT</span>
                        </div>
                        <div className="text-gray-700 font-mono text-xs self-end mb-0.5">→</div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 font-mono">2% Fee</span>
                          <span className="text-rose-450 font-bold font-mono text-sm">${(wit.fee ?? (wit.amount * 0.02)).toFixed(2)} USDT</span>
                        </div>
                        <div className="text-gray-700 font-mono text-xs self-end mb-0.5">→</div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 font-mono font-medium">To Approve & Payout</span>
                          <span className="text-emerald-400 font-extrabold font-mono text-base">${(wit.finalAmount ?? (wit.amount * 0.98)).toFixed(2)} USDT</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-300 block mt-2">Beneficiary profile: <span className="text-white font-bold font-mono">@{wit.username}</span> | ID: {wit.userId}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleWithdrawalAudit(wit.id, false)}
                        disabled={actingOnId === wit.id}
                        className="py-1.5 px-3 bg-rose-600/10 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/10 rounded-lg text-xs font-mono font-bold transition-all"
                      >
                        Reject & Reverse
                      </button>

                      <button
                        onClick={() => handleWithdrawalAudit(wit.id, true)}
                        disabled={actingOnId === wit.id}
                        className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 shadow-lg shadow-emerald-500/10"
                      >
                        Approve Payout
                      </button>
                    </div>
                  </div>

                  <div className="font-mono text-[10px] text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>TRC20 Destination Wallet Address:</span>
                      <span className="text-emerald-450 select-all font-bold break-all">{wit.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Filing date:</span>
                      <span className="text-gray-400">{new Date(wit.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW: DISTRIBUTE PROFITS & COPY TRADING MANAGEMENT */}
      {!loading && activeTab === "profits" && (
        <div className="space-y-6" id="admin-daily-profits-tab">
          {/* Section 1: Profit share controls */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold font-display text-white">Daily Manual Profit Share Distributor</h2>
              <p className="text-xs text-gray-500 font-mono mt-0.5">Issue aggregate daily returns percentage index directly to all active copy pool copiers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
              {/* Input form */}
              <div className="bg-gray-950 p-5 rounded-xl border border-gray-850 space-y-4">
                <span className="text-xs font-mono text-gray-400 block font-bold uppercase flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Manual Profit Share Console</span>
                </span>

                <form onSubmit={handleDistributeProfitSubmit} className="space-y-4" id="distribute-profit-rate-form">
                  {distributionError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-mono">
                      {distributionError}
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-mono text-gray-400 block mb-1.5">Accrued daily profit rate (%):</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={profitPercent}
                        onChange={(e) => {
                          setProfitPercent(e.target.value);
                          setIsConfirmingDistribute(false);
                        }}
                        placeholder="e.g. 1.85"
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                        required
                      />
                      <span className="absolute right-4 top-2.5 text-xs text-gray-500 font-mono font-bold">% Profit Rate</span>
                    </div>
                    <span className="text-[10px] text-gray-600 font-mono mt-1 block">Yield is computed against user's allocated copyBalance instantly.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={distributing || !profitPercent}
                    id="distribute-daily-yield-btn"
                    className={`w-full py-3 rounded-xl text-xs font-display font-medium transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 ${
                      isConfirmingDistribute
                        ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/10"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/10"
                    }`}
                  >
                    {distributing
                      ? "Distributing yield dividends..."
                      : isConfirmingDistribute
                      ? `Click to Confirm +${profitPercent}% Distribution`
                      : "Distribute Profit Yield"}
                  </button>
                </form>
              </div>

              {/* Response message banner */}
              <div className="bg-gray-950 p-5 rounded-xl border border-gray-850 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-gray-405 block font-bold uppercase mb-2">Platform distribution log ticker</span>
                  {profitDistributionData ? (
                    <div className="space-y-3 font-mono text-xs text-gray-400" id="distribution-stats-output">
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Dividends distributed successfully!</span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between border-b border-gray-900 pb-1">
                          <span>Percentage Issued:</span>
                          <span className="text-white font-bold">+{profitDistributionData.percentage}%</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-900 pb-1">
                          <span>Active Copiers Paid:</span>
                          <span className="text-white font-bold">{profitDistributionData.distributedCount} accounts</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Volume Capital Paid:</span>
                          <span className="text-emerald-400 font-bold">${profitDistributionData.totalProfitsDistributed.toFixed(2)} USDT</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 border border-dashed border-gray-850 rounded-xl" id="distribution-idle-view">
                      <span className="text-xs text-gray-500 font-mono">Consolidated dividends stats will appear here.</span>
                    </div>
                  )}
                </div>

                <div className="text-[10px] font-mono text-gray-600 italic">
                  Logs and transaction events are archived automatically upon rate allocations.
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Copy Trading Joined Users Directory */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-850 pb-4 gap-4">
              <div>
                <h3 className="text-base font-semibold font-display text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>Joined Copy Trading Users Directory</span>
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">Monitor all users currently active in copy trading and manually adjust allocations</p>
              </div>

              <div className="bg-gray-950 px-3.5 py-1.5 rounded-xl border border-gray-850 text-xs font-mono text-emerald-400 font-bold">
                Total Copiers: {users.filter((u) => u.isCopying).length}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-850 text-gray-500">
                    <th className="pb-3 pr-4 font-bold uppercase text-[10px]">Copier Member</th>
                    <th className="pb-3 px-4 font-bold uppercase text-[10px]">Username</th>
                    <th className="pb-3 px-4 font-bold uppercase text-[10px]">Status</th>
                    <th className="pb-3 px-4 font-bold uppercase text-[10px]">Active Copy Capital</th>
                    <th className="pb-3 px-4 font-bold uppercase text-[10px]">Accrued Profits</th>
                    <th className="pb-3 pl-4 font-bold uppercase text-[10px] text-right">Quick action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter((u) => u.isCopying).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500 italic">
                        No active platform members are currently joined in copy trading.
                      </td>
                    </tr>
                  ) : (
                    users
                      .filter((u) => u.isCopying)
                      .map((u) => (
                        <tr key={u.id} className="border-b border-gray-850 hover:bg-gray-950/20">
                          <td className="py-3.5 pr-4 font-display">
                            <span className="font-bold text-white block leading-none">{u.fullName}</span>
                            <span className="text-[9px] text-gray-500 font-mono mt-1 block">ID: {u.id}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-white">
                            @{u.username}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-bold uppercase tracking-wider">
                              Joined active
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                            ${u.copyBalance.toFixed(2)} USDT
                          </td>
                          <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                            +${u.profit.toFixed(2)} USDT
                          </td>
                          <td className="py-3.5 pl-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedUserForEdit(u);
                                setEditBalanceType("copy");
                                setEditBalanceAmount(u.copyBalance.toString());
                              }}
                              className="px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 rounded-lg text-emerald-400 transition-all font-mono font-bold flex items-center gap-1.5 ml-auto"
                              title="Overwrite balance rules"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit Allocation</span>
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* MODAL WINDOWS */}

      {/* MODAL 1: EDIT BALANCE */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" id="edit-balance-modal">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 gap-4 relative shadow-2xl space-y-4">
            <div>
              <h3 className="text-lg font-bold font-display text-white">Overwrite balance parameters</h3>
              <p className="text-xs text-gray-500 font-mono mt-0.5">Manually overwrite wallet or copy ledger assets sizes</p>
            </div>

            <form onSubmit={handleEditBalanceSubmit} className="space-y-4" id="overwrite-balance-form">
              <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl space-y-1 font-mono text-xs text-gray-400">
                <span className="text-[10px] block uppercase text-gray-500">Under audit member:</span>
                <span className="text-white font-bold block">{selectedUserForEdit.fullName} (@{selectedUserForEdit.username})</span>
                <span className="text-gray-400 block mt-1.5">Wallet: ${selectedUserForEdit.balance.toFixed(2)} | Copy Pool: ${selectedUserForEdit.copyBalance.toFixed(2)} | Profit: ${selectedUserForEdit.profit.toFixed(2)}</span>
              </div>

              {/* Balance Overwrite Choice type */}
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1.5">Alteration ledger type:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditBalanceType("primary")}
                    className={`py-2 rounded-xl text-xs font-mono transition-all border font-bold ${
                      editBalanceType === "primary" ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/30" : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    Wallet
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditBalanceType("copy")}
                    className={`py-2 rounded-xl text-xs font-mono transition-all border font-bold ${
                      editBalanceType === "copy" ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/30" : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    Copy Pool
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditBalanceType("profit")}
                    className={`py-2 rounded-xl text-xs font-mono transition-all border font-bold ${
                      editBalanceType === "profit" ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/30" : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    Profit Gained
                  </button>
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1.5">Set balance absolute value (USDT):</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={editBalanceAmount}
                    onChange={(e) => setEditBalanceAmount(e.target.value)}
                    placeholder="Enter new USDT amount"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                  <span className="absolute right-4 top-2.5 text-xs text-gray-500 font-mono font-bold">USDT</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-mono font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg"
                >
                  Save alterations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INSPECT KYC DOCS */}
      {inspectKycUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto" id="inspect-kyc-modal">
          <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl p-6 relative col-span-1 shadow-2xl space-y-5 my-6">
            <div className="flex justify-between items-center border-b border-gray-850 pb-3">
              <div>
                <h3 className="text-lg font-bold font-display text-white">KYC dossier audit console</h3>
                <span className="text-xs text-gray-500 font-mono">User: {inspectKycUser.fullName} (@{inspectKycUser.username}) | ID: {inspectKycUser.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setInspectKycUser(null)}
                className="text-gray-400 hover:text-white font-mono text-sm"
              >
                Close
              </button>
            </div>

            {/* Images display grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-950 rounded-xl p-3 border border-gray-800 text-center space-y-2">
                <span className="text-[10px] uppercase font-mono text-gray-400 block font-bold">CNIC Card front</span>
                <div className="h-40 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center border border-gray-850 group relative">
                  {inspectKycUser.kycData?.cnicFront ? (
                    <img src={inspectKycUser.kycData.cnicFront} alt="CNIC Front" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs text-gray-600 font-mono">No Image</span>
                  )}
                </div>
              </div>

              <div className="bg-gray-950 rounded-xl p-3 border border-gray-800 text-center space-y-2">
                <span className="text-[10px] uppercase font-mono text-gray-400 block font-bold">CNIC Card Back</span>
                <div className="h-40 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center border border-gray-850 group relative">
                  {inspectKycUser.kycData?.cnicBack ? (
                    <img src={inspectKycUser.kycData.cnicBack} alt="CNIC Back" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs text-gray-600 font-mono">No Image</span>
                  )}
                </div>
              </div>

              <div className="bg-gray-950 rounded-xl p-3 border border-gray-800 text-center space-y-2">
                <span className="text-[10px] uppercase font-mono text-gray-400 block font-bold">Portrait ID Selfie</span>
                <div className="h-40 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center border border-gray-850 group relative">
                  {inspectKycUser.kycData?.selfie ? (
                    <img src={inspectKycUser.kycData.selfie} alt="ID Selfie" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs text-gray-600 font-mono">No Image</span>
                  )}
                </div>
              </div>
            </div>

            {/* Kyc Audit input controls */}
            <div className="border-t border-gray-850 pt-4 space-y-4">
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1.5">Rejection description reason (Compulsory ONLY if rejecting):</label>
                <input
                  type="text"
                  value={kycRejectReason}
                  onChange={(e) => setKycRejectReason(e.target.value)}
                  placeholder="e.g. Blurred and illegible portrait photo. Or addresses unaligned."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleKycAudit(inspectKycUser.id, false)}
                  className="py-2.5 bg-rose-600 text-white hover:bg-rose-500 rounded-xl text-xs font-mono font-bold transition-all"
                >
                  Reject Kyc Submission
                </button>
                <button
                  type="button"
                  onClick={() => handleKycAudit(inspectKycUser.id, true)}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg"
                >
                  Approve Kyc Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: INSPECT DEPOSIT SCREENSHOT */}
      {inspectDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" id="inspect-deposit-screenshot-modal">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 relative shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-850 pb-3">
              <h3 className="text-base font-bold font-display text-white">Receipt screenshot audit</h3>
              <button
                type="button"
                onClick={() => setInspectDeposit(null)}
                className="text-gray-400 hover:text-white font-mono text-xs"
              >
                Close
              </button>
            </div>

            <div className="bg-gray-950 p-2 border border-gray-850 rounded-xl overflow-hidden flex items-center justify-center max-h-96">
              {inspectDeposit.screenshot ? (
                <img src={inspectDeposit.screenshot} alt="USDT Transfer Proof" className="max-h-80 rounded-lg object-contain w-full" />
              ) : (
                <span className="text-xs text-gray-500 font-mono">No Screenshot Proof Filed</span>
              )}
            </div>

            <div className="font-mono text-[10px] text-gray-450 border-t border-gray-850 pt-3 space-y-0.5">
              <div className="flex justify-between">
                <span>Depositor Member:</span>
                <span className="text-white font-bold">@{inspectDeposit.username}</span>
              </div>
              <div className="flex justify-between">
                <span>USDT Size claim:</span>
                <span className="text-emerald-400 font-bold">${inspectDeposit.amount.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between">
                <span>Blockchain TXID keys:</span>
                <span className="text-gray-400 truncate max-w-[200px]">{inspectDeposit.txid}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
