import React, { useState, useEffect } from "react";
import { User, Transaction, Notification } from "./types";
import { api } from "./lib/api";

// Core Components
import Dashboard from "./components/Dashboard";
import CopyTrading from "./components/CopyTrading";
import DepositSystem from "./components/DepositSystem";
import WithdrawalSystem from "./components/WithdrawalSystem";
import KycVerification from "./components/KycVerification";
import Referrals from "./components/Referrals";
import Transactions from "./components/Transactions";
import Profile from "./components/Profile";
import AdminPanel from "./components/AdminPanel";
import Notifications from "./components/Notifications";

// Icons
import {
  TrendingUp,
  Wallet,
  ArrowDownCircle,
  ArrowUpRight,
  ShieldCheck,
  Gift,
  History,
  User as UserIcon,
  ShieldAlert,
  Bell,
  Menu,
  X,
  PlusCircle,
  CheckCircle2,
  Lock,
  Globe,
  Loader2,
  Activity
} from "lucide-react";

export default function App() {
  // Session details
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Navigations tab
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication screens tab toggle ('login' | 'register')
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formFullName, setFormFullName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formReferral, setFormReferral] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Transactions ledger list
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTxs, setLoadingTxs] = useState(false);

  // Check query parameter for affiliate ref codes on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setFormReferral(ref);
      setAuthMode("register"); // Automatically encourage registration if referred
    }

    // Try load persistent session
    const cachedUser = localStorage.getItem("tph_session");
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        refreshUserContext(parsed.id);
      } catch (e) {
        localStorage.removeItem("tph_session");
        setLoadingSession(false);
      }
    } else {
      setLoadingSession(false);
    }
  }, []);

  // Sync session and fetch dynamic records periodically
  useEffect(() => {
    if (!user) return;

    // Direct initial pulls
    fetchNotifications();
    fetchTransactions();

    // Cron jobs tickers
    const interval = setInterval(() => {
      refreshUserContext(user.id);
      fetchNotifications();
      if (activeTab === "ledger") {
        fetchTransactions();
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [user?.id, activeTab]);

  const refreshUserContext = async (userId: string) => {
    try {
      const u = await api.auth.getUser(userId);
      setUser(u);
      localStorage.setItem("tph_session", JSON.stringify(u));
    } catch (e) {
      console.error("Session refresh failed", e);
    } finally {
      setLoadingSession(false);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoadingNotifications(true);
      const items = await api.notifications.list(user.id);
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(items);
    } catch (e) {
      console.error("Notifications fetch failures", e);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      setLoadingTxs(true);
      const items = await api.transactions.list(user.id);
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTransactions(items);
    } catch (e) {
      console.error("Transactions ledger retrieve failures", e);
    } finally {
      setLoadingTxs(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await api.notifications.markRead(user.id);
      await fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  // Auth form submissions
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (authMode === "login") {
      try {
        const res = await api.auth.login({ username: formUsername.trim(), password: formPassword });
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem("tph_session", JSON.stringify(res.user));
          setFormPassword("");
          setFormUsername("");
        }
      } catch (err: any) {
        setAuthError(err.message || "Invalid credentials.");
      }
    } else {
      try {
        const res = await api.auth.register({
          username: formUsername.trim(),
          password: formPassword,
          fullName: formFullName.trim(),
          email: formEmail.trim(),
          referredByCode: formReferral.trim() || undefined,
        });

        if (res.success && res.user) {
          setAuthSuccess("Registration completed successfully on secure nodes! Authenticating...");
          setTimeout(() => {
            setUser(res.user);
            localStorage.setItem("tph_session", JSON.stringify(res.user));
            setFormUsername("");
            setFormPassword("");
            setFormFullName("");
            setFormEmail("");
            setFormReferral("");
            setAuthSuccess(null);
          }, 1500);
        }
      } catch (err: any) {
        setAuthError(err.message || "Registration failed. Username may exist.");
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("tph_session");
    setActiveTab("dashboard");
  };

  const handlePageNavigation = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center text-gray-400 font-mono gap-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <span>Syncing platform secure protocols...</span>
      </div>
    );
  }

  // Gated interface: Authentication view
  if (!user) {
    return (
      <div className="min-h-screen bg-[#050b14] flex items-center justify-center px-4 py-12" id="gated-auth-view">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 relative shadow-2xl space-y-6">
          {/* Decorative gradients */}
          <div className="absolute inset-0 bg-emerald-500/5 rounded-3xl blur-2xl pointer-events-none" />

          {/* Branded intro */}
          <div className="text-center relative">
            <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl mb-3 shadow-inner">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold font-display text-white tracking-tight">Trade Profit Hub</h1>
            <p className="text-xs text-gray-500 font-mono mt-1">High-speed professional crypto copy trading engine</p>
          </div>

          {/* Sliding Tabs */}
          <div className="grid grid-cols-2 p-1 bg-gray-950 rounded-2xl border border-gray-850 font-mono text-xs">
            <button
              onClick={() => {
                setAuthMode("login");
                setAuthError(null);
              }}
              className={`py-2 rounded-xl font-bold transition-all ${
                authMode === "login" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode("register");
                setAuthError(null);
              }}
              className={`py-2 rounded-xl font-bold transition-all ${
                authMode === "register" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Input Fields Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4 relative" id="auth-submit-form">
            {authError && <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded-xl font-mono">{authError}</div>}
            {authSuccess && <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl font-mono">{authSuccess}</div>}

            {authMode === "register" && (
              <>
                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1.5">Your Full Name:</label>
                  <input
                    type="text"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    placeholder="e.g. Satoshi Nakamoto"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1.5">Email Address:</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. user@tphub.com"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1.5">Access Username:</label>
              <input
                type="text"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                placeholder="e.g. trader_elite"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1.5">Secret Password:</label>
              <input
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                required
              />
            </div>

            {authMode === "register" && (
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1.5">Referrer Code (Optional):</label>
                <input
                  type="text"
                  value={formReferral}
                  onChange={(e) => setFormReferral(e.target.value)}
                  placeholder="Paste referral hash if any"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono uppercase tracking-wider"
                />
              </div>
            )}

            <button
              type="submit"
              id="auth-main-submit-btn"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-display font-medium transition-all shadow-lg shadow-emerald-500/15"
            >
              {authMode === "login" ? "Complete Secure Authentication" : "Register and Bind Profile"}
            </button>
          </form>

          {/* Security policy footnote */}
          <div className="flex items-center gap-2 justify-center font-mono text-[10px] text-gray-500 pt-2 border-t border-gray-850">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted with SHA-256 SSL Protocol</span>
          </div>
        </div>
      </div>
    );
  }

  // Main UI Shell (Logged In)
  return (
    <div className="min-h-screen bg-[#050b14] flex flex-col select-none text-gray-300" id="main-application-shell">
      {/* Top Header Bar */}
      <header className="bg-gray-900/90 border-b border-gray-850 sticky top-0 z-40 backdrop-blur-md px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 bg-gray-950 border border-gray-800 hover:text-white transition-all rounded-lg text-gray-400 md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm sm:text-base font-display text-white tracking-tight leading-none">Trade Profit Hub</span>
          </div>

          {/* Live indicator ticker (Desktop) */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Node Synchronized Live</span>
          </div>
        </div>

        {/* Header Right controllers */}
        <div className="flex items-center gap-3">
          {/* Unread notification icon bell drop */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              id="header-notification-bell-btn"
              className={`p-2 bg-gray-950 border rounded-xl hover:text-white transition-all text-gray-400 ${
                showNotificationsDropdown ? "border-emerald-500 text-emerald-400" : "border-gray-850"
              }`}
            >
              <Bell className="w-4 h-4" />
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border border-gray-950" />
              )}
            </button>

            {/* Micro notifications dropdown overlay drawer */}
            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-3 w-80 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-4 space-y-3 z-50 transform origin-top-right transition-all animate-fade-in" id="header-notifications-dropdown">
                <div className="flex justify-between items-center border-b border-gray-850 pb-2">
                  <span className="text-xs font-bold font-display text-white">System Logs</span>
                  {notifications.filter((n) => !n.isRead).length > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[9px] font-mono text-emerald-400 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-500 font-mono">No inbox messages.</div>
                  ) : (
                    notifications.slice(0, 4).map((n) => (
                      <div key={n.id} className="p-2 bg-gray-950 border border-gray-850/60 rounded-xl space-y-0.5">
                        <div className="flex gap-1.5 items-center">
                          {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
                          <span className={`text-[10px] font-bold truncate leading-none ${n.isRead ? "text-gray-400" : "text-emerald-300"}`}>
                            {n.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 line-clamp-2 leading-tight">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-gray-850 pt-2 text-center">
                  <button
                    onClick={() => {
                      setShowNotificationsDropdown(false);
                      handlePageNavigation("notifications");
                    }}
                    className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-1 mx-auto font-bold"
                  >
                    <span>View complete inbox</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Wallet summary button link triggers deposit */}
          <button
            onClick={() => handlePageNavigation("deposit")}
            id="header-wallet-amount-btn"
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/20 rounded-xl transition-all cursor-pointer text-white text-xs font-mono font-bold"
          >
            <Wallet className="w-3.5 h-3.5 text-white/90" />
            <span>${user.balance.toFixed(2)} USDT</span>
          </button>

          {/* User badge display panel navigation */}
          <button
            onClick={() => handlePageNavigation("profile")}
            id="header-profile-toggle-btn"
            className="p-1 sm:px-3 sm:py-1.5 bg-gray-950 border border-gray-850 hover:border-gray-700 hover:text-white rounded-xl transition-all flex items-center gap-2 cursor-pointer text-gray-300 text-xs font-mono font-semibold"
          >
            <div className="w-6 h-6 bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 rounded-lg flex items-center justify-center font-bold">
              {user.fullName.charAt(0)}
            </div>
            <span className="hidden sm:inline">@{user.username}</span>
          </button>
        </div>
      </header>

      {/* Main viewport area layout */}
      <div className="grow flex relative" id="main-viewport-split">
        {/* DESKTOP SIDEBAR MENU */}
        <aside className="hidden md:block w-64 bg-gray-900/50 border-r border-gray-850 h-[calc(100vh-4rem)] sticky top-16 p-6 flex flex-col justify-between" id="desktop-sidebar-rails">
          <div className="space-y-5">
            <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-widest pl-2">Security Channels</span>

            <nav className="space-y-1.5 font-sans text-xs font-medium" id="desktop-sidebar-nav">
              <button
                onClick={() => handlePageNavigation("dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "dashboard" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Dashboard overview</span>
              </button>

              <button
                onClick={() => handlePageNavigation("kopier")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "kopier" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Copy Trading Pools</span>
              </button>

              <button
                onClick={() => handlePageNavigation("deposit")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "deposit" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span>USDT TRC20 Deposit</span>
              </button>

              <button
                onClick={() => handlePageNavigation("withdrawal")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "withdrawal" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Asset Withdrawals</span>
              </button>

              <button
                onClick={() => handlePageNavigation("kyc")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "kyc" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>KYC Profile Verification</span>
              </button>

              <button
                onClick={() => handlePageNavigation("referral")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "referral" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>Affiliate Referrals</span>
              </button>

              <button
                onClick={() => handlePageNavigation("ledger")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "ledger" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                <History className="w-4 h-4" />
                <span>Activity Ledgers</span>
              </button>
            </nav>
          </div>

          <div className="space-y-3.5">
            {/* Admin Tab integration (Only visible to admin tags) */}
            {user.isAdmin && (
              <button
                onClick={() => handlePageNavigation("admin")}
                id="sidebar-admin-btn"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${
                  activeTab === "admin"
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-indigo-600/10 hover:bg-indigo-600 border-indigo-500/20 text-indigo-400 hover:text-white"
                }`}
              >
                <Lock className="w-4 h-4" />
                <span className="font-bold">Administrative center</span>
              </button>
            )}

            {/* Quick Profile stats */}
            <div className="bg-gray-950 p-3.5 border border-gray-850 rounded-xl space-y-1.5 font-mono text-[10px]">
              <span className="text-gray-500 block">Affiliate link status</span>
              <span className="text-white block truncate leading-none font-bold select-all">?ref={user.referralCode}</span>
            </div>
          </div>
        </aside>

        {/* MAIN VIEWPORT BODY PANELS */}
        <main className="grow px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] overflow-y-auto" id="main-viewport-canvas">
          <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {activeTab === "dashboard" && (
              <Dashboard user={user} onRefreshUser={() => refreshUserContext(user.id)} onNavigate={handlePageNavigation} transactions={transactions} />
            )}

            {activeTab === "kopier" && (
              <CopyTrading user={user} onRefreshUser={() => refreshUserContext(user.id)} onNavigate={handlePageNavigation} />
            )}

            {activeTab === "deposit" && (
              <DepositSystem user={user} onRefreshUser={() => refreshUserContext(user.id)} />
            )}

            {activeTab === "withdrawal" && (
              <WithdrawalSystem user={user} onRefreshUser={() => refreshUserContext(user.id)} onNavigate={handlePageNavigation} />
            )}

            {activeTab === "kyc" && (
              <KycVerification user={user} onRefreshUser={() => refreshUserContext(user.id)} />
            )}

            {activeTab === "referral" && (
              <Referrals user={user} />
            )}

            {activeTab === "ledger" && (
              <Transactions transactions={transactions} loading={loadingTxs} />
            )}

            {activeTab === "profile" && (
              <Profile user={user} onLogout={handleLogout} />
            )}

            {activeTab === "notifications" && (
              <Notifications notifications={notifications} onMarkAllRead={handleMarkAllRead} loading={loadingNotifications} />
            )}

            {activeTab === "admin" && user.isAdmin && (
              <AdminPanel onRefreshUser={() => refreshUserContext(user.id)} />
            )}
          </div>
        </main>
      </div>

      {/* MOBILE DRAWERS NAVIGATION */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex" id="mobile-drawer-modal">
          {/* Overlay backdrop black */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
          />

          <div className="w-72 bg-gray-900 border-r border-gray-800 h-full p-6 flex flex-col justify-between relative z-10 animate-slide-right">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-850 pb-4">
                <span className="font-bold text-white font-display">Hub Controllers</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 hover:text-white transition-all text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav selectors */}
              <nav className="space-y-1 font-sans text-xs font-semibold">
                <button
                  onClick={() => handlePageNavigation("dashboard")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === "dashboard" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => handlePageNavigation("kopier")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === "kopier" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Copy Trading Pools</span>
                </button>

                <button
                  onClick={() => handlePageNavigation("deposit")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === "deposit" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  <span>USDT Deposit</span>
                </button>

                <button
                  onClick={() => handlePageNavigation("withdrawal")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === "withdrawal" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Asset Withdrawals</span>
                </button>

                <button
                  onClick={() => handlePageNavigation("kyc")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === "kyc" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>KYC Profile Verification</span>
                </button>

                <button
                  onClick={() => handlePageNavigation("referral")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === "referral" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  <span>Affiliate Referrals</span>
                </button>

                <button
                  onClick={() => handlePageNavigation("ledger")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === "ledger" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Activity Ledgers</span>
                </button>

                <button
                  onClick={() => handlePageNavigation("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === "profile" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Profile Settings</span>
                </button>
              </nav>
            </div>

            <div className="space-y-4">
              {/* Admin Gate Tab */}
              {user.isAdmin && (
                <button
                  onClick={() => handlePageNavigation("admin")}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-600 text-white rounded-xl text-xs font-mono font-bold"
                >
                  <Lock className="w-4 h-4" />
                  <span>Administrator view</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-gray-950 hover:bg-rose-600 text-rose-450 hover:text-white rounded-xl font-mono text-xs font-bold transition-all border border-gray-850"
              >
                Logout Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
