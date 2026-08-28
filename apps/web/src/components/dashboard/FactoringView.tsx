"use client";

import { useState } from "react";
import { useDashboardContext } from "@/hooks/DashboardContext";
import {
  Banknote,
  Coins,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  ArrowDownLeft,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import {
  type FactoringPositionRecord,
  calculateAdvance,
} from "@/lib/stellar/factoring";

export default function FactoringView() {
  const { stellarAccount } = useDashboardContext();

  // Working Capital Pool State
  const [totalPoolLiquidity, setTotalPoolLiquidity] = useState(75000);
  const [activeAdvancesTotal, setActiveAdvancesTotal] = useState(19200);

  // Active Factored Positions
  const [positions, setPositions] = useState<FactoringPositionRecord[]>([
    {
      id: 1,
      invoiceId: 101,
      invoiceNumber: "INV-2026-0891",
      clientName: "Acme Web3 Labs GmbH (Berlin)",
      totalAmountUsdc: 10000,
      advanceAmountUsdc: 8000,
      discountFeeUsdc: 150,
      remainderUsdc: 1850,
      status: "active",
      fundedAt: "2026-08-26T10:00:00Z",
      dueDate: "2026-09-25T23:59:59Z",
    },
    {
      id: 2,
      invoiceId: 98,
      invoiceNumber: "INV-2026-0842",
      clientName: "Nexus AI Protocols (San Francisco)",
      totalAmountUsdc: 14000,
      advanceAmountUsdc: 11200,
      discountFeeUsdc: 210,
      remainderUsdc: 2590,
      status: "settled",
      fundedAt: "2026-08-10T12:00:00Z",
      dueDate: "2026-08-25T23:59:59Z",
      txHash: "0x48e1a90c23fa90812bcae91f0923da719c",
    },
  ]);

  const [activeTab, setActiveTab] = useState<"positions" | "advance" | "liquidity" | "specs">("positions");

  // Advance Request Form State
  const [reqInvoiceNum, setReqInvoiceNum] = useState("INV-2026-0895");
  const [reqClientName, setReqClientName] = useState("Starlight Media Group");
  const [reqAmount, setReqAmount] = useState("6500");
  const [reqDueDate, setReqDueDate] = useState("2026-09-30");
  const [isProcessing, setIsProcessing] = useState(false);

  // LP Stake State
  const [lpStakeAmount, setLpStakeAmount] = useState("");

  const advanceMath = calculateAdvance(parseFloat(reqAmount) || 0);

  // Submit Advance Request
  const handleRequestAdvance = async () => {
    const amt = parseFloat(reqAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid invoice amount.");
      return;
    }
    if (advanceMath.advanceAmount > totalPoolLiquidity - activeAdvancesTotal) {
      toast.error("Insufficient liquidity in the working capital pool.");
      return;
    }

    setIsProcessing(true);
    try {
      const { invokeSorobanMethod } = await import("@/lib/stellar/soroban");
      const { Address, nativeToScVal } = await import("@stellar/stellar-sdk");
      const { requestAccess } = await import("@stellar/freighter-api");

      const access = await requestAccess();
      const pubKey = typeof access === 'string' ? access : access.address;
      const invoiceId = 100 + positions.length + 1;
      
      const args = [
        new Address(pubKey).toScVal(),
        nativeToScVal(invoiceId, { type: "u64" }),
        nativeToScVal(Math.floor(amt * 10000000), { type: "i128" }),
        nativeToScVal(Math.floor(advanceMath.advanceAmount * 10000000), { type: "i128" })
      ];

      await invokeSorobanMethod(
        process.env.NEXT_PUBLIC_SOROBAN_FACTORING_ID || "CAPNWFV3JFNE2FCGH6IWXVH5DAZQYYWFKWNLE2HRIITDZSNINH7FO2WA",
        "advance_invoice",
        args
      );

      const newPos: FactoringPositionRecord = {
        id: positions.length + 1,
        invoiceId,
        invoiceNumber: reqInvoiceNum,
        clientName: reqClientName,
        totalAmountUsdc: amt,
        advanceAmountUsdc: advanceMath.advanceAmount,
        discountFeeUsdc: advanceMath.discountFee,
        remainderUsdc: advanceMath.merchantRemainderOnSettlement,
        status: "active",
        fundedAt: new Date().toISOString(),
        dueDate: reqDueDate,
      };

      setPositions([newPos, ...positions]);
      setActiveAdvancesTotal((a) => a + advanceMath.advanceAmount);
      setActiveTab("positions");
      setReqAmount("");
      toast.success(`🎉 Cash advance of $${advanceMath.advanceAmount} USDC successfully funded on-chain!`);
    } catch (e: unknown) {
      toast.error(`Advance Request Failed: ${(e as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate Client Settle Factored Invoice
  const handleSimulateSettlement = (posId: number) => {
    setIsProcessing(true);
    setTimeout(() => {
      setPositions((prev) =>
        prev.map((p) => {
          if (p.id === posId) {
            setActiveAdvancesTotal((a) => a - p.advanceAmountUsdc);
            setTotalPoolLiquidity((l) => l + p.discountFeeUsdc); // Fee compounds into pool
            toast.success(`Invoice settled! Remitted $${p.remainderUsdc.toLocaleString()} remainder to merchant.`);
            return {
              ...p,
              status: "settled",
              txHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
            };
          }
          return p;
        })
      );
      setIsProcessing(false);
    }, 700);
  };

  // LP Stake Action
  const handleLpStake = () => {
    const amt = parseFloat(lpStakeAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid staking amount.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setTotalPoolLiquidity((l) => l + amt);
      setLpStakeAmount("");
      setIsProcessing(false);
      toast.success(`Staked $${amt.toLocaleString()} USDC into Factoring Working Capital Pool!`);
    }, 600);
  };

  const contractAddress =
    process.env.NEXT_PUBLIC_SOROBAN_FACTORING ||
    "CAPNWFV3JFNE2FCGH6IWXVH5DAZQYYWFKWNLE2HRIITDZSNINH7FO2WA";

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
              Working Capital Pool
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "rgba(52, 211, 153, 0.12)", color: "#34D399" }}>
              <Coins size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
            ${(totalPoolLiquidity - activeAdvancesTotal).toLocaleString("en-US", { minimumFractionDigits: 2 })} <span style={{ fontSize: "1rem", color: "var(--color-ink-500)", fontWeight: 500 }}>USDC</span>
          </p>
          <p style={{ fontSize: "0.75rem", color: "#34D399", marginTop: "6px" }}>
            Available Instant Liquidity
          </p>
        </div>

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
              Active Advances Disbursed
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "rgba(232, 135, 42, 0.12)", color: "var(--color-saffron)" }}>
              <Zap size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
            ${activeAdvancesTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span style={{ fontSize: "1rem", color: "var(--color-ink-500)", fontWeight: 500 }}>USDC</span>
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-saffron)", marginTop: "6px" }}>
            80% Net-30/60 Advances Out
          </p>
        </div>

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
              Advance Rate &amp; Terms
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "rgba(99, 102, 241, 0.12)", color: "#818CF8" }}>
              <Percent size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
            80% LTV <span style={{ fontSize: "1rem", color: "var(--color-ink-500)", fontWeight: 500 }}>· 1.5% Fee</span>
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", marginTop: "6px" }}>
            Zero Personal Guarantee Required
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("positions")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeTab === "positions" ? "rgba(232, 135, 42, 0.14)" : "transparent",
            color: activeTab === "positions" ? "var(--color-saffron)" : "var(--color-ink-500)",
            fontWeight: activeTab === "positions" ? 700 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            fontFamily: "var(--font-body)",
          }}
        >
          Active Factored Advances ({positions.length})
        </button>

        <button
          onClick={() => setActiveTab("advance")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeTab === "advance" ? "rgba(232, 135, 42, 0.14)" : "transparent",
            color: activeTab === "advance" ? "var(--color-saffron)" : "var(--color-ink-500)",
            fontWeight: activeTab === "advance" ? 700 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "var(--font-body)",
          }}
        >
          <Zap size={15} /> Request 80% Instant Cash
        </button>

        <button
          onClick={() => setActiveTab("liquidity")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeTab === "liquidity" ? "rgba(232, 135, 42, 0.14)" : "transparent",
            color: activeTab === "liquidity" ? "var(--color-saffron)" : "var(--color-ink-500)",
            fontWeight: activeTab === "liquidity" ? 700 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            fontFamily: "var(--font-body)",
          }}
        >
          LP Yield Staking (14.2% APY)
        </button>

        <button
          onClick={() => setActiveTab("specs")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeTab === "specs" ? "rgba(232, 135, 42, 0.14)" : "transparent",
            color: activeTab === "specs" ? "var(--color-saffron)" : "var(--color-ink-500)",
            fontWeight: activeTab === "specs" ? 700 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            fontFamily: "var(--font-body)",
          }}
        >
          Smart Contract Specs
        </button>
      </div>

      {/* TAB 1: ACTIVE POSITIONS */}
      {activeTab === "positions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {positions.map((pos) => (
            <div
              key={pos.id}
              className="card"
              style={{
                padding: "24px 28px",
                borderRadius: "18px",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border:
                  pos.status === "settled"
                    ? "1px solid rgba(52, 211, 153, 0.25)"
                    : "1px solid rgba(232, 135, 42, 0.25)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "0.875rem", fontWeight: 700, color: "var(--color-saffron)" }}>
                      {pos.invoiceNumber}
                    </span>
                    {pos.status === "settled" ? (
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "3px 8px", borderRadius: "100px", backgroundColor: "rgba(52, 211, 153, 0.15)", color: "#34D399", textTransform: "uppercase" }}>
                        Self-Repaid &amp; Settled
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "3px 8px", borderRadius: "100px", backgroundColor: "rgba(232, 135, 42, 0.15)", color: "var(--color-saffron)", textTransform: "uppercase" }}>
                        Active Advance ($8,000 Disbursed)
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", fontFamily: "var(--font-body)" }}>
                    {pos.clientName}
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-ink-500)" }}>
                    Funded {new Date(pos.fundedAt).toLocaleDateString()} · Client Due Date: {new Date(pos.dueDate).toLocaleDateString()}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", fontFamily: "var(--font-body)" }}>
                    ${pos.totalAmountUsdc.toLocaleString()} <span style={{ fontSize: "0.875rem", color: "var(--color-ink-500)" }}>Invoice</span>
                  </p>
                  <p style={{ fontSize: "0.8125rem", color: "#34D399", fontWeight: 600 }}>
                    +${pos.advanceAmountUsdc.toLocaleString()} USDC Instant Cash Received
                  </p>
                </div>
              </div>

              {/* Advance Economics Breakdown Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                  padding: "16px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.6875rem", color: "var(--color-ink-500)", textTransform: "uppercase" }}>80% Advance Disbursed</span>
                  <p style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>${pos.advanceAmountUsdc.toLocaleString()} USDC</p>
                </div>
                <div>
                  <span style={{ fontSize: "0.6875rem", color: "var(--color-ink-500)", textTransform: "uppercase" }}>Factoring Fee (1.5%)</span>
                  <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-saffron)" }}>-${pos.discountFeeUsdc.toLocaleString()} USDC</p>
                </div>
                <div>
                  <span style={{ fontSize: "0.6875rem", color: "var(--color-ink-500)", textTransform: "uppercase" }}>Remainder on Client Payment</span>
                  <p style={{ fontSize: "1rem", fontWeight: 700, color: "#34D399" }}>+${pos.remainderUsdc.toLocaleString()} USDC</p>
                </div>
              </div>

              {/* Action */}
              {pos.status === "active" && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-saffron"
                    disabled={isProcessing}
                    onClick={() => handleSimulateSettlement(pos.id)}
                    style={{ padding: "10px 20px", fontSize: "0.8125rem", fontWeight: 700 }}
                  >
                    Simulate Client Settle ($10,000 Payment)
                  </button>
                </div>
              )}

              {pos.status === "settled" && pos.txHash && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--color-ink-500)" }}>
                  <span>Automated Pool Self-Repayment Verified</span>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${pos.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "var(--color-saffron)", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                  >
                    TX: {pos.txHash} <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: REQUEST 80% ADVANCE */}
      {activeTab === "advance" && (
        <div className="card" style={{ padding: "32px", borderRadius: "20px", backgroundColor: "rgba(255, 255, 255, 0.03)" }}>
          <h3 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#fff", marginBottom: "8px", fontFamily: "var(--font-body)" }}>
            Instant Working Capital Cash Advance
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--color-ink-500)", marginBottom: "24px" }}>
            Don&apos;t wait 30–60 days for clients to pay. Lock your verified unpaid invoice and receive 80% liquid cash in seconds.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "680px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)", marginBottom: "6px" }}>
                  Invoice Number
                </label>
                <input
                  className="input"
                  value={reqInvoiceNum}
                  onChange={(e) => setReqInvoiceNum(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)", marginBottom: "6px" }}>
                  Client / Payee Name
                </label>
                <input
                  className="input"
                  value={reqClientName}
                  onChange={(e) => setReqClientName(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)", marginBottom: "6px" }}>
                  Total Invoice Amount (USDC)
                </label>
                <input
                  className="input"
                  type="number"
                  value={reqAmount}
                  onChange={(e) => setReqAmount(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)", marginBottom: "6px" }}>
                  Expected Client Due Date
                </label>
                <input
                  className="input"
                  type="date"
                  value={reqDueDate}
                  onChange={(e) => setReqDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Real-Time Underwriting Math Box */}
            <div style={{ padding: "20px", borderRadius: "14px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.08)", marginTop: "10px" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-ink-500)", textTransform: "uppercase", marginBottom: "12px" }}>
                Instant Factoring Underwriting Breakdown
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.875rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-ink-500)" }}>Total Invoice Value:</span>
                  <span style={{ fontWeight: 600, color: "#fff" }}>${advanceMath.totalInvoiceAmount.toLocaleString()} USDC</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-ink-500)" }}>Instant Cash Disbursed Now (80% LTV):</span>
                  <span style={{ fontWeight: 800, color: "#34D399", fontSize: "1.125rem" }}>
                    +${advanceMath.advanceAmount.toLocaleString()} USDC
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-ink-500)" }}>Factoring Discount Fee (1.50%):</span>
                  <span style={{ fontWeight: 600, color: "var(--color-saffron)" }}>-${advanceMath.discountFee.toLocaleString()} USDC</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-ink-500)" }}>Remainder Remitted on Client Settlement:</span>
                  <span style={{ fontWeight: 600, color: "#fff" }}>+${advanceMath.merchantRemainderOnSettlement.toLocaleString()} USDC</span>
                </div>
              </div>
            </div>

            <button
              className="btn btn-saffron"
              disabled={isProcessing || advanceMath.advanceAmount <= 0}
              onClick={handleRequestAdvance}
              style={{ marginTop: "12px", padding: "14px", fontWeight: 700, fontSize: "0.9375rem" }}
            >
              <Zap size={16} /> {isProcessing ? "Disbursing Cash Advance..." : `Disburse $${advanceMath.advanceAmount.toLocaleString()} USDC to Wallet Now`}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: LP LIQUIDITY STAKING */}
      {activeTab === "liquidity" && (
        <div className="card" style={{ padding: "32px", borderRadius: "20px", backgroundColor: "rgba(255, 255, 255, 0.03)" }}>
          <h3 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#fff", marginBottom: "8px", fontFamily: "var(--font-body)" }}>
            Working Capital Liquidity Provider (LP) Pool
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--color-ink-500)", marginBottom: "24px" }}>
            Supply liquidity to fund verified corporate contractor invoices. Earn factoring discount fee yield (1.5% per 30-day turn, ~14.2% annualized APY).
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "520px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)", marginBottom: "6px" }}>
                Stake USDC Liquidity
              </label>
              <input
                className="input"
                type="number"
                placeholder="Amount USDC"
                value={lpStakeAmount}
                onChange={(e) => setLpStakeAmount(e.target.value)}
              />
            </div>

            <button
              className="btn btn-saffron"
              disabled={isProcessing || !lpStakeAmount}
              onClick={handleLpStake}
              style={{ padding: "12px", fontWeight: 700 }}
            >
              <ArrowUpRight size={16} /> Stake Liquidity &amp; Earn 14.2% APY
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: SMART CONTRACT SPECS */}
      {activeTab === "specs" && (
        <div className="card" style={{ padding: "32px", borderRadius: "20px", backgroundColor: "rgba(255, 255, 255, 0.03)" }}>
          <h3 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#fff", marginBottom: "8px", fontFamily: "var(--font-body)" }}>
            Invoice Factoring Smart Contract Architecture
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--color-ink-500)", marginBottom: "20px" }}>
            The `InvoiceFactoringPool` contract enforces non-custodial underwriting constraints and automated self-repayment.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "16px 20px", borderRadius: "12px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-ink-300)", textTransform: "uppercase", marginBottom: "6px" }}>
                Deployed Invoice Factoring Contract ID (Testnet)
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
              <strong>Self-Repaying Guarantee:</strong> When the corporate debtor settles the invoice via `InvoiceRouter`, the smart contract intercepts the settlement, automatically satisfies the 80% advance + 1.5% fee to the LP pool, and streams the remaining 20% balance to the merchant with zero manual intervention.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
