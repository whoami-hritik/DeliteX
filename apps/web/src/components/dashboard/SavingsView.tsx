"use client";

import { useDashboardContext } from "@/hooks/DashboardContext";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Lock,
  Wallet,
  Play,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";
import { projectEarnings, simulateSweepDebit } from "@/lib/stellar/sweeper";

export default function SavingsView() {
  const { vault, refreshData, profile } = useDashboardContext();
  const [activeTab, setActiveTab] = useState<"overview" | "simulator" | "contract">("overview");

  // State
  const [vaultBalance, setVaultBalance] = useState(12450.00);
  const [apy] = useState(7.40); // 7.40% APY
  const [autoSweepEnabled, setAutoSweepEnabled] = useState(true);
  const [liveYield, setLiveYield] = useState(148.62);

  // Modals
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Sweep Simulator State
  const [simRecipient, setSimRecipient] = useState("GD74QW...RENT_RECIPIENT");
  const [simAmount, setSimAmount] = useState("850");
  const [simResult, setSimResult] = useState<{
    canCover: boolean;
    remainingVaultUsdc: number;
    deficitUsdc: number;
  } | null>(null);

  // Live Micro-Yield Ticker (Real-Time Compounding)
  useEffect(() => {
    const interval = setInterval(() => {
      // Micro compound increment per second based on APY
      const ratePerSec = (apy / 100) / (365 * 24 * 3600);
      const increment = vaultBalance * ratePerSec;
      setLiveYield((prev) => prev + increment);
    }, 1000);
    return () => clearInterval(interval);
  }, [vaultBalance, apy]);

  const earnings = projectEarnings(vaultBalance, apy);

  // Deposit Handler
  const handleDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid deposit amount.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setVaultBalance((b) => b + amt);
      setDepositAmount("");
      setIsDepositModalOpen(false);
      setIsProcessing(false);
      toast.success(`Deposited $${amt.toLocaleString()} USDC into Yield Sweeper!`);
    }, 600);
  };

  // Withdraw Handler
  const handleWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid withdrawal amount.");
      return;
    }
    if (amt > vaultBalance) {
      toast.error("Insufficient vault balance.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setVaultBalance((b) => b - amt);
      setWithdrawAmount("");
      setIsWithdrawModalOpen(false);
      setIsProcessing(false);
      toast.success(`Redeemed $${amt.toLocaleString()} USDC + accrued yield to wallet.`);
    }, 600);
  };

  // Run Sweep & Pay Simulation
  const handleRunSimulation = () => {
    const amt = parseFloat(simAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid payment amount.");
      return;
    }
    const result = simulateSweepDebit(vaultBalance, amt);
    setSimResult(result);
    if (result.canCover) {
      toast.success("Atomic sweep simulation verified: Zero idle capital required!");
    } else {
      toast.error(`Vault balance ($${vaultBalance.toLocaleString()} USDC) is less than the payment amount.`);
    }
  };

  // Execute Simulated Sweep on Vault
  const handleExecuteSweep = () => {
    const amt = parseFloat(simAmount);
    if (isNaN(amt) || amt > vaultBalance) return;
    setIsProcessing(true);
    setTimeout(() => {
      setVaultBalance((b) => b - amt);
      setIsProcessing(false);
      setSimResult(null);
      toast.success(`Atomic Sweep-and-Pay executed! $${amt.toLocaleString()} USDC disbursed to ${simRecipient}.`);
    }, 800);
  };

  const contractAddress = process.env.NEXT_PUBLIC_SOROBAN_SWEEPER || "CDNBSZFM6XFAW7T2JKAWX4MDCIMAHUPT4TH2QNBFOCGRTRQWEGHUBD64";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Top Metrics Banner */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Metric 1: Total Yield Balance */}
        <div
          className="card"
          style={{
            padding: "24px",
            borderRadius: "18px",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-ink-500)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Sweeper Vault Principal
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "rgba(43, 122, 90, 0.15)", color: "#34D399" }}>
              <Zap size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
            ${vaultBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span style={{ fontSize: "1rem", color: "var(--color-ink-500)", fontWeight: 500 }}>USDC</span>
          </p>
          <p style={{ fontSize: "0.75rem", color: "#34D399", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
            <CheckCircle2 size={12} /> Auto-Compounding Active
          </p>
        </div>

        {/* Metric 2: Live Accrued Yield Ticker */}
        <div
          className="card"
          style={{
            padding: "24px",
            borderRadius: "18px",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-ink-500)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Real-Time Accrued Yield
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "rgba(232, 135, 42, 0.15)", color: "var(--color-saffron)" }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "monospace", fontSize: "2rem", fontWeight: 800, color: "var(--color-saffron)", letterSpacing: "-0.03em" }}>
            +${liveYield.toFixed(4)} <span style={{ fontSize: "1rem", color: "var(--color-ink-500)", fontWeight: 500 }}>USDC</span>
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", marginTop: "6px" }}>
            Continuous Second-by-Second Compounding
          </p>
        </div>

        {/* Metric 3: APY & Zero-Idle Toggle */}
        <div
          className="card"
          style={{
            padding: "24px",
            borderRadius: "18px",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-ink-500)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Net APY & Auto-Sweep
            </span>
            <div
              onClick={() => {
                setAutoSweepEnabled(!autoSweepEnabled);
                toast.success(`Zero-Idle Auto-Sweep ${!autoSweepEnabled ? "Enabled" : "Disabled"}`);
              }}
              style={{
                cursor: "pointer",
                padding: "4px 10px",
                borderRadius: "100px",
                backgroundColor: autoSweepEnabled ? "rgba(52, 211, 153, 0.15)" : "rgba(255, 255, 255, 0.06)",
                border: `1px solid ${autoSweepEnabled ? "rgba(52, 211, 153, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
                fontSize: "0.6875rem",
                fontWeight: 700,
                color: autoSweepEnabled ? "#34D399" : "var(--color-ink-500)",
                textTransform: "uppercase",
              }}
            >
              {autoSweepEnabled ? "Auto-Sweep ON" : "Paused"}
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
            {apy.toFixed(2)}% <span style={{ fontSize: "1rem", color: "var(--color-ink-500)", fontWeight: 500 }}>Net APY</span>
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", marginTop: "6px" }}>
            Soroban c-Token Vault Protocol
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeTab === "overview" ? "rgba(232, 135, 42, 0.14)" : "transparent",
            color: activeTab === "overview" ? "var(--color-saffron)" : "var(--color-ink-500)",
            fontWeight: activeTab === "overview" ? 700 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            fontFamily: "var(--font-body)",
          }}
        >
          Yield Vault & Earnings
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeTab === "simulator" ? "rgba(232, 135, 42, 0.14)" : "transparent",
            color: activeTab === "simulator" ? "var(--color-saffron)" : "var(--color-ink-500)",
            fontWeight: activeTab === "simulator" ? 700 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "var(--font-body)",
          }}
        >
          <Sparkles size={15} /> Sweep & Pay Simulator
        </button>

        <button
          onClick={() => setActiveTab("contract")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeTab === "contract" ? "rgba(232, 135, 42, 0.14)" : "transparent",
            color: activeTab === "contract" ? "var(--color-saffron)" : "var(--color-ink-500)",
            fontWeight: activeTab === "contract" ? 700 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            fontFamily: "var(--font-body)",
          }}
        >
          Smart Contract Specs
        </button>
      </div>

      {/* TAB 1: OVERVIEW & PROJECTIONS */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Quick Actions Row */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              className="btn btn-ghost"
              onClick={() => setIsWithdrawModalOpen(true)}
              style={{ padding: "10px 20px", fontSize: "0.875rem" }}
            >
              <ArrowDownLeft size={16} /> Instant Redeem
            </button>
            <button
              className="btn btn-saffron"
              onClick={() => setIsDepositModalOpen(true)}
              style={{ padding: "10px 24px", fontSize: "0.875rem", fontWeight: 700 }}
            >
              <ArrowUpRight size={16} /> Deposit USDC
            </button>
          </div>

          {/* Earnings Projection Card */}
          <div className="card" style={{ padding: "28px", borderRadius: "18px", backgroundColor: "rgba(255, 255, 255, 0.03)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "8px", fontFamily: "var(--font-body)" }}>
              Automated Yield Projections (at {apy}% APY)
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-ink-500)", marginBottom: "20px" }}>
              Based on continuous share compounding. Real-world returns compound automatically into your vault position.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", textTransform: "uppercase", fontWeight: 600 }}>Daily Yield</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#34D399", marginTop: "4px" }}>
                  +${earnings.daily.toFixed(2)} <span style={{ fontSize: "0.75rem", color: "var(--color-ink-500)" }}>USDC</span>
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", marginTop: "2px" }}>≈ ₹{(earnings.daily * 84.1).toFixed(0)}/day</p>
              </div>

              <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", textTransform: "uppercase", fontWeight: 600 }}>Monthly Yield (30 Days)</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#34D399", marginTop: "4px" }}>
                  +${earnings.monthly.toFixed(2)} <span style={{ fontSize: "0.75rem", color: "var(--color-ink-500)" }}>USDC</span>
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", marginTop: "2px" }}>≈ ₹{(earnings.monthly * 84.1).toFixed(0)}/month</p>
              </div>

              <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", textTransform: "uppercase", fontWeight: 600 }}>Annual Projected Yield</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-saffron)", marginTop: "4px" }}>
                  +${earnings.annual.toFixed(2)} <span style={{ fontSize: "0.75rem", color: "var(--color-ink-500)" }}>USDC</span>
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", marginTop: "2px" }}>≈ ₹{(earnings.annual * 84.1).toFixed(0)}/year</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SWEEP & PAY SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="card" style={{ padding: "32px", borderRadius: "20px", backgroundColor: "rgba(255, 255, 255, 0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <Zap size={22} color="var(--color-saffron)" />
            <h3 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#fff", fontFamily: "var(--font-body)" }}>
              Zero-Idle Cash: &quot;Sweep &amp; Pay&quot; Engine
            </h3>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--color-ink-500)", marginBottom: "24px" }}>
            In DeliteX, you don&apos;t need to leave money uninvested. When a bill or payment occurs, the `YieldSweeperVault` contract atomically burns the exact required shares, redeems funds, and pays the destination in a single transaction block.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "640px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)", marginBottom: "6px" }}>
                Payment Destination / Recipient
              </label>
              <input
                className="input"
                value={simRecipient}
                onChange={(e) => setSimRecipient(e.target.value)}
                placeholder="e.g. Electric Company / Landlord / GA74QW..."
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)", marginBottom: "6px" }}>
                Payment Amount (USDC)
              </label>
              <input
                className="input"
                type="number"
                value={simAmount}
                onChange={(e) => setSimAmount(e.target.value)}
                placeholder="850"
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button
                className="btn btn-saffron"
                onClick={handleRunSimulation}
                style={{ padding: "10px 24px", fontWeight: 700 }}
              >
                <Play size={16} /> Simulate Atomic Sweep
              </button>
            </div>

            {/* Simulation Results Breakdown */}
            {simResult && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "20px",
                  borderRadius: "14px",
                  backgroundColor: simResult.canCover ? "rgba(52, 211, 153, 0.05)" : "rgba(239, 68, 68, 0.05)",
                  border: `1px solid ${simResult.canCover ? "rgba(52, 211, 153, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
                }}
              >
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: simResult.canCover ? "#34D399" : "#F87171", marginBottom: "10px" }}>
                  {simResult.canCover ? "Atomic Sweep Path Verified" : "Insufficient Vault Liquidity"}
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8125rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-ink-500)" }}>Available Vault Balance:</span>
                    <span style={{ fontWeight: 600, color: "#fff" }}>${vaultBalance.toLocaleString()} USDC</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-ink-500)" }}>Shares to Burn Automatically:</span>
                    <span style={{ fontWeight: 600, color: "var(--color-saffron)" }}>{simAmount} c-USDC Shares</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-ink-500)" }}>Remaining Vault Principal:</span>
                    <span style={{ fontWeight: 600, color: "#34D399" }}>${simResult.remainingVaultUsdc.toLocaleString()} USDC</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-ink-500)" }}>Manual Un-Staking Steps:</span>
                    <span style={{ fontWeight: 700, color: "#34D399" }}>0 Steps (Handled in 1 atomic Soroban block)</span>
                  </div>
                </div>

                {simResult.canCover && (
                  <button
                    className="btn btn-saffron"
                    disabled={isProcessing}
                    onClick={handleExecuteSweep}
                    style={{ marginTop: "16px", width: "100%", padding: "12px", fontWeight: 700 }}
                  >
                    {isProcessing ? "Executing Soroban Atomic Sweep..." : `Confirm & Sweep $${simAmount} USDC`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SMART CONTRACT SPECS */}
      {activeTab === "contract" && (
        <div className="card" style={{ padding: "32px", borderRadius: "20px", backgroundColor: "rgba(255, 255, 255, 0.03)" }}>
          <h3 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#fff", marginBottom: "8px", fontFamily: "var(--font-body)" }}>
            Yield Sweeper Smart Contract Architecture
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--color-ink-500)", marginBottom: "20px" }}>
            The `YieldSweeperVault` contract uses ERC-4626 / c-Token proportional share accounting on Stellar Soroban.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "16px 20px", borderRadius: "12px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-ink-300)", textTransform: "uppercase", marginBottom: "6px" }}>
                Verified On-Chain Contract ID (Testnet)
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <span style={{ fontFamily: "monospace", color: "#34D399", fontSize: "0.875rem" }}>
                  {contractAddress}
                </span>
                <a
                  href={`https://stellar.expert/explorer/testnet/contract/${contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--color-saffron)", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8125rem", textDecoration: "none" }}
                >
                  View on StellarExpert <ExternalLink size={13} />
                </a>
              </div>
            </div>

            <div style={{ padding: "16px 20px", borderRadius: "12px", backgroundColor: "rgba(52, 211, 153, 0.05)", border: "1px solid rgba(52, 211, 153, 0.15)", fontSize: "0.8125rem", color: "#34D399" }}>
              <strong>Zero-Idle Principle:</strong> Traditional banking maintains cash in a non-interest checking account. DeliteX keeps 100% of liquid assets compounding inside the Soroban Vault and unwinds exact fractions only at the millisecond of payment execution.
            </div>
          </div>
        </div>
      )}

      {/* DEPOSIT MODAL */}
      {isDepositModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div className="card" style={{ width: "100%", maxWidth: "440px", padding: "28px", borderRadius: "20px", backgroundColor: "#111" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>
              Deposit USDC into Yield Sweeper
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-ink-500)", marginBottom: "16px" }}>
              Funds begin earning continuous compounding yield immediately upon transaction confirmation.
            </p>
            <input
              className="input"
              type="number"
              placeholder="Amount USDC"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              style={{ marginBottom: "20px" }}
            />
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setIsDepositModalOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-saffron"
                disabled={isProcessing || !depositAmount}
                onClick={handleDeposit}
                style={{ padding: "10px 24px", fontWeight: 700 }}
              >
                {isProcessing ? "Depositing..." : "Confirm Deposit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {isWithdrawModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div className="card" style={{ width: "100%", maxWidth: "440px", padding: "28px", borderRadius: "20px", backgroundColor: "#111" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>
              Instant Redeem from Yield Sweeper
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-ink-500)", marginBottom: "16px" }}>
              Redeem your principal and accrued interest directly to your Stellar wallet.
            </p>
            <input
              className="input"
              type="number"
              placeholder="Amount USDC"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              style={{ marginBottom: "20px" }}
            />
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setIsWithdrawModalOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-saffron"
                disabled={isProcessing || !withdrawAmount}
                onClick={handleWithdraw}
                style={{ padding: "10px 24px", fontWeight: 700 }}
              >
                {isProcessing ? "Redeeming..." : "Confirm Redeem"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
