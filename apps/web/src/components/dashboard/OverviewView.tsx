import { useDashboardContext } from "@/hooks/DashboardContext";
import type { Bucket } from "@/types/domain";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Wallet, Receipt, Users, PiggyBank } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function BucketCard({ bucket, index }: { bucket: Bucket, index: number }) {
  const styles: Record<string, { bg: string; text: string; iconText: string; Icon: React.ElementType }> = {
    income: { bg: "bg-emerald-500/10", text: "text-emerald-400", iconText: "text-emerald-400", Icon: Wallet },
    bills: { bg: "bg-amber-500/10", text: "text-amber-400", iconText: "text-amber-400", Icon: Receipt },
    family: { bg: "bg-indigo-500/10", text: "text-indigo-400", iconText: "text-indigo-400", Icon: Users },
    savings: { bg: "bg-blue-500/10", text: "text-blue-400", iconText: "text-blue-400", Icon: PiggyBank },
  };
  const s = styles[bucket.type] || styles.income;
  const Icon = s.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
      className="bg-[var(--color-bg-card)] backdrop-blur-xl rounded-2xl p-5 border border-[var(--color-border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col gap-4 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full ${s.bg}`}>
          <Icon size={14} className={s.iconText} />
          <span className={`text-xs font-semibold ${s.text}`}>
            {bucket.label}
          </span>
        </div>
        <span className="text-xs font-medium text-[var(--color-ink-500)] bg-white/5 px-2 py-1 rounded-md">
          {bucket.nativeCurrency}
        </span>
      </div>
      <div>
        <p className="font-display text-3xl text-[var(--color-ink-900)] tracking-tight leading-none mb-1.5">
          {fmt(bucket.balanceInr)}
        </p>
        <p className="text-xs text-[var(--color-ink-500)] font-medium">
          {bucket.balanceNative.toLocaleString("en-US", { maximumFractionDigits: 2 })} {bucket.nativeCurrency} 
          <span className="mx-1.5 opacity-50">·</span> 
          {bucket.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function OverviewView() {
  const { paymentEvents, stellarAccount, vault, bills, family } = useDashboardContext();

  // Temporary FX rate for demo (testnet USDC -> INR)
  const USDC_INR = 84.1;
  const XLM_INR = 10.5; // Approx FX rate for XLM

  // Real data parsing
  const usdcBalance = parseFloat(stellarAccount?.balances.find(b => b.asset === "USDC")?.balance || "0");
  const xlmBalance = parseFloat(stellarAccount?.balances.find(b => b.asset === "XLM")?.balance || "0");
  
  // Calculate bucket totals from real DB data
  const billsTotal = bills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const familyTotal = family.reduce((sum, f) => sum + (Number(f.monthlyAllowance) || 0), 0);
  
  const buckets: Bucket[] = [
    {
      type: "income",
      label: "Wallet",
      description: "Available crypto balance",
      balanceNative: xlmBalance > 0 ? xlmBalance : usdcBalance,
      balanceInr: (usdcBalance * USDC_INR) + (xlmBalance * XLM_INR),
      nativeCurrency: xlmBalance > 0 ? "XLM" : "USDC",
      stellarAccountOrContractId: stellarAccount?.publicKey || null,
    },
    {
      type: "bills",
      label: "Bills",
      description: "Recurring obligations",
      balanceNative: billsTotal,
      balanceInr: billsTotal,
      nativeCurrency: "INR",
      stellarAccountOrContractId: null,
    },
    {
      type: "family",
      label: "Family",
      description: "Monthly allowances",
      balanceNative: familyTotal,
      balanceInr: familyTotal,
      nativeCurrency: "INR",
      stellarAccountOrContractId: null,
    },
    {
      type: "savings",
      label: "Savings",
      description: "Yield vault (Soroban)",
      balanceNative: vault?.totalValueUsdc || 0,
      balanceInr: (vault?.totalValueUsdc || 0) * USDC_INR,
      nativeCurrency: "USDC",
      stellarAccountOrContractId: vault?.sorobanContractId || null,
    },
  ];

  const totalInr = buckets.reduce((s, b) => s + b.balanceInr, 0);
  const recentEvents = paymentEvents.slice(0, 4);

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto pb-10">
      {/* Total balance hero */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-4"
      >
        <p className="text-sm font-semibold tracking-wide text-[var(--color-ink-500)] uppercase mb-3">Total portfolio value</p>
        <p className="font-display text-5xl md:text-6xl font-bold text-[var(--color-ink-900)] tracking-tighter leading-none">
          {fmt(totalInr)}
        </p>
        <div className="flex items-center gap-2 mt-4 text-sm text-[var(--color-ink-500)]">
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-medium border border-emerald-500/20">
            <ArrowUpRight size={14} /> 2.4%
          </span>
          <span>vs last month</span>
          <span className="opacity-50">·</span>
          <span>Updated just now</span>
        </div>
      </motion.div>

      {/* Bucket cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {buckets.map((b, i) => <BucketCard key={b.type} bucket={b} index={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick stats bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="lg:col-span-1 flex flex-col gap-px bg-white/10 rounded-2xl overflow-hidden border border-[var(--color-border)]"
        >
          {[
            { label: "This month income", value: fmt(usdcBalance * USDC_INR) },
            { label: "Bills due this month", value: fmt(billsTotal) },
            { label: "Family transferred", value: fmt(familyTotal) },
            { label: "Yield earned (USDC)", value: `+$${(vault?.yieldEarnedUsdc || 0).toFixed(2)}`, highlight: true },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--color-bg-card)] backdrop-blur-xl p-5 flex flex-col justify-center">
              <p className="text-xs font-semibold text-[var(--color-ink-500)] mb-1.5 uppercase tracking-wide">{s.label}</p>
              <p className={`font-display text-2xl tracking-tight ${s.highlight ? "text-[var(--color-saffron)]" : "text-[var(--color-ink-900)]"}`}>
                {s.value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Recent activity */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="lg:col-span-2 bg-[var(--color-bg-card)] backdrop-blur-xl rounded-2xl border border-[var(--color-border)] shadow-[0_4px_24px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
        >
          <div className="px-6 py-5 border-b border-[var(--color-border)] bg-white/5 flex justify-between items-center">
            <h3 className="font-semibold text-[var(--color-ink-900)]">Recent activity</h3>
            <button className="text-sm text-[var(--color-saffron)] font-medium hover:text-[var(--color-saffron-hover)] transition-colors">View all</button>
          </div>
          
          <div className="flex flex-col flex-1">
            {recentEvents.length === 0 ? (
              <div className="p-8 text-center text-[var(--color-ink-500)] text-sm flex-1 flex items-center justify-center">
                No recent activity found.
              </div>
            ) : recentEvents.map((row, i) => {
              const isPos = row.direction === "incoming";
              const amountStr = `${isPos ? "+" : "−"}${row.currency === "USDC" ? "$" : "₹"}${row.amount}`;
              
              return (
                <div
                  key={row.id}
                  className={`flex items-center justify-between p-4 px-6 hover:bg-white/5 transition-colors cursor-pointer ${
                    i < recentEvents.length - 1 ? "border-b border-white/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isPos ? "bg-emerald-500/10 text-emerald-400" : "bg-white/10 text-[var(--color-ink-500)]"
                    }`}>
                      {isPos ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink-900)]">
                        {row.description}
                      </p>
                      <p className="text-xs text-[var(--color-ink-500)] mt-0.5 font-medium">
                        {row.settledAt ? new Date(row.settledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Pending processing"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isPos ? "text-emerald-400" : "text-[var(--color-ink-900)]"}`}>
                      {amountStr}
                    </p>
                    <span className={`text-[10px] font-bold tracking-wider uppercase mt-1 inline-block px-2 py-0.5 rounded-full ${
                      row.status === "pending" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {row.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
