import React, { useState } from "react";
import { User } from "../types";
import { 
  ShieldCheck, 
  User as UserIcon, 
  Lock, 
  LogOut, 
  CheckCircle, 
  ChevronRight, 
  Key, 
  Smartphone, 
  Mail, 
  HelpCircle, 
  Shield, 
  FileText, 
  AlertTriangle, 
  Info, 
  ArrowLeft, 
  Send,
  ExternalLink,
  Clock,
  Check,
  Server,
  TrendingUp,
  Cpu,
  CornerDownRight
} from "lucide-react";

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

export default function Profile({ user, onLogout }: ProfileProps) {
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Active full-screen sub-section selected
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // FAQ Page states
  const [faqCategory, setFaqCategory] = useState<string>("all");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Report Issue Form states
  const [reportCategory, setReportCategory] = useState<string>("deposit");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSeverity, setReportSeverity] = useState<string>("low");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState<{
    id: string;
    timestamp: string;
    status: string;
    category: string;
    severity: string;
    description: string;
  } | null>(null);

  // Terms and Conditions checkbox acknowledgment
  const [termsAcknowledged, setTermsAcknowledged] = useState(false);

  // Active Hotline message display
  const [hotlineMessage, setHotlineMessage] = useState<string | null>(null);

  // Handler for password modifier
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

  // Submit Issue Ticket click
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reportDescription.trim().length < 15) {
      return;
    }

    setIsSubmittingReport(true);
    setTimeout(() => {
      setTicketSubmitted({
        id: `TPH-TICKET-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toLocaleString(),
        status: "ACTIVE_DISPATCHED",
        category: reportCategory,
        severity: reportSeverity,
        description: reportDescription,
      });
      setIsSubmittingReport(false);
    }, 900);
  };

  // List of documentation sections clickable
  const supportMenuItems = [
    { 
      id: "faq", 
      title: "FAQ", 
      subtitle: "Common answers, fees, and processing speeds", 
      icon: HelpCircle, 
      color: "text-amber-400 bg-amber-500/10 border-amber-500/15" 
    },
    { 
      id: "privacy", 
      title: "Privacy Policy", 
      subtitle: "How account data is encrypted & secured", 
      icon: Shield, 
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/15" 
    },
    { 
      id: "terms", 
      title: "Terms & Conditions", 
      subtitle: "Active contract user regulations & risks", 
      icon: FileText, 
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/15" 
    },
    { 
      id: "contact", 
      title: "Contact Us", 
      subtitle: "Secure Live Desk channels & Telegram bots", 
      icon: Mail, 
      color: "text-blue-400 bg-blue-500/10 border-blue-500/15" 
    },
    { 
      id: "report", 
      title: "Report Issue", 
      subtitle: "Lodge an instant verification support ticket", 
      icon: AlertTriangle, 
      color: "text-rose-400 bg-rose-500/10 border-rose-500/15" 
    },
    { 
      id: "about", 
      title: "About Us", 
      subtitle: "Learn about the quantitative copy engine", 
      icon: Info, 
      color: "text-purple-400 bg-purple-500/10 border-purple-500/15" 
    },
  ];

  // Helper section title mapper
  const getSectionTitle = (id: string) => {
    switch (id) {
      case "faq": return "Frequently Asked Questions";
      case "privacy": return "Cryptographic Privacy Charter";
      case "terms": return "Terms & Client Compliance Rules";
      case "contact": return "Corporate Help Desk & Support Network";
      case "report": return "Secure Operational Support Ticket Engine";
      case "about": return "The Trade Profit Hub Collective";
      default: return "System Document";
    }
  };

  /* ==========================================
     SUB-PAGES CONTENT RENDERERS
     ========================================== */

  // rendering FAQ
  const renderFaq = () => {
    const faqs = [
      {
        q: "What is Trade Profit Hub copy trading?",
        a: "Trade Profit Hub copy trading is a high-speed replication framework. When your matched professional master-trader enters, exits, or structures an order inside automated crypto indexes, our backend mirrors that exact event on your unified account wallet balance inside milliseconds.",
        category: "trading"
      },
      {
        q: "Are there any hidden fees or monthly charges?",
        a: "None. We operate on a pure capital-alignment standard. Trade Profit Hub does not charge user setup fees, recurring monthly bills, or access fees. We only partition a customized percentage of successfully logged profit payouts to maintain development infrastructure and fund master-trader commission logs.",
        category: "fees"
      },
      {
        q: "How long do deposit and withdrawal processes take?",
        a: "USDT deposit instructions require 3 secure network confirmations (typically taking 5-15 mins). Withdrawal payout transactions undergo deep audit compliance checks to counter malicious wash logs. Audits are finalized and dispatched to user blockchain wallets in 1 to 12 hours.",
        category: "processing"
      },
      {
        q: "Can I stop replication or detach from a trader at any point?",
        a: "Absolutely. Absolute capital control resides with you. You can click 'Stop Copy-Trading' inside the dashboard trading board at any moment to cancel replicating current index fluctuations and free up locked balances.",
        category: "trading"
      },
      {
        q: "What is the referral program, and how are earnings calculated?",
        a: "Each registered trader receives a unique alphanumeric tracking code. When new clients register with your code, you will earn a 10% commission on any approved deposits they make, credited instantly to your primary balance.",
        category: "fees"
      },
      {
        q: "What security measures protect my wallet and identity keys?",
        a: "We persist profiles globally under military-grade SHA-256 protocols. Communication is entirely encrypted and isolated, and no client database is stored on unencrypted external shared networks. Identity images collected are stored only inside offline compliance environments.",
        category: "security"
      }
    ];

    const categories = [
      { id: "all", name: "All Topics" },
      { id: "trading", name: "Trading Mechanism" },
      { id: "fees", name: "Commissions & Fees" },
      { id: "processing", name: "Deposit & Withdrawal" },
      { id: "security", name: "Security & Vaults" }
    ];

    const filteredFaqs = faqCategory === "all" ? faqs : faqs.filter(f => f.category === faqCategory);

    return (
      <div className="space-y-6" id="faq-view-document">
        <p className="text-xs text-gray-400 font-mono leading-relaxed">
          Select a category filter below to review structured answers regarding our system algorithms, fee allocations, and compliance parameters.
        </p>

        {/* Categories togglers */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setFaqCategory(cat.id);
                setExpandedFaq(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-medium transition-all ${
                faqCategory === cat.id 
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" 
                  : "bg-gray-950 border border-gray-850 text-gray-500 hover:text-gray-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* FAQs list */}
        <div className="space-y-3.5">
          {filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div 
                key={idx} 
                onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                className="bg-gray-950 border border-gray-850 hover:border-emerald-500/25 rounded-2xl p-4 cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-3 text-sm font-semibold">
                  <span className="text-white font-sans text-xs sm:text-sm">{faq.q}</span>
                  <span className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-lg ${
                    faq.category === "security" ? "bg-cyan-500/10 text-cyan-400" :
                    faq.category === "fees" ? "bg-indigo-500/10 text-indigo-400" :
                    faq.category === "processing" ? "bg-amber-500/10 text-amber-500" : "bg-purple-500/10 text-purple-400"
                  }`}>
                    {faq.category}
                  </span>
                </div>
                {isExpanded && (
                  <div className="pt-2 border-t border-gray-850 text-xs text-gray-400 font-sans leading-relaxed animate-fadeIn">
                    {faq.a}
                  </div>
                )}
                {!isExpanded && (
                  <div className="text-[10px] text-emerald-400/80 font-mono flex items-center gap-1 mt-1 justify-end">
                    <span>Click to reveal solution</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // rendering Privacy Policy
  const renderPrivacy = () => {
    return (
      <div className="space-y-6 font-sans text-xs sm:text-sm text-gray-350 leading-relaxed" id="privacy-charter-document">
        <div className="bg-gray-950 border border-gray-850 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
            <Shield className="w-4 h-4" />
            <span>CRYPTOGRAPHIC SECURITY POLICY (SHA-256)</span>
          </div>
          <p className="text-xs text-gray-400 font-mono leading-relaxed">
            Trade Profit Hub implements isolated decentralized ledger databases. Personal authorization records are mapped under custom key pairs, fully decoupling identity structures from active portfolio monitoring arrays.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-white font-semibold font-display text-xs sm:text-sm border-l-2 border-emerald-500 pl-2">1. DATA HARVEST EXCLUSIONS</h4>
          <p className="pl-2">
            The collective platform does not collect, sell, or disclose individual trading statistics, IP location metrics, or transaction history details to tertiary aggregators. Your activity records belong exclusively to your synchronized profile, secured via persistent server-side token locks.
          </p>

          <h4 className="text-white font-semibold font-display text-xs sm:text-sm border-l-2 border-emerald-500 pl-2">2. SECURE COMPLIANCE STORAGE</h4>
          <p className="pl-2">
            National identity proof files collected during compliance audits are cached on offline network nodes. No personnel hold unchecked access keys to compliance folders except verified senior compliance officers.
          </p>

          <h4 className="text-white font-semibold font-display text-xs sm:text-sm border-l-2 border-emerald-500 pl-2">3. COOKIE-FREE ENCRYPTED CHUTING</h4>
          <p className="pl-2">
            Active navigation state authentication relies strictly on authorization headers and cryptographic security tokens. No telemetry scripts track your external terminal actions.
          </p>
        </div>

        <div className="p-4 bg-gray-950 border border-gray-850 rounded-2xl flex items-center gap-3.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-white">GDPR Compliant Architecture</div>
            <div className="text-[10px] text-gray-550 font-mono leading-none mt-1">Status: Operational & Secured under TLS 1.3 protocol suite</div>
          </div>
        </div>
      </div>
    );
  };

  // rendering Terms & Conditions
  const renderTerms = () => {
    return (
      <div className="space-y-6 text-xs sm:text-sm text-gray-350 leading-relaxed" id="terms-view-document">
        <p className="text-xs text-gray-400 font-mono">
          Please review the following framework agreements. By activating replication features inside the terminal, you acknowledge these conditions.
        </p>

        <div className="max-h-[220px] overflow-y-auto bg-gray-950 border border-gray-850 rounded-2xl p-4 space-y-4 font-sans text-[11px] leading-relaxed custom-scrollbar">
          <div className="space-y-1.5">
            <h5 className="font-bold text-white uppercase tracking-wider font-mono text-[10px] text-emerald-400">Section A: Dynamic Capital Market Fluctuations</h5>
            <p className="text-gray-400">
              User accepts that cryptocurrency investment is fundamentally highly volatile. No minimum static earnings quotas can be guaranteed by algorithmic models or human index strategy providers.
            </p>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-bold text-white uppercase tracking-wider font-mono text-[10px] text-emerald-400">Section B: Performance Success Commission</h5>
            <p className="text-gray-400">
              When a transaction matches an active profit history, Trade Profit Hub automatically transfers up to 10% of generated earnings to the master-trader ledger. These commissions incentivize masters to maintain consistent index returns.
            </p>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-bold text-white uppercase tracking-wider font-mono text-[10px] text-emerald-400">Section C: Anti-Sybil Referral Mandate</h5>
            <p className="text-gray-400">
              Exploiter profiles creating multiple accounts to farm refer bonus allocations will have their general wallets locked. Assets will be held under compliance custody permanently.
            </p>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-bold text-white uppercase tracking-wider font-mono text-[10px] text-emerald-400">Section D: Platform Force Majeure</h5>
            <p className="text-gray-400">
              We bear no liability for temporary blockchain network synchronization lags, external exchange API freezes, or other global digital anomalies beyond the central database engine scope.
            </p>
          </div>
        </div>

        {/* Checkbox activation */}
        <div className="bg-gray-950 border border-gray-850 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={termsAcknowledged}
                onChange={() => setTermsAcknowledged(!termsAcknowledged)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center ${
                termsAcknowledged 
                  ? "bg-emerald-500 border-emerald-500 text-white" 
                  : "bg-gray-950 border-gray-800"
              }`}>
                {termsAcknowledged && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
            <div>
              <span className="text-xs text-white font-medium block">Confirm Charter Acknowledgement</span>
              <span className="text-[10px] text-gray-500 block leading-none mt-1">Required to lock strategy agreements and trade copy actions.</span>
            </div>
          </label>

          <div className="bg-gray-900 border border-gray-850 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">USER STATUS</span>
            <span className={`text-[11px] font-mono block font-bold mt-0.5 ${termsAcknowledged ? "text-emerald-400" : "text-amber-500"}`}>
              {termsAcknowledged ? "CHARTER_CONFIRMED" : "PENDING_CONFIRMATION"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // rendering Contact Us
  const renderContact = () => {
    const contacts = [
      {
        channel: "Live Compliance Email Desk",
        value: "dispatch@tradeprofithub.com",
        action: "mailto:dispatch@tradeprofithub.com",
        desc: "Immediate compliance authorization issues, audit details, and priority customer care.",
        btnText: "E-mail Help Desk"
      },
      {
        channel: "WhatsApp verification hotline",
        value: "+1 (888) 555-USDT",
        action: "#",
        desc: "Fast-line verification support for high volume active copy trades.",
        btnText: "Open Chat Line"
      },
      {
        channel: "Live Telegram Service Bot",
        value: "@TradeProfitHubSupport",
        action: "https://t.me",
        desc: "Interactive status updates, trade logs dispatch, and automatic system metrics.",
        btnText: "Telegram Bot Channel"
      }
    ];

    return (
      <div className="space-y-6 animate-fadeIn" id="contact-view-document">
        <p className="text-xs text-gray-400 font-mono">
          Connect with our active dispatch teams via encrypted communication protocols. Available 24 hours a day, 7 days/week.
        </p>

        {hotlineMessage && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-mono flex items-center justify-between" id="hotline-msg-banner">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span>{hotlineMessage}</span>
            </div>
            <button 
              onClick={() => setHotlineMessage(null)}
              className="text-[10px] text-gray-400 hover:text-white px-2 py-0.5 bg-gray-950 border border-gray-800 rounded-lg"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Contact list blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contacts.map((c, idx) => (
            <div key={idx} className="bg-gray-950 border border-gray-850 rounded-2xl p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold block">{c.channel}</span>
                <div className="text-white font-mono text-xs sm:text-sm font-semibold truncate select-all">{c.value}</div>
                <p className="text-xs text-gray-500 leading-relaxed font-sans">{c.desc}</p>
              </div>

              <a 
                href={c.action} 
                onClick={(e) => {
                  if (c.action === "#") {
                    e.preventDefault();
                    setHotlineMessage("Hotline contact verified: +1 (888) 555-USDT (compliance verification)");
                  }
                }}
                className="w-full py-2 bg-gray-900 border border-gray-800 hover:border-emerald-500/20 text-gray-300 hover:text-white rounded-xl text-xs font-mono text-center block transition-all"
              >
                {c.btnText}
              </a>
            </div>
          ))}
        </div>

        {/* Timing banner */}
        <div className="p-4 bg-gray-950 border border-gray-850 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-xs font-mono font-bold text-white block">Continuous dispatch protocols</span>
              <span className="text-[10px] text-gray-550 block">Our support infrastructure features automated redundancy ensuring zero offline frames.</span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg uppercase tracking-wider font-bold">
            24/7/365 ONLINE
          </span>
        </div>
      </div>
    );
  };

  // rendering Report Issue
  const renderReport = () => {
    if (ticketSubmitted) {
      return (
        <div className="bg-gray-900 border border-gray-850 rounded-2xl p-5 sm:p-6 space-y-5 animate-fadeIn" id="submitted-issue-ticket-card">
          <div className="flex flex-col sm:flex-row items-center gap-3 pb-4 border-b border-gray-850">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">TICKET REGISTERED IN SECURE REGISTRY</div>
              <h4 className="text-base font-bold text-white mt-0.5">{ticketSubmitted.id}</h4>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 font-mono text-[11px] text-gray-400 pb-4 border-b border-gray-850">
            <div className="bg-gray-950 border border-gray-850 p-2.5 rounded-xl">
              <span className="text-gray-550 block uppercase text-[9px] tracking-wide">Category</span>
              <span className="text-white font-bold block uppercase">{ticketSubmitted.category}</span>
            </div>
            <div className="bg-gray-950 border border-gray-850 p-2.5 rounded-xl">
              <span className="text-gray-550 block uppercase text-[9px] tracking-wide">Severity Profile</span>
              <span className={`font-bold block uppercase ${
                ticketSubmitted.severity === "high" || ticketSubmitted.severity === "critical" ? "text-rose-400" : "text-emerald-400"
              }`}>{ticketSubmitted.severity}</span>
            </div>
            <div className="bg-gray-950 border border-gray-850 p-2.5 rounded-xl">
              <span className="text-gray-550 block uppercase text-[9px] tracking-wide">Operational Status</span>
              <span className="text-white block font-bold uppercase font-mono">{ticketSubmitted.status}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] text-gray-550 uppercase tracking-wider font-mono block">CLIENT ISSUE TRANSCRIPT</span>
            <div className="bg-gray-950 border border-gray-850 p-3 rounded-xl font-mono text-xs text-white leading-relaxed whitespace-pre-wrap">
              {ticketSubmitted.description}
            </div>
          </div>

          <p className="text-[10px] text-gray-500 leading-normal font-sans">
            Our priority dispatch engine has assigned this transmission to duty compliant specialists. Response feeds will automatically dispatch to your inbox (<span className="text-gray-400 select-all font-mono">{user.email}</span>) within 45 minutes.
          </p>

          <button
            onClick={() => {
              setTicketSubmitted(null);
              setReportDescription("");
            }}
            className="w-full py-2 bg-gray-950 hover:bg-gray-800 border border-gray-800 text-gray-300 rounded-xl text-xs font-mono transition-all"
          >
            Create Another Complaint Ticket
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={handleReportSubmit} className="space-y-4" id="support-complaint-submission-form">
        <p className="text-xs text-gray-400 font-mono leading-relaxed">
          Need tech support or noticed a system anomaly? Complete the client complaint fields below. Our core dispatch will address it promptly.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="text-xs font-mono text-gray-400 block mb-1.5">Issue Category:</label>
            <select
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
            >
              <option value="deposit">Deposit Delay Verification</option>
              <option value="withdrawal">Withdrawal Status / Retransmission</option>
              <option value="copytrade">Copytrade Index Replication delay</option>
              <option value="kyc">KYC verification delay</option>
              <option value="security">Secondary password credentials</option>
              <option value="other">General Interface Bug / Suggestion</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="text-xs font-mono text-gray-400 block mb-1.5">Severity Level:</label>
            <select
              value={reportSeverity}
              onChange={(e) => setReportSeverity(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
            >
              <option value="low">Low - General query or minor display issue</option>
              <option value="medium">Medium - Delay in deposit confirmations</option>
              <option value="high">High - Copy replication mismatch</option>
              <option value="critical">Critical - Complete balance mismatch</option>
            </select>
          </div>
        </div>

        {/* pre-filled email */}
        <div>
          <label className="text-xs font-mono text-gray-400 block mb-1.5">Pre-filled Customer Email Correspondence:</label>
          <input
            type="text"
            value={user.email}
            disabled
            className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-gray-500 font-mono outline-none"
          />
        </div>

        {/* Text Description */}
        <div>
          <label className="text-xs font-mono text-gray-400 block mb-1.5">Detailed Issue Description (Compulsory - Min 15 chars):</label>
          <textarea
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            placeholder="Please write the exact details of the transaction hash or layout issue so our technical auditors can isolate the database errors immediately."
            rows={4}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white font-sans focus:border-emerald-500 focus:outline-none leading-relaxed"
            required
          />
          {reportDescription.length > 0 && reportDescription.length < 15 && (
            <span className="text-[10px] font-mono text-rose-500 block mt-1">
              Need {15 - reportDescription.length} more characters to qualify for Dispatch validation.
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmittingReport || reportDescription.trim().length < 15}
          className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-950/20 disabled:text-rose-500/40 text-white rounded-xl text-xs font-mono font-medium transition-all flex items-center justify-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmittingReport ? "Registering secure ledger Ticket..." : "File Dispatch Complaint Ticket"}</span>
        </button>
      </form>
    );
  };

  // rendering About Us page
  const renderAbout = () => {
    const stats = [
      { name: "Active Pools", value: "4 Configurations", icon: Server },
      { name: "Execution Speed", value: "<85 ms", icon: Cpu },
      { name: "Connected Feeders", value: "12 quantitative feeds", icon: TrendingUp }
    ];

    return (
      <div className="space-y-6 animate-fadeIn" id="about-view-document">
        <p className="text-xs text-gray-400 font-mono leading-relaxed">
          Trade Profit Hub acts as a quantitative copy trading aggregate platform developed and operated by deep crypto arbitrage engineers. 
        </p>

        {/* Core items list */}
        <div className="bg-gray-950 border border-gray-850 rounded-2xl p-4 space-y-4 font-sans text-xs sm:text-sm text-gray-350 leading-relaxed">
          <div className="space-y-1">
            <h5 className="font-semibold text-white flex items-center gap-1.5 font-display text-xs sm:text-sm">
              <CornerDownRight className="w-4 h-4 text-emerald-400" />
              <span>Verified Portfolio Histories</span>
            </h5>
            <p className="pl-5 text-xs text-gray-400">
              Unlike alternative traditional models, each transaction provider is rigorously validated across multiple market cycles prior of becoming active for replication.
            </p>
          </div>

          <div className="space-y-1">
            <h5 className="font-semibold text-white flex items-center gap-1.5 font-display text-xs sm:text-sm">
              <CornerDownRight className="w-4 h-4 text-emerald-400" />
              <span>Full User Custody Protection</span>
            </h5>
            <p className="pl-5 text-xs text-gray-400">
              Your assets never leave our unified multi-wallet engine. Copy trades trigger accounting synchronization changes locally on our databases without exposing client private keys to external exchanges.
            </p>
          </div>
        </div>

        {/* Metrics info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((s, idx) => {
            const IconComp = s.icon;
            return (
              <div key={idx} className="bg-gray-950 border border-gray-850 rounded-2xl p-4 flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-xl">
                  <IconComp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-550 block font-mono uppercase">{s.name}</span>
                  <span className="text-xs font-mono font-bold text-white mt-0.5">{s.value}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-gray-950 border border-gray-850 rounded-2xl font-mono text-[10px] text-gray-500 space-y-1">
          <div>Trade Profit Hub Group Licensing Agreement ID: SFM-1982-A</div>
          <div>Development Frame Target: Enterprise Cloud Container (Run)</div>
        </div>
      </div>
    );
  };

  /* ==========================================
     CORE PAGE LAYOUT CONDITIONAL SWITCH
     ========================================== */

  if (selectedSection) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn" id="full-screen-profile-doc">
        {/* Header with return elements */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-gray-850 gap-4">
          <button
            onClick={() => {
              setSelectedSection(null);
              // Clean forms if returning
              setReportDescription("");
              setTicketSubmitted(null);
            }}
            id="back-to-profile-list"
            className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white hover:border-emerald-500 bg-gray-950 border border-gray-850 px-3.5 py-1.5 rounded-xl w-fit transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Return to Profile</span>
          </button>
          
          <div className="sm:text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">Security Documents Ledger</span>
            <h2 className="text-lg sm:text-xl font-bold font-display text-white mt-0.5">{getSectionTitle(selectedSection)}</h2>
          </div>
        </div>

        {/* Nested view parser */}
        <div className="pt-2">
          {selectedSection === "faq" && renderFaq()}
          {selectedSection === "privacy" && renderPrivacy()}
          {selectedSection === "terms" && renderTerms()}
          {selectedSection === "contact" && renderContact()}
          {selectedSection === "report" && renderReport()}
          {selectedSection === "about" && renderAbout()}
        </div>
      </div>
    );
  }

  // DEFAULT PROFILE SCREEN VIEW
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn" id="profile-view-wrapper">
      
      {/* LEFT COLUMN: User Summary (5 columns) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* User Information Summary Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
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

      </div>

      {/* RIGHT COLUMN: Options & Security (7 columns) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Clickable list of system support document cards */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex gap-2.5 items-center border-b border-gray-850 pb-3">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold font-display text-white">Security & Support Center</h3>
          </div>
          
          <p className="text-xs text-gray-500 font-mono leading-relaxed">
            Click any section indicator below to access our live document charters, contact regulatory specialists, or submit system failure tickets.
          </p>

          <div className="grid grid-cols-1 gap-2.5 pt-1">
            {supportMenuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedSection(item.id)}
                  id={`btn-open-doc-${item.id}`}
                  className="w-full bg-gray-950 border border-gray-850 hover:border-emerald-500/25 p-3 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer hover:bg-gray-900 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-lg border flex-shrink-0 ${item.color}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block group-hover:text-emerald-400 transition-colors">{item.title}</span>
                      <span className="text-[10px] text-gray-400 font-mono block truncate mt-0.5">{item.subtitle}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors flex-shrink-0 ml-2" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Security Credentials Editor */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
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
    </div>
  );
}
