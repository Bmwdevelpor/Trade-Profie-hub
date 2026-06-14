import { useState, useMemo } from "react";
import { Transaction } from "../types";
import { ArrowDownLeft, ArrowUpRight, Search, FileText, ChevronDown, Award, TrendingUp } from "lucide-react";

interface TransactionsProps {
  transactions: Transaction[];
  loading: boolean;
}

type FilterType = "all" | "deposit" | "withdrawal" | "profit" | "commission";

export default function Transactions({ transactions, loading }: TransactionsProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      // Search match
      const searchLower = search.toLowerCase();
      const matchesSearch =
        tx.description.toLowerCase().includes(searchLower) ||
        tx.id.toLowerCase().includes(searchLower) ||
        tx.amount.toString().includes(searchLower);

      if (!matchesSearch) return false;

      // Filter type matches
      if (filter === "all") return true;
      if (filter === "deposit") return tx.type === "deposit";
      if (filter === "withdrawal") return tx.type === "withdrawal";
      if (filter === "profit") return tx.type === "copy_trade_profit";
      if (filter === "commission") return tx.type === "referral_bonus";

      return true;
    });
  }, [transactions, filter, search]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6" id="transactions-ledger-panel">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/60 pb-5">
        <div>
          <h2 className="text-lg font-bold font-display text-white">Security Ledger & Transactions</h2>
          <p className="text-xs text-gray-500 font-mono mt-0.5">Chronological record of wallet credits and trade deductions</p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search amount, TXID, or action..."
            className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-850 pb-4" id="transactions-filter-tabs">
        <button
          onClick={() => setFilter("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all font-medium ${
            filter === "all" ? "bg-emerald-600 text-white" : "bg-gray-950/60 text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700"
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setFilter("deposit")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all font-medium ${
            filter === "deposit" ? "bg-emerald-600 text-white" : "bg-gray-950/60 text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700"
          }`}
        >
          USDT Deposits
        </button>
        <button
          onClick={() => setFilter("withdrawal")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all font-medium ${
            filter === "withdrawal" ? "bg-emerald-600 text-white" : "bg-gray-950/60 text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700"
          }`}
        >
          Withdrawals
        </button>
        <button
          onClick={() => setFilter("profit")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all font-medium ${
            filter === "profit" ? "bg-emerald-600 text-white" : "bg-gray-950/60 text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700"
          }`}
        >
          Daily Returns
        </button>
        <button
          onClick={() => setFilter("commission")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all font-medium ${
            filter === "commission" ? "bg-emerald-600 text-white" : "bg-gray-950/60 text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700"
          }`}
        >
          Affiliate Bonuses
        </button>
      </div>

      {/* Ledger lists */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <span className="text-xs text-gray-500 font-mono animate-pulse">Scanning central ledger database...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-850 rounded-2xl bg-gray-950/30">
            <p className="text-xs text-gray-500 font-mono">No matching transaction keys found on database files.</p>
          </div>
        ) : (
          filtered.map((tx) => {
            const isCredit = tx.type === "deposit" || tx.type === "copy_trade_profit" || tx.type === "referral_bonus";

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-gray-950 border border-gray-800/80 rounded-xl transition-all hover:bg-gray-950/80 hover:border-gray-700/60"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-2 rounded-xl flex-shrink-0 border ${
                    isCredit
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
                      : "bg-gray-900 text-gray-400 border-gray-800"
                  }`}>
                    {tx.type === "deposit" ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : tx.type === "withdrawal" ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : tx.type === "copy_trade_profit" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : tx.type === "referral_bonus" ? (
                      <Award className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-gray-200 block truncate pr-2">
                      {tx.description}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 font-mono text-[9px] text-gray-500">
                      <span>Ref Keys: {tx.id.substring(0, 10)}...</span>
                      <span>•</span>
                      <span>{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-4 flex flex-col items-end">
                  <span className={`text-xs font-bold font-mono ${
                    isCredit ? "text-emerald-400" : "text-gray-200"
                  }`}>
                    {isCredit ? "+" : "-"}${tx.amount.toFixed(2)} USDT
                  </span>
                  <span className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${
                    tx.status === "completed" ? "text-emerald-500" :
                    tx.status === "pending" ? "text-amber-500" :
                    "text-rose-500"
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
