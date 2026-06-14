import React, { useState, useEffect, useRef } from "react";
import { User, Deposit } from "../types";
import { api } from "../lib/api";
import { Copy, QrCode, Upload, ArrowDownCircle, Check, HelpCircle, History, Clock } from "lucide-react";

interface DepositSystemProps {
  user: User;
  onRefreshUser: () => void;
}

export default function DepositSystem({ user, onRefreshUser }: DepositSystemProps) {
  const [amount, setAmount] = useState("");
  const [txid, setTxid] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [history, setHistory] = useState<Deposit[]>([]);
  const [copied, setCopied] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalInputRef = useRef<HTMLInputElement>(null);

  const walletAddress = "TDvrj5yXXpdAje1bfcEvuKMWZ5UG5TrFuF";

  useEffect(() => {
    onRefreshUser();
    fetchDepositHistory();

    // Poll for real-time user balance and deposit status synchronization
    const interval = setInterval(() => {
      onRefreshUser();
      fetchDepositHistory();
    }, 4000);

    return () => clearInterval(interval);
  }, [user.id]);

  const fetchDepositHistory = async () => {
    try {
      setLoadingHistory(true);
      const rawDeposits = await api.deposit.list(user.id);
      
      // Sort newest deposits first
      const sortedDeposits = [...rawDeposits].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setHistory(sortedDeposits);
    } catch (e) {
      console.error("Could not load deposit history", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 300) {
      setError("Minimum deposit amount is 300 USDT.");
      return;
    }

    if (!txid.trim()) {
      setError("Please enter the unique blockchain transaction hash (TXID).");
      return;
    }

    setSubmitting(true);
    try {
      await api.deposit.request({
        userId: user.id,
        amount: parsedAmount,
        txid: txid.trim(),
        screenshot: screenshot || undefined,
      });

      setSuccess(true);
      setAmount("");
      setTxid("");
      setScreenshot(null);
      onRefreshUser();
      await fetchDepositHistory();

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || "Could not submit deposit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="deposit-system-wrapper">
      {/* Informational & Form Grid (7 columns) */}
      <div className="space-y-6 lg:col-span-7">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex gap-3 border-b border-gray-800 pb-4">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">Deposit USDT TRC20</h2>
              <p className="text-xs text-gray-500 font-mono">Immediate automated accounting audit checks</p>
            </div>
          </div>

          {/* Crypto info badges */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-800 font-mono text-xs">
              <span className="text-gray-500 block">Accepted Token:</span>
              <span className="text-white font-bold text-sm">USDT (Tether)</span>
            </div>
            <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-800 font-mono text-xs">
              <span className="text-gray-500 block">Protocol Network:</span>
              <span className="text-emerald-400 font-bold text-sm">TRON (TRC20)</span>
            </div>
          </div>

          {/* Core Wallet Address Display */}
          <div className="bg-gray-950 rounded-xl p-4 border border-gray-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-gray-400">
              <span>Depositor destination wallet:</span>
              <span className="text-[10px] bg-emerald-600/15 text-emerald-400 border border-emerald-500/10 px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">
                No Gas fees
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <span className="font-mono text-sm sm:text-base font-bold text-emerald-400 select-all break-all bg-gray-900 px-3 py-2 rounded-lg border border-gray-800/60 grow">
                {walletAddress}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                id="deposit-copy-address-btn"
                className="py-2 px-4 bg-emerald-600 font-bold hover:bg-emerald-500 text-white font-display text-xs rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Address"}</span>
              </button>
            </div>
          </div>

          {/* Warning notes */}
          <div className="bg-amber-500/5 text-amber-400 p-4 border border-amber-500/20 rounded-xl font-mono text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Clock className="w-4 h-4" />
              <span>Filing Guidelines:</span>
            </div>
            <p className="text-gray-300">
              Transfer funds ONLY using the TRON (TRC20) protocol. Transferring via other networks (e.g., ERC20, BSC) will result in irreversible asset loss. Ensure your TXID matches exactly before filing the confirmation.
            </p>
          </div>
        </div>

        {/* Deposit request Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-base font-semibold font-display text-white mb-4">Deposit Proof Submission Form</h3>

          <form onSubmit={handleDepositSubmit} className="space-y-4" id="deposit-request-submission-form">
            {error && <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded-xl font-mono">{error}</div>}
            {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl font-mono">Deposit request filed successfully! Waiting for administrative verification review.</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1.5">USDT Deposit Amount:</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount (Min: $300)"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-gray-500 font-mono font-bold">USDT</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1.5">Transmission Hash (TXID):</label>
                <input
                  type="text"
                  value={txid}
                  onChange={(e) => setTxid(e.target.value)}
                  placeholder="Paste blockchain TXID"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Live Bonus Estimator Table */}
            {parseFloat(amount) > 0 && (
              <div className="p-4 bg-gray-950 border border-emerald-500/10 rounded-xl space-y-2 text-xs font-mono animate-fade-in" id="deposit-bonus-estimator">
                <div className="flex justify-between text-gray-400">
                  <span>Transfer Amount:</span>
                  <span className="text-white font-semibold">{parseFloat(amount).toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between text-gray-400 flex-row items-center gap-1">
                  <span>10% Welcome Promo Bonus:</span>
                  <span className="text-emerald-400 font-bold">
                    +{Number(parseFloat(amount) * 0.10).toFixed(2)} USDT
                  </span>
                </div>
                <div className="border-t border-gray-800/80 my-1 pt-2 flex justify-between text-white font-bold text-sm">
                  <span>Total Amount to Receive:</span>
                  <span className="text-emerald-400 font-extrabold text-base">
                    {Number(parseFloat(amount) + parseFloat(amount) * 0.10).toFixed(2)} USDT
                  </span>
                </div>
              </div>
            )}

            {/* Receipt upload screenshot */}
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1.5">Screenshot proof of transfer (Optional):</label>
              <div
                className="my-3 flex flex-col items-center justify-center p-6 bg-gray-950 border border-dashed border-gray-800 rounded-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all cursor-pointer"
                onClick={() => finalInputRef.current?.click()}
                id="deposit-receipt-dropzone"
              >
                {screenshot ? (
                  <div className="space-y-2 text-center">
                    <img src={screenshot} alt="Payment Receipt" className="max-h-24 mx-auto rounded-lg object-contain border border-gray-800" />
                    <span className="text-[10px] text-emerald-400 font-mono block font-bold">Screenshot Saved Successfully</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-600 group-hover:text-emerald-400 transition-all mb-2" />
                    <span className="text-xs text-gray-300 font-bold font-display">Click to upload transfer screenshot</span>
                    <span className="text-[10px] text-gray-500 font-mono mt-1">Accepts proof file types (PNG, JPEG, PNG)</span>
                  </>
                )}
                <input
                  type="file"
                  ref={finalInputRef}
                  accept="image/*"
                  onChange={handleScreenshot}
                  className="hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !amount || !txid}
              id="confirm-deposit-btn"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-display font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-50"
            >
              {submitting ? "Uploading confirmation records..." : "Submit USDT Deposit Claim"}
            </button>
          </form>
        </div>
      </div>

      {/* QR Code and Deposit History list (5 columns) */}
      <div className="space-y-6 lg:col-span-5">
        {/* QR Code section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center space-y-4">
          <div className="flex justify-center items-center gap-2 text-gray-200">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold font-display uppercase tracking-wider">Quick Wallet barcode Scan</h3>
          </div>

          <p className="text-xs text-gray-400 font-mono max-w-xs mx-auto">
            Scan using binance, OKX, Trust Wallet or any other TRC20 compatible web3 wallet
          </p>

          <div className="inline-block p-4 bg-white rounded-2xl border border-gray-800 shadow-xl shadow-black/80">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(walletAddress)}&color=050b14&bgcolor=ffffff`}
              alt="TRC20 Wallet Barcode"
              className="w-44 h-44 object-contain"
            />
          </div>

          <div className="pt-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-widest">Selected Channel</span>
            <span className="text-xs font-mono font-bold text-gray-300">USDT TRC20 Fast Link</span>
          </div>
        </div>

        {/* Deposit status records */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-200 mb-4 border-b border-gray-800 pb-3">
              <History className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold font-display">Deposit Request Index</h3>
            </div>

            <div className="space-y-3">
              {loadingHistory ? (
                <div className="text-center py-6">
                  <span className="text-xs text-gray-500 font-mono animate-pulse">Loading deposit index...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-800 rounded-xl">
                  <span className="text-xs text-gray-500 font-mono">No deposit requests recorded.</span>
                </div>
              ) : (
                history.map((dep) => {
                  const displayBonus = dep.bonus ?? (dep.amount * 0.10);
                  const displayTotal = dep.amount + displayBonus;
                  return (
                    <div key={dep.id} className="bg-gray-950 p-3.5 rounded-xl border border-gray-800 space-y-2.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-white font-bold">${dep.amount.toFixed(2)} USDT</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          dep.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                          dep.status === "pending" ? "bg-amber-500/10 text-amber-500" :
                          "bg-rose-500/10 text-rose-400"
                        }`}>
                          {dep.status}
                        </span>
                      </div>

                      <div className="font-mono text-[9px] text-gray-500 space-y-1 border-t border-gray-900 pt-2">
                        <div className="flex justify-between">
                          <span>Deposit Sum:</span>
                          <span className="text-gray-300 font-semibold">${dep.amount.toFixed(2)} USDT</span>
                        </div>
                        {dep.status !== "rejected" && (
                          <div className="flex justify-between font-mono">
                            <span>10% Welcome Bonus:</span>
                            <span className="text-emerald-400 font-medium font-mono">
                              {dep.status === "approved" ? `+$${displayBonus.toFixed(2)}` : `+$${(dep.amount * 0.10).toFixed(2)} (Pending)`} USDT
                            </span>
                          </div>
                        )}
                        {dep.status === "approved" && (
                          <div className="flex justify-between text-white font-semibold bg-gray-900/65 p-1 px-1.5 rounded font-mono">
                            <span>Total Credited:</span>
                            <span className="text-emerald-400 font-bold">${displayTotal.toFixed(2)} USDT</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-1 font-mono">
                          <span>TXID Reference:</span>
                          <span className="text-gray-300 text-right truncate max-w-[150px]">{dep.txid}</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span>Created At:</span>
                          <span className="text-gray-400">{new Date(dep.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
