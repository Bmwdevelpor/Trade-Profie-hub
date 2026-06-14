import React, { useState } from "react";
import { User } from "../types";
import { ShieldCheck, User as UserIcon, Lock, LogOut, CheckCircle, ChevronRight, Key, Smartphone, Mail } from "lucide-react";

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

export default function Profile({ user, onLogout }: ProfileProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Profile fields alteration
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentPassword || !newPassword) {
      setError("Please input both the current and the desired new passwords.");
      return;
    }

    if (newPassword.length < 5) {
      setError("New password must contain at least 5 alphanumeric characters.");
      return;
    }

    setUpdating(true);
    try {
      // Direct POST to express endpoint to modify credentials! Wait, does server.ts expose a password modify endpoint?
      // Ah! We can easily mock this or create a simple server endpoint. Let's think: Can we easily update password directly inside database? Let's check `server.ts` handles.
      // In `server.ts` there is a loadDb() and saveDb(db) layout, we could quickly create a `/api/users/:userId/password` endpoint, or wait, we can implement it as a completely working API call.
      // Let's create `/api/users/:userId/password` on the server later or handle it. Wait, the simplest and cleanest way is to trigger a fetch to `/api/users/${user.id}/password`! Let's write client code to call that, and make sure we add that endpoint in `server.ts` so it works seamlessly!
      const res = await fetch(`/api/users/${user.id}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Password change rejected.");
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to alter password credentials on database.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="profile-view-wrapper">
      {/* User Information Summary Card (5 columns) */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 lg:col-span-5 h-fit space-y-5">
        <div className="flex flex-col items-center text-center pb-4 border-b border-gray-850">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-full flex items-center justify-center text-3xl font-bold font-display shadow-lg relative">
            {user.fullName.charAt(0)}
            <span className={`absolute bottom-0 right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${user.kycStatus === "approved" ? "bg-emerald-500" : "bg-amber-500"}`} />
          </div>
          <h3 className="text-lg font-bold font-display text-white mt-3 leading-none">{user.fullName}</h3>
          <span className="text-xs text-gray-400 font-mono mt-1.5">Username: @{user.username}</span>

          <div className="flex items-center gap-2 mt-3">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
              user.kycStatus === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-gray-800 text-gray-400"
            }`}>
              KYC {user.kycStatus}
            </span>
            {user.isAdmin && (
              <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
                Platform Admin
              </span>
            )}
          </div>
        </div>

        {/* Identity fields list */}
        <div className="space-y-4 font-mono text-xs text-gray-400">
          <div className="flex justify-between border-b border-gray-850 pb-2">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-500" />
              <span>Email:</span>
            </div>
            <span className="text-white text-right break-all max-w-[180px]">{user.email}</span>
          </div>

          <div className="flex justify-between border-b border-gray-850 pb-2">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-gray-500" />
              <span>Secure ID:</span>
            </div>
            <span className="text-white text-right">{user.id}</span>
          </div>

          <div className="flex justify-between border-b border-gray-850 pb-2">
            <div className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-gray-500" />
              <span>Referral invite code:</span>
            </div>
            <span className="text-emerald-400 font-bold uppercase">{user.referralCode}</span>
          </div>

          <div className="flex justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Registered:</span>
            </div>
            <span className="text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action Logout */}
        <div className="pt-4 border-t border-gray-850">
          <button
            onClick={onLogout}
            id="profile-sign-out-btn"
            className="w-full py-2.5 bg-rose-600/15 hover:bg-rose-600 hover:text-white border border-rose-500/25 text-rose-400 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Secure Logout Session</span>
          </button>
        </div>
      </div>

      {/* Security Credentials Editor (7 columns) */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 lg:col-span-7 space-y-4">
        <div className="flex gap-2.5 items-center border-b border-gray-850 pb-3">
          <Lock className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-semibold font-display text-white">Security Credential Locks</h3>
        </div>

        <p className="text-xs text-gray-500 font-mono leading-relaxed">
          Update your platform authentication password periodically. Ensure passwords contain special symbols and upper-case modifiers to maintain maximum balance protocol security.
        </p>

        <form onSubmit={handlePasswordChange} className="space-y-4 pt-1" id="password-alteration-form">
          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded-xl font-mono">{error}</div>}
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl font-mono flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Authentication Password modified successfully on secure vaults!</span>
            </div>
          )}

          <div>
            <label className="text-xs font-mono text-gray-400 block mb-1.5">Current Account Password:</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-mono text-gray-400 block mb-1.5">Desired New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 5 characters"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={updating || !currentPassword || !newPassword}
            id="commit-password-change-btn"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-medium transition-all"
          >
            {updating ? "Modifying database registry..." : "Commit Credentials Update"}
          </button>
        </form>
      </div>
    </div>
  );
}
