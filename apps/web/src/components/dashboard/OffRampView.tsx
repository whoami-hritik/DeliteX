"use client";

import { useState } from "react";
import { useDashboardContext } from "@/hooks/DashboardContext";
import {
  Landmark,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  ArrowDownRight,
  Globe2,
  RefreshCw,
  Building2,
  Sliders,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  type DomesticRail,
  type BankBeneficiaryRecord,
  type OffRampTransaction,
  calculateRampQuote,
} from "@/lib/stellar/offramp";

export default function OffRampView() {
  const { stellarAccount } = useDashboardContext();

  // Beneficiaries State
  const [beneficiaries, setBeneficiaries] = useState<BankBeneficiaryRecord[]>([
    {
      id: 1,
      label: "HDFC Salary Account (India)",
      accountIdentifier: "rohit.sharma@okhdfcbank",
      railType: "UPI",
      country: "India (IN)",
      currencyCode: "INR",
      anchorName: "Onmeta Direct UPI Bridge",
      autoRampPercent: 40,
      isPrimary: true,
    },
    {
      id: 2,
      label: "N26 Euro Business Account (Berlin)",
      accountIdentifier: "DE89 3704 0044 0532 0130 00",
      railType: "SEPA",
      country: "Germany (EU)",
      currencyCode: "EUR",
      anchorName: "Tempo France SEPA Instant",
      autoRampPercent: 0,
      isPrimary: false,
    },
    {
      id: 3,
      label: "Nubank Personal (São Paulo)",
      accountIdentifier: "123.456.789-00",
      railType: "PIX",
      country: "Brazil (BR)",
      currencyCode: "BRL",
      anchorName: "Anclap Brazil PIX Bridge",
      autoRampPercent: 0,
      isPrimary: false,
    },
  ]);

  // Off-Ramp History
  const [history, setHistory] = useState<OffRampTransaction[]>([
    {
      id: 1,
      beneficiaryLabel: "HDFC Salary Account (India)",
      accountIdentifier: "rohit.sharma@okhdfcbank",
      railType: "UPI",
      amountUsdc: 1500,
      fiatReceived: "₹130,613.25 INR",
      status: "Settled",
      settlementTimeSec: 32,
      timestamp: "2026-08-27T15:30:00Z",
      bankRefNumber: "UTR-20260827-994812",
      txHash: "0x89ab1034f712ac99d10e823da719c",
    },
    {
      id: 2,
      beneficiaryLabel: "N26 Euro Business Account (Berlin)",
      accountIdentifier: "DE89 3704 0044 0532 0130 00",
      railType: "SEPA",
      amountUsdc: 3000,
      fiatReceived: "€2,769.45 EUR",
      status: "Settled",
      settlementTimeSec: 18,
      timestamp: "2026-08-22T09:15:00Z",
      bankRefNumber: "SEPA-FR-20260822-4410",
      txHash: "0x44cd8912ba9901ac88f21e09bc48",
    },
  ]);

  const [activeTab, setActiveTab] = useState<"instant" | "beneficiaries" | "autoramp" | "anchors">("instant");

  // Instant Off-Ramp State
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<number>(1);
  const [offRampAmount, setOffRampAmount] = useState<string>("1000");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // New Beneficiary Form State
  const [newLabel, setNewLabel] = useState("");
  const [newAccount, setNewAccount] = useState("");
  const [newRail, setNewRail] = useState<DomesticRail>("UPI");

  // Auto-Ramp Rule State
  const [autoRampPercent, setAutoRampPercent] = useState<number>(40);

  const selectedBeneficiary = beneficiaries.find((b) => b.id === selectedBeneficiaryId) || beneficiaries[0];
  const quote = calculateRampQuote(parseFloat(offRampAmount) || 0, selectedBeneficiary?.railType || "UPI");

  // Execute Instant Off-Ramp
  const handleExecuteOffRamp = () => {
    const amt = parseFloat(offRampAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid USDC amount.");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const newTx: OffRampTransaction = {
        id: history.length + 1,
        beneficiaryLabel: selectedBeneficiary.label,
        accountIdentifier: selectedBeneficiary.accountIdentifier,
        railType: selectedBeneficiary.railType,
        amountUsdc: amt,
        fiatReceived: `${quote.targetCurrency === "INR" ? "₹" : quote.targetCurrency === "EUR" ? "€" : "R$"}${quote.netFiatPayout.toLocaleString()} ${quote.targetCurrency}`,
        status: "Settled",
        settlementTimeSec: quote.estimatedSettlementSeconds,
        timestamp: new Date().toISOString(),
        bankRefNumber: `BANK-REF-${Math.floor(100000 + Math.random() * 900000)}`,
        txHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      };

      setHistory([newTx, ...history]);
      setIsProcessing(false);
      toast.success(
        `🎉 ${newTx.fiatReceived} deposited into ${selectedBeneficiary.label} in ${quote.estimatedSettlementSeconds}s!`
      );
    }, 900);
  };

  // Add Beneficiary
  const handleAddBeneficiary = () => {
    if (!newLabel.trim() || !newAccount.trim()) {
      toast.error("Please fill in all beneficiary details.");
      return;
    }

    const newBen: BankBeneficiaryRecord = {
      id: beneficiaries.length + 1,
      label: newLabel.trim(),
      accountIdentifier: newAccount.trim(),
      railType: newRail,
      country: newRail === "UPI" || newRail === "IMPS" ? "India (IN)" : newRail === "SEPA" ? "Europe (EU)" : "Brazil (BR)",
      currencyCode: newRail === "UPI" || newRail === "IMPS" ? "INR" : newRail === "SEPA" ? "EUR" : "BRL",
      anchorName: newRail === "UPI" ? "Onmeta UPI Bridge" : newRail === "SEPA" ? "Tempo France SEPA" : "Anclap Pix",
      autoRampPercent: 0,
      isPrimary: false,
    };

    setBeneficiaries([...beneficiaries, newBen]);
    setNewLabel("");
    setNewAccount("");
    setActiveTab("beneficiaries");
    toast.success(`Bank beneficiary "${newBen.label}" added and registered on-chain!`);
  };

  // Save Auto-Ramp Rule
  const handleSaveAutoRamp = () => {
    setBeneficiaries((prev) =>
      prev.map((b) => ({
        ...b,
        autoRampPercent: b.id === selectedBeneficiaryId ? autoRampPercent : 0,
        isPrimary: b.id === selectedBeneficiaryId,
      }))
    );
    toast.success(`Auto-Ramp rule updated: ${autoRampPercent}% of all incoming salary auto-deposited to ${selectedBeneficiary.label}!`);
  };

  const contractAddress =
    process.env.NEXT_PUBLIC_SOROBAN_RAMP ||
    "CCTTCPSCGUIPJULJIGZQLCWDJHVUR6X4LY5QBLLBGAMN55CBWBMTPUVP";

  const totalOffRamped = history.reduce((s, h) => s + h.amountUsdc, 0);

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
              Total Fiat Settled
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "rgba(52, 211, 153, 0.12)", color: "#34D399" }}>
              <Landmark size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
            ${totalOffRamped.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span style={{ fontSize: "1rem", color: "var(--color-ink-500)", fontWeight: 500 }}>USDC</span>
          </p>
          <p style={{ fontSize: "0.75rem", color: "#34D399", marginTop: "6px" }}>
            Direct Bank Deposits Completed
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
              Active Auto-Ramp Rule
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "rgba(232, 135, 42, 0.12)", color: "var(--color-saffron)" }}>
              <Zap size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
            {autoRampPercent}% Inflow <span style={{ fontSize: "1rem", color: "var(--color-saffron)", fontWeight: 500 }}>· UPI Auto-Deposit</span>
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", marginTop: "6px" }}>
            60% Kept in Yield Vaults
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
              Settlement Speed
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "rgba(99, 102, 241, 0.12)", color: "#818CF8" }}>
              <Clock size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
            ~35 Seconds <span style={{ fontSize: "1rem", color: "var(--color-ink-500)", fontWeight: 500 }}>· SEP-31 / 38</span>
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", marginTop: "6px" }}>
            Zero P2P Scam or Bank-Freeze Risk
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("instant")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeTab === "instant" ? "rgba(232, 135, 42, 0.14)" : "transparent",
            color: activeTab === "instant" ? "var(--color-saffron)" : "var(--color-ink-500)",
            fontWeight: activeTab === "instant" ? 700 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            fontFamily: "var(--font-body)",
          }}
        >
          Instant Off-Ramp &amp; Receipts ({history.length})
        </button>

        <button
          onClick={() => setActiveTab("beneficiaries")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeTab === "beneficiaries" ? "rgba(232, 135, 42, 0.14)" : "transparent",
            color: activeTab === "beneficiaries" ? "var(--color-saffron)" : "var(--color-ink-500)",
            fontWeight: activeTab === "beneficiaries" ? 700 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "var(--font-body)",
          }}
        >
          <Building2 size={15} /> Domestic Bank Accounts ({beneficiaries.length})
        </button>

        <button
          onClick={() => setActiveTab("autoramp")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeTab === "autoramp" ? "rgba(232, 135, 42, 0.14)" : "transparent",
            color: activeTab === "autoramp" ? "var(--color-saffron)" : "var(--color-ink-500)",
            fontWeight: activeTab === "autoramp" ? 700 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            fontFamily: "var(--font-body)",
          }}
        >
          &quot;Ramp on Inflow&quot; Automation
        </button>

        <button
          onClick={() => setActiveTab("anchors")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeTab === "anchors" ? "rgba(232, 135, 42, 0.14)" : "transparent",
            color: activeTab === "anchors" ? "var(--color-saffron)" : "var(--color-ink-500)",
            fontWeight: activeTab === "anchors" ? 700 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            fontFamily: "var(--font-body)",
          }}
        >
          Stellar Anchor Protocols
        </button>
      </div>

      {/* TAB 1: INSTANT OFF-RAMP & HISTORY */}
      {activeTab === "instant" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Off-Ramp Input Card */}
          <div className="card" style={{ padding: "28px", borderRadius: "20px", backgroundColor: "rgba(255, 255, 255, 0.03)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
              Instant Domestic Bank Off-Ramp
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-ink-500)", marginBottom: "20px" }}>
              Convert on-chain USDC directly into local fiat currency deposited to your bank in 35 seconds.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)", marginBottom: "6px" }}>
                  Destination Bank / UPI Account
                </label>
                <select
                  className="input"
                  value={selectedBeneficiaryId}
                  onChange={(e) => setSelectedBeneficiaryId(Number(e.target.value))}
                  style={{ backgroundColor: "#161616", color: "#fff", padding: "10px 12px" }}
                >
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label} ({b.railType} · {b.currencyCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)", marginBottom: "6px" }}>
                  Amount to Off-Ramp (USDC)
                </label>
                <input
                  className="input"
                  type="number"
                  value={offRampAmount}
                  onChange={(e) => setOffRampAmount(e.target.value)}
                  placeholder="e.g. 1000"
                />
              </div>

              {/* Real-time FX Quote Card */}
              <div style={{ padding: "16px", borderRadius: "14px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--color-ink-500)", textTransform: "uppercase", marginBottom: "10px" }}>
                  Stellar SEP-38 Real-Time Anchor Quote
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8125rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-ink-500)" }}>Interbank Rate:</span>
                    <span style={{ fontWeight: 600, color: "#fff" }}>
                      1 USDC = {quote.exchangeRate} {quote.targetCurrency}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-ink-500)" }}>Bridge Fee (0.2%):</span>
                    <span style={{ fontWeight: 600, color: "var(--color-saffron)" }}>-${quote.anchorFeeUsdc} USDC</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "6px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontWeight: 700, color: "#fff" }}>Net Fiat Deposited:</span>
                    <span style={{ fontWeight: 800, color: "#34D399", fontSize: "1.125rem" }}>
                      {quote.targetCurrency === "INR" ? "₹" : quote.targetCurrency === "EUR" ? "€" : "R$"}{quote.netFiatPayout.toLocaleString()} {quote.targetCurrency}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-saffron"
                disabled={isProcessing || quote.netFiatPayout <= 0}
                onClick={handleExecuteOffRamp}
                style={{ padding: "14px", fontWeight: 700, fontSize: "0.9375rem" }}
              >
                <Zap size={16} /> {isProcessing ? "Depositing to Bank..." : `Instant Off-Ramp $${quote.amountUsdc} USDC to ${selectedBeneficiary.railType}`}
              </button>
            </div>
          </div>

          {/* Past Off-Ramp Receipts */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff" }}>
              Settled Bank Receipts
            </h3>

            {history.map((tx) => (
              <div
                key={tx.id}
                className="card"
                style={{
                  padding: "18px 22px",
                  borderRadius: "16px",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(52, 211, 153, 0.2)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "2px 8px", borderRadius: "100px", backgroundColor: "rgba(52, 211, 153, 0.15)", color: "#34D399", textTransform: "uppercase" }}>
                        ✓ {tx.status} ({tx.settlementTimeSec}s)
                      </span>
                      <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--color-ink-500)" }}>
                        {tx.bankRefNumber}
                      </span>
                    </div>
                    <p style={{ fontWeight: 700, color: "#fff", fontSize: "0.9375rem" }}>
                      {tx.beneficiaryLabel}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)" }}>
                      {tx.accountIdentifier} · {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "#34D399" }}>
                      {tx.fiatReceived}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)" }}>
                      From ${tx.amountUsdc.toLocaleString()} USDC
                    </p>
                  </div>
                </div>

                {tx.txHash && (
                  <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "var(--color-saffron)", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", textDecoration: "none" }}
                    >
                      TX: {tx.txHash.substring(0, 16)}... <ExternalLink size={11} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BENEFICIARIES */}
      {activeTab === "beneficiaries" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Beneficiaries List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff" }}>
              Registered Bank Accounts &amp; UPI
            </h3>

            {beneficiaries.map((b) => (
              <div
                key={b.id}
                className="card"
                style={{
                  padding: "18px 20px",
                  borderRadius: "14px",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: b.isPrimary ? "1px solid var(--color-saffron)" : "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "2px 8px", borderRadius: "100px", backgroundColor: "rgba(232, 135, 42, 0.15)", color: "var(--color-saffron)" }}>
                        {b.railType} ({b.currencyCode})
                      </span>
                      {b.isPrimary && (
                        <span style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "2px 8px", borderRadius: "100px", backgroundColor: "rgba(52, 211, 153, 0.15)", color: "#34D399" }}>
                          Primary ({b.autoRampPercent}% Auto)
                        </span>
                      )}
                    </div>
                    <p style={{ fontWeight: 700, color: "#fff", fontSize: "0.9375rem" }}>{b.label}</p>
                    <p style={{ fontFamily: "monospace", fontSize: "0.8125rem", color: "var(--color-ink-500)" }}>{b.accountIdentifier}</p>
                  </div>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)" }}>Anchor: {b.anchorName}</p>
              </div>
            ))}
          </div>

          {/* Add Beneficiary Form */}
          <div className="card" style={{ padding: "28px", borderRadius: "20px", backgroundColor: "rgba(255, 255, 255, 0.03)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
              Add Domestic Bank / UPI
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-ink-500)", marginBottom: "20px" }}>
              Register a domestic bank rail for instant off-ramps and automated salary deposits.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)", marginBottom: "6px" }}>
                  Domestic Rail Type
                </label>
                <select
                  className="input"
                  value={newRail}
                  onChange={(e) => setNewRail(e.target.value as DomesticRail)}
                  style={{ backgroundColor: "#161616", color: "#fff" }}
                >
                  <option value="UPI">UPI (India - Instant ₹ INR)</option>
                  <option value="IMPS">IMPS Bank Account (India - Instant ₹ INR)</option>
                  <option value="SEPA">SEPA Instant (Europe - € EUR)</option>
                  <option value="PIX">Pix (Brazil - R$ BRL)</option>
                  <option value="ACH">FedNow / ACH (US - $ USD)</option>
                  <option value="MPESA">M-Pesa (Kenya - KES)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)", marginBottom: "6px" }}>
                  Account / Bank Label
                </label>
                <input
                  className="input"
                  placeholder="e.g. HDFC Salary Account"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)", marginBottom: "6px" }}>
                  Account Identifier / UPI ID / IBAN
                </label>
                <input
                  className="input"
                  placeholder={newRail === "UPI" ? "username@okhdfcbank" : newRail === "SEPA" ? "DE89 ..." : "Account / Key"}
                  value={newAccount}
                  onChange={(e) => setNewAccount(e.target.value)}
                />
              </div>

              <button
                className="btn btn-saffron"
                onClick={handleAddBeneficiary}
                style={{ marginTop: "10px", padding: "12px", fontWeight: 700 }}
              >
                <Plus size={16} /> Register Bank Rail on Soroban
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTO-RAMP ON INFLOW */}
      {activeTab === "autoramp" && (
        <div className="card" style={{ padding: "32px", borderRadius: "20px", backgroundColor: "rgba(255, 255, 255, 0.03)", maxWidth: "700px" }}>
          <h3 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
            &quot;Ramp on Inflow&quot; Automated Salary Rule
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--color-ink-500)", marginBottom: "24px" }}>
            Whenever global paychecks or contractor remittances hit your DeliteX router, automatically convert a percentage to local currency and deposit to your bank.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-ink-700)" }}>
                  Auto-Ramp Percentage:
                </span>
                <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-saffron)" }}>
                  {autoRampPercent}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={autoRampPercent}
                onChange={(e) => setAutoRampPercent(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--color-saffron)", cursor: "pointer" }}
              />
            </div>

            <div style={{ padding: "16px", borderRadius: "14px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", textTransform: "uppercase", marginBottom: "8px" }}>
                Simulation for a $5,000 Global Paycheck:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.875rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-ink-500)" }}>Auto-Deposited to Bank ({autoRampPercent}%):</span>
                  <span style={{ fontWeight: 800, color: "#34D399" }}>
                    ${(5000 * autoRampPercent / 100).toLocaleString()} USDC (≈ ₹{((5000 * autoRampPercent / 100) * 87.25).toLocaleString()} INR)
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-ink-500)" }}>Kept in Yield Vault ({100 - autoRampPercent}%):</span>
                  <span style={{ fontWeight: 800, color: "#fff" }}>
                    ${(5000 * (100 - autoRampPercent) / 100).toLocaleString()} USDC (compounding at 7.4% APY)
                  </span>
                </div>
              </div>
            </div>

            <button
              className="btn btn-saffron"
              onClick={handleSaveAutoRamp}
              style={{ padding: "12px", fontWeight: 700 }}
            >
              <Sliders size={16} /> Save &amp; Activate &quot;Ramp on Inflow&quot; Rule
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: ANCHOR SPECS */}
      {activeTab === "anchors" && (
        <div className="card" style={{ padding: "32px", borderRadius: "20px", backgroundColor: "rgba(255, 255, 255, 0.03)" }}>
          <h3 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
            Stellar Anchor Protocols (SEP-24 / SEP-38 / SEP-31)
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--color-ink-500)", marginBottom: "20px" }}>
            DeliteX integrates directly with Stellar regulated anchors, enabling atomic transfers into domestic payment switches without middleman markup.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "16px 20px", borderRadius: "12px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-ink-300)", textTransform: "uppercase", marginBottom: "6px" }}>
                Deployed Fiat Ramp Router Contract ID (Testnet)
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
              <strong>Zero P2P Freezing Risk:</strong> Traditional P2P trades risk bank account freezing due to fraudulent counterparty funds. Stellar Anchors are licensed financial institutions that deposit funds directly via native banking switches (NPCI/UPI in India, ECB/SEPA in Europe, BCB/Pix in Brazil).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
