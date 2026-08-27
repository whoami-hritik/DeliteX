import { useDashboardContext } from "@/hooks/DashboardContext";
import type { Bucket } from "@/types/domain";
import { Wallet, Receipt, Users, PiggyBank, ArrowDownLeft, ArrowUpRight, TrendingUp, Sparkles } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function BucketCard({ bucket }: { bucket: Bucket }) {
  const bucketMeta: Record<string, { bg: string; fg: string; border: string; icon: React.ReactNode }> = {
    income: {
      bg: "rgba(43, 122, 90, 0.15)",
      fg: "#34D399",
      border: "rgba(52, 211, 153, 0.25)",
      icon: <Wallet size={15} />,
    },
    bills: {
      bg: "rgba(232, 135, 42, 0.15)",
      fg: "#FBBF24",
      border: "rgba(251, 191, 36, 0.25)",
      icon: <Receipt size={15} />,
    },
    family: {
      bg: "rgba(99, 102, 241, 0.15)",
      fg: "#818CF8",
      border: "rgba(129, 140, 248, 0.25)",
      icon: <Users size={15} />,
    },
    savings: {
      bg: "rgba(56, 189, 248, 0.15)",
      fg: "#38BDF8",
      border: "rgba(56, 189, 248, 0.25)",
      icon: <PiggyBank size={15} />,
    },
  };

  const meta = bucketMeta[bucket.type] || bucketMeta.income;

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        padding: "22px",
        borderRadius: "18px",
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        transition: "all 0.2s ease",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.18)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: meta.fg,
            backgroundColor: meta.bg,
            border: `1px solid ${meta.border}`,
            borderRadius: "100px",
            padding: "4px 10px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {meta.icon}
          {bucket.label}
        </span>
        <span
          style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "var(--color-ink-300)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            padding: "3px 8px",
            borderRadius: "6px",
          }}
        >
          {bucket.nativeCurrency}
        </span>
      </div>
      <div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "1.875rem",
            fontWeight: 700,
            color: "var(--color-ink-900)",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
          }}
        >
          {fmt(bucket.balanceInr)}
        </p>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--color-ink-500)",
            marginTop: "6px",
            fontFamily: "var(--font-body)",
            fontWeight: 400,
          }}
        >
          <span style={{ color: "var(--color-ink-700)", fontWeight: 500 }}>
            {bucket.balanceNative.toLocaleString("en-US", { maximumFractionDigits: 2 })} {bucket.nativeCurrency}
          </span>
          {" · "}
          {bucket.description}
        </p>
      </div>
    </div>
  );
}

