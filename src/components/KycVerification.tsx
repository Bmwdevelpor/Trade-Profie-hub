import React, { useState, useRef } from "react";
import { User } from "../types";
import { api } from "../lib/api";
import { ShieldAlert, CheckCircle, Upload, Eye, UserCheck, AlertOctagon, RefreshCw } from "lucide-react";

interface KycVerificationProps {
  user: User;
  onRefreshUser: () => void;
}

export default function KycVerification({ user, onRefreshUser }: KycVerificationProps) {
  const [cnicFront, setCnicFront] = useState<string | null>(null);
  const [cnicBack, setCnicBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Hidden references
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  // Read files and convert to Base64 in standard way
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type: "front" | "back" | "selfie") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError("Maximum file size allowed is 8MB per document.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (type === "front") setCnicFront(base64);
      if (type === "back") setCnicBack(base64);
      if (type === "selfie") setSelfie(base64);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnicFront || !cnicBack || !selfie) {
      setError("Please upload all three required items (CNIC Front, CNIC Back, and a Selfie).");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await api.kyc.submit({
        userId: user.id,
        cnicFront,
        cnicBack,
        selfie,
      });
      setSuccess(true);
      onRefreshUser();
    } catch (err: any) {
      setError(err.message || "Failed to transmit KYC documentation files.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-2xl mx-auto" id="kyc-verification-panel">
      <div className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-6">
        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold font-display text-white">KYC Verification Dashboard</h2>
          <p className="text-xs text-gray-500 font-mono">Verify identity to lift standard withdrawal constraints</p>
        </div>
      </div>

      {/* KYC State APPROVED */}
      {user.kycStatus === "approved" && (
        <div className="space-y-6 text-center py-6" id="kyc-success-overlay">
          <div className="flex justify-center">
            <div className="p-4 bg-emerald-500/15 text-emerald-400 rounded-full border border-emerald-500/20">
              <CheckCircle className="w-14 h-14" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-display text-white">Profile Verified Successfully</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Your CNIC and Portrait Selfie verify logs pass strict identity guidelines. Unlimited daily express withdrawals are unlocked.
            </p>
          </div>

          <div className="max-w-xs mx-auto p-4 bg-gray-950 rounded-xl border border-gray-800 text-left space-y-2 font-mono text-xs text-gray-400">
            <div className="flex justify-between border-b border-gray-900 pb-1.5">
              <span>Verified Account:</span>
              <span className="text-white">{user.fullName}</span>
            </div>
            <div className="flex justify-between border-b border-gray-900 pb-1.5">
              <span>Security Class:</span>
              <span className="text-emerald-400 font-bold uppercase tracking-widest">Grade-1 Clear</span>
            </div>
            <div className="flex justify-between">
              <span>Audit Stamp:</span>
              <span className="text-gray-300">CryptoHub_L3</span>
            </div>
          </div>
        </div>
      )}

      {/* KYC State PENDING */}
      {user.kycStatus === "pending" && (
        <div className="space-y-6 text-center py-8" id="kyc-pending-overlay">
          <div className="flex justify-center">
            <div className="p-4 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 animate-pulse">
              <RefreshCw className="w-12 h-12" />
            </div>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold font-display text-white">Verification Documents Under Audit</h3>
            <p className="text-sm text-gray-400">
              Our support operators are currently reviewing your CNIC cards and Selfie mockup credentials. This verification usually clears within <span className="text-emerald-400 font-semibold font-mono">15 to 45 minutes</span>.
            </p>
            <p className="text-xs text-gray-500 italic mt-2 font-mono">
              Notifications will update dynamically once approved or rejected.
            </p>
          </div>

          <div className="p-4 bg-amber-500/5 text-amber-400/80 p-3.5 border border-amber-500/20 rounded-xl text-left text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Restricted Outflows Status active</span>
            </div>
            <span>Deposits and real copy trade returns accumulate normally while pending, but withdrawal requests will require this profile audit to finalize successfully first.</span>
          </div>
        </div>
      )}

      {/* KYC State NONE or REJECTED */}
      {(user.kycStatus === "none" || user.kycStatus === "rejected") && (
        <form onSubmit={handleSubmit} className="space-y-6" id="kyc-submission-form">
          {user.kycStatus === "rejected" && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-4 flex gap-3 items-start" id="kyc-rejected-alert">
              <AlertOctagon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block font-display">Identity Documents Audit Failed</span>
                <span className="text-xs text-gray-300 mt-1 block font-mono">
                  Reason for rejection: <span className="text-rose-200 font-sans italic">"{user.kycRejectedReason || "Submitted CNIC photos are blurred/illegible"}"</span>
                </span>
                <span className="text-xs text-gray-400 mt-2 block">Please re-capture high-quality, clear photographs and submit again for verification.</span>
              </div>
            </div>
          )}

          <div className="border border-gray-800 bg-gray-950 p-4 rounded-xl text-xs text-gray-400 space-y-1">
            <span className="text-gray-100 font-bold font-display text-sm block mb-1">KYC Filing Guide</span>
            <p>1. Capture high-resolution pictures of your original Computerized National Identity Card (CNIC).</p>
            <p>2. Take a clear close-up Selfie photo holding your CNIC card or a paper containing "Trade Profit Hub" with the date.</p>
            <p>3. Max. upload size limit: 8MB. Compatible file extensions: PNG, JPG, JPEG.</p>
          </div>

          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded-xl font-mono">{error}</div>}
          {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl font-mono">KYC files transmitted successfully. Initializing audit status...</div>}

          {/* Core File Selector Grids */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="kyc-uploads-grid">
            {/* CNIC Front */}
            <div className="bg-gray-950 rounded-xl border border-gray-800 p-4 text-center flex flex-col justify-between h-56">
              <div>
                <span className="text-xs font-bold text-gray-300 block font-display">CNIC Cards - Front</span>
                <span className="text-[10px] text-gray-500 block font-mono mt-0.5">Primary photo page</span>
              </div>

              <div className="my-3 flex justify-center items-center h-24 bg-gray-900 border border-dashed border-gray-800 rounded-xl relative overflow-hidden group">
                {cnicFront ? (
                  <div className="relative w-full h-full">
                    <img src={cnicFront} alt="CNIC Front" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCnicFront(null)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-rose-400 font-bold transition-all"
                    >
                      Remove Card
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => frontInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 text-gray-500 hover:text-emerald-400 transition-all w-full h-full"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-[10px] font-mono">Upload JPEG</span>
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={frontInputRef}
                accept="image/*"
                onChange={(e) => handleFile(e, "front")}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => frontInputRef.current?.click()}
                className="py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-mono font-medium transition-all"
              >
                {cnicFront ? "Replace Image" : "Choose File"}
              </button>
            </div>

            {/* CNIC Back */}
            <div className="bg-gray-950 rounded-xl border border-gray-800 p-4 text-center flex flex-col justify-between h-56">
              <div>
                <span className="text-xs font-bold text-gray-300 block font-display">CNIC Cards - Back</span>
                <span className="text-[10px] text-gray-500 block font-mono mt-0.5">Address & information page</span>
              </div>

              <div className="my-3 flex justify-center items-center h-24 bg-gray-900 border border-dashed border-gray-800 rounded-xl relative overflow-hidden group">
                {cnicBack ? (
                  <div className="relative w-full h-full">
                    <img src={cnicBack} alt="CNIC Back" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCnicBack(null)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-rose-400 font-bold transition-all"
                    >
                      Remove Card
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => backInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 text-gray-500 hover:text-emerald-400 transition-all w-full h-full"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-[10px] font-mono">Upload JPEG</span>
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={backInputRef}
                accept="image/*"
                onChange={(e) => handleFile(e, "back")}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => backInputRef.current?.click()}
                className="py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-mono font-medium transition-all"
              >
                {cnicBack ? "Replace Image" : "Choose File"}
              </button>
            </div>

            {/* Portrait Selfie */}
            <div className="bg-gray-950 rounded-xl border border-gray-800 p-4 text-center flex flex-col justify-between h-56">
              <div>
                <span className="text-xs font-bold text-gray-300 block font-display">ID Holding Selfie</span>
                <span className="text-[10px] text-gray-500 block font-mono mt-0.5">Clearly visible portrait selfie</span>
              </div>

              <div className="my-3 flex justify-center items-center h-24 bg-gray-900 border border-dashed border-gray-800 rounded-xl relative overflow-hidden group">
                {selfie ? (
                  <div className="relative w-full h-full">
                    <img src={selfie} alt="Selfie" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setSelfie(null)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-rose-400 font-bold transition-all"
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => selfieInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 text-gray-500 hover:text-emerald-400 transition-all w-full h-full"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-[10px] font-mono">Upload JPEG</span>
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={selfieInputRef}
                accept="image/*"
                onChange={(e) => handleFile(e, "selfie")}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => selfieInputRef.current?.click()}
                className="py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-mono font-medium transition-all"
              >
                {selfie ? "Replace Photo" : "Choose File"}
              </button>
            </div>
          </div>

          {/* Submit Trigger Actions */}
          <div className="pt-4 border-t border-gray-800">
            <button
              type="submit"
              disabled={submitting || !cnicFront || !cnicBack || !selfie}
              id="submit-kyc-btn"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-display font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Uploading documents base64 data...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Transmit Documents and file verification review</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