export default function OverviewView() {
  const { paymentEvents, stellarAccount, vault, bills, family } = useDashboardContext();

  // Temporary FX rate for demo (testnet USDC -> INR)
  const USDC_INR = 84.1;
  const XLM_INR = 10.5; // Approx FX rate for XLM

  // Real data parsing
  const usdcBalance = parseFloat(stellarAccount?.balances.find((b) => b.asset === "USDC")?.balance || "0");
  const xlmBalance = parseFloat(stellarAccount?.balances.find((b) => b.asset === "XLM")?.balance || "0");

  // Calculate bucket totals from real DB data
  const billsTotal = bills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const familyTotal = family.reduce((sum, f) => sum + (Number(f.monthlyAllowance) || 0), 0);

  const buckets: Bucket[] = [
    {
      type: "income",
      label: "Wallet",
      description: "Available crypto balance",
      balanceNative: xlmBalance > 0 ? xlmBalance : usdcBalance,
      balanceInr: usdcBalance * USDC_INR + xlmBalance * XLM_INR,
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
  const recentEvents = paymentEvents.slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Total balance hero */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#34D399",
                boxShadow: "0 0 10px #34D399",
              }}
            />
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-ink-500)",
                fontFamily: "var(--font-body)",
              }}
            >
              Total Portfolio Value
            </p>
          </div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "3.5rem",
              fontWeight: 800,
              color: "var(--color-ink-900)",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            {fmt(totalInr)}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#34D399",
                backgroundColor: "rgba(52, 211, 153, 0.12)",
                padding: "3px 8px",
                borderRadius: "100px",
                border: "1px solid rgba(52, 211, 153, 0.25)",
              }}
            >
              <TrendingUp size={12} />
              +2.4%
            </span>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-ink-500)", fontFamily: "var(--font-body)" }}>
              Across 4 automated buckets · Live sync
            </p>
          </div>
        </div>
      </div>

      {/* Bucket cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "16px",
        }}
      >
        {buckets.map((b) => (
          <BucketCard key={b.type} bucket={b} />
        ))}
      </div>

      {/* Quick stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
        }}
      >
        {[
          {
            label: "This month income",
            value: fmt(usdcBalance * USDC_INR),
            color: "var(--color-ink-900)",
            tag: "USD/INR",
          },
          {
            label: "Bills due this month",
            value: fmt(billsTotal),
            color: "var(--color-ink-900)",
            tag: "Auto-debit",
          },
          {
            label: "Family transferred",
            value: fmt(familyTotal),
            color: "var(--color-ink-900)",
            tag: "Remittance",
          },
          {
            label: "Yield earned (USDC)",
            value: `+$${(vault?.yieldEarnedUsdc || 0).toFixed(2)}`,
            color: "var(--color-saffron)",
            tag: "Soroban APY",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="card"
            style={{
              padding: "18px 20px",
              borderRadius: "14px",
              backgroundColor: "rgba(255, 255, 255, 0.025)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--color-ink-500)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {s.label}
              </p>
              <span
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--color-ink-300)",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {s.tag}
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: s.color,
                letterSpacing: "-0.02em",
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div
        className="card"
        style={{
          borderRadius: "18px",
          padding: "0",
          overflow: "hidden",
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-border)",
            backgroundColor: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={16} color="var(--color-saffron)" />
            <h3
              style={{
                fontWeight: 700,
                fontSize: "0.9375rem",
                color: "var(--color-ink-900)",
                fontFamily: "var(--font-body)",
              }}
            >
              Recent Activity
            </h3>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--color-ink-500)" }}>
            Stellar Ledger + Soroban Events
          </span>
        </div>

        <div>
          {recentEvents.length === 0 ? (
            <div
              style={{
                padding: "36px 20px",
                textAlign: "center",
                color: "var(--color-ink-500)",
                fontSize: "0.875rem",
                fontFamily: "var(--font-body)",
              }}
            >
              No recent activity recorded yet.
            </div>
          ) : (
            recentEvents.map((row, i) => {
              const isPos = row.direction === "incoming";
              const amountStr = `${isPos ? "+" : "−"}${row.currency === "USDC" ? "$" : "₹"}${row.amount}`;

              return (
                <div
                  key={row.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 24px",
                    borderBottom: i < recentEvents.length - 1 ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isPos ? "rgba(52, 211, 153, 0.12)" : "rgba(232, 135, 42, 0.12)",
                        color: isPos ? "#34D399" : "var(--color-saffron)",
                        border: `1px solid ${isPos ? "rgba(52, 211, 153, 0.2)" : "rgba(232, 135, 42, 0.2)"}`,
                        flexShrink: 0,
                      }}
                    >
                      {isPos ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "var(--color-ink-900)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {row.description}
                      </p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-ink-500)",
                          marginTop: "2px",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {row.settledAt
                          ? new Date(row.settledAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Pending processing"}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: 700,
                        fontFamily: "var(--font-body)",
                        color: isPos ? "#34D399" : "var(--color-ink-900)",
                      }}
                    >
                      {amountStr}
                    </p>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        color: row.status === "pending" ? "#FBBF24" : "#34D399",
                        marginTop: "2px",
                      }}
                    >
                      <span
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          backgroundColor: row.status === "pending" ? "#FBBF24" : "#34D399",
                        }}
                      />
                      {row.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
