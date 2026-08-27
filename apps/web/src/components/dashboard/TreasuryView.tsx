"use client";

import { useState } from "react";
import { useDashboardContext } from "@/hooks/DashboardContext";
import {
  Building2,
  Users,
  ShieldCheck,
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Send,
  AlertCircle,
  FileCheck2,
  Trash2,
} from "lucide-react";
import { parsePayrollCsv, shortenAddress, type PayoutItem, type PayrollProposal } from "@/lib/stellar/treasury";
import { toast } from "sonner";

export default function TreasuryView() {
  const { stellarAccount } = useDashboardContext();
  const currentAddress = stellarAccount?.publicKey || "";

  // Initial Mock Treasury State for Interactive Testing
  const [threshold] = useState(2);
  const [owners] = useState([
    currentAddress || "GA74QW...DELITEX1",
    "GB89K2PQLMXW9A3CV4B7890123456789012345678901234567890123",
    "GC12N8M9K4P2Q5W6E7R8T9Y0U1I2O3P4A5S6D7F8G9H0J1K2L3Z4X5C6",
  ]);

  const [treasuryBalance, setTreasuryBalance] = useState(35000);

  const [proposals, setProposals] = useState<PayrollProposal[]>([
    {
      id: 1,
      title: "August Global Core Team Payroll",
      proposer: currentAddress || "GA74QW...DELITEX1",
      totalAmountUsdc: 7400,
      threshold: 2,
      approvals: [currentAddress || "GA74QW...DELITEX1"],
      executed: false,
      createdAt: "2026-08-27T10:00:00Z",
      deadline: "2026-08-31T23:59:59Z",
      items: [
        {
          name: "Alex Rivera (Lead Engineer)",
          recipient: "GD74QW12345678901234567890123456789012345678901234567890",
          amountUsdc: 3200,
        },
        {
          name: "Sarah Chen (UI/UX Designer)",
          recipient: "GB89K212345678901234567890123456789012345678901234567890",
          amountUsdc: 2400,
        },
        {
          name: "Devin Vance (Smart Contracts)",
          recipient: "GC12N812345678901234567890123456789012345678901234567890",
          amountUsdc: 1800,
        },
      ],
    },
  ]);

  // Form State for New Batch
  const [activeTab, setActiveTab] = useState<"proposals" | "create" | "governance">("proposals");
  const [newTitle, setNewTitle] = useState("");
  const [csvRaw, setCsvRaw] = useState("");
  const [parsedItems, setParsedItems] = useState<PayoutItem[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [manualName, setManualName] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle CSV Parsing
  const handleCsvChange = (text: string) => {
    setCsvRaw(text);
    if (!text.trim()) {
      setParsedItems([]);
      setParseErrors([]);
      return;
    }
    const { items, errors } = parsePayrollCsv(text);
    setParsedItems(items);
    setParseErrors(errors);
  };

  // Add Manual Recipient Row
  const handleAddManual = () => {
    if (!manualAddress || !manualAmount) {
      toast.error("Please enter a Stellar address and amount.");
      return;
    }
    if (!manualAddress.startsWith("G") || manualAddress.length !== 56) {
      toast.error("Stellar address must start with 'G' and be 56 characters long.");
      return;
    }
    const amt = parseFloat(manualAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Amount must be a positive number.");
      return;
    }

    const newItem: PayoutItem = {
      name: manualName.trim() || `Contractor #${parsedItems.length + 1}`,
      recipient: manualAddress.trim(),
      amountUsdc: amt,
    };

    setParsedItems([...parsedItems, newItem]);
    setManualName("");
    setManualAddress("");
    setManualAmount("");
    toast.success("Recipient added to batch.");
  };

  const handleRemoveItem = (index: number) => {
    const updated = parsedItems.filter((_, i) => i !== index);
    setParsedItems(updated);
  };

  // Submit Proposal
  const handleCreateProposal = () => {
    if (!newTitle.trim()) {
      toast.error("Please enter a proposal title.");
      return;
    }
    if (parsedItems.length === 0) {
      toast.error("Please add at least one recipient to the payroll batch.");
      return;
    }

    const totalAmt = parsedItems.reduce((s, item) => s + item.amountUsdc, 0);
    if (totalAmt > treasuryBalance) {
      toast.error(`Insufficient treasury funds. Batch requires $${totalAmt.toLocaleString()} USDC.`);
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const newProposal: PayrollProposal = {
        id: proposals.length + 1,
        title: newTitle.trim(),
        proposer: currentAddress || "GA74QW...DELITEX1",
        totalAmountUsdc: totalAmt,
        threshold: 2,
        approvals: [currentAddress || "GA74QW...DELITEX1"],
        executed: false,
        createdAt: new Date().toISOString(),
        deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
        items: parsedItems,
      };

      setProposals([newProposal, ...proposals]);
      setNewTitle("");
      setCsvRaw("");
      setParsedItems([]);
      setActiveTab("proposals");
      setIsProcessing(false);
      toast.success("Batch payroll proposal submitted to Soroban multisig!");
    }, 600);
  };

  // Approve Proposal
  const handleApprove = (proposalId: number) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          const approverKey = currentAddress || "GA74QW...DELITEX1";
          if (p.approvals.includes(approverKey)) {
            // Mock signing with second owner for testing
            const secondOwner = owners[1];
            if (!p.approvals.includes(secondOwner)) {
              toast.success(`Signed and approved by executive owner (${shortenAddress(secondOwner)})`);
              return { ...p, approvals: [...p.approvals, secondOwner] };
            }
            toast.info("Your wallet has already approved this proposal.");
            return p;
          }
          toast.success("Proposal approved on-chain!");
          return { ...p, approvals: [...p.approvals, approverKey] };
        }
        return p;
      })
    );
  };

  // Execute Batch Payroll
  const handleExecute = (proposalId: number) => {
    setIsProcessing(true);
    setTimeout(() => {
      setProposals((prev) =>
        prev.map((p) => {
          if (p.id === proposalId) {
            setTreasuryBalance((b) => b - p.totalAmountUsdc);
            toast.success(`Batch payroll executed! Disbursed $${p.totalAmountUsdc.toLocaleString()} USDC across ${p.items.length} contractors.`);
            return {
              ...p,
              executed: true,
              txHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
            };
          }
          return p;
        })
      );
      setIsProcessing(false);
    }, 1000);
  };

  const totalCalculatedBatch = parsedItems.reduce((s, item) => s + item.amountUsdc, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Top Header Metrics */}
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
              Treasury Reserve
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "rgba(52, 211, 153, 0.12)", color: "#34D399" }}>
              <Building2 size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
            ${treasuryBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span style={{ fontSize: "1rem", color: "var(--color-ink-500)", fontWeight: 500 }}>USDC</span>
          </p>
          <p style={{ fontSize: "0.75rem", color: "#34D399", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
            <CheckCircle2 size={12} /> Soroban Smart Vault Verified
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
              Multi-Sig Governance
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "rgba(232, 135, 42, 0.12)", color: "var(--color-saffron)" }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
            {threshold} of {owners.length} <span style={{ fontSize: "1rem", color: "var(--color-ink-500)", fontWeight: 500 }}>Signatures</span>
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", marginTop: "6px" }}>
            M-of-N Cryptographic Consensus
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
              Active Batches
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "rgba(99, 102, 241, 0.12)", color: "#818CF8" }}>
              <Users size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
            {proposals.filter((p) => !p.executed).length}{" "}
            <span style={{ fontSize: "1rem", color: "var(--color-ink-500)", fontWeight: 500 }}>Pending Execution</span>
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", marginTop: "6px" }}>
            Atomic Stellar Settlement
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("proposals")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeTab === "proposals" ? "rgba(232, 135, 42, 0.14)" : "transparent",
            color: activeTab === "proposals" ? "var(--color-saffron)" : "var(--color-ink-500)",
            fontWeight: activeTab === "proposals" ? 700 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            fontFamily: "var(--font-body)",
          }}
        >
          Active Payroll Proposals ({proposals.length})
        </button>

        <button
          onClick={() => setActiveTab("create")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeTab === "create" ? "rgba(232, 135, 42, 0.14)" : "transparent",
            color: activeTab === "create" ? "var(--color-saffron)" : "var(--color-ink-500)",
            fontWeight: activeTab === "create" ? 700 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "var(--font-body)",
          }}
        >
          <Plus size={15} /> Create Batch Payroll
        </button>

        <button
          onClick={() => setActiveTab("governance")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeTab === "governance" ? "rgba(232, 135, 42, 0.14)" : "transparent",
            color: activeTab === "governance" ? "var(--color-saffron)" : "var(--color-ink-500)",
            fontWeight: activeTab === "governance" ? 700 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            fontFamily: "var(--font-body)",
          }}
        >
          Signers & Settings
        </button>
      </div>

      {/* TAB 1: PROPOSALS */}
      {activeTab === "proposals" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {proposals.length === 0 ? (
            <div className="card" style={{ padding: "48px 20px", textAlign: "center", color: "var(--color-ink-500)" }}>
              No payroll proposals created yet. Click &quot;Create Batch Payroll&quot; to begin.
            </div>
          ) : (
            proposals.map((prop) => {
              const approvalCount = prop.approvals.length;
              const hasReachedThreshold = approvalCount >= prop.threshold;

              return (
                <div
                  key={prop.id}
                  className="card"
                  style={{
                    padding: "24px 28px",
                    borderRadius: "18px",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: prop.executed
                      ? "1px solid rgba(52, 211, 153, 0.25)"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", fontFamily: "var(--font-body)" }}>
                          {prop.title}
                        </h3>
                        {prop.executed ? (
                          <span style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "3px 8px", borderRadius: "100px", backgroundColor: "rgba(52, 211, 153, 0.15)", color: "#34D399", textTransform: "uppercase" }}>
                            Executed
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "3px 8px", borderRadius: "100px", backgroundColor: "rgba(232, 135, 42, 0.15)", color: "var(--color-saffron)", textTransform: "uppercase" }}>
                            Pending Signatures
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "0.8125rem", color: "var(--color-ink-500)", fontFamily: "var(--font-body)" }}>
                        Proposed by {shortenAddress(prop.proposer)} · {prop.items.length} Recipients · Created {new Date(prop.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", fontFamily: "var(--font-body)" }}>
                        ${prop.totalAmountUsdc.toLocaleString()} <span style={{ fontSize: "0.875rem", color: "var(--color-ink-500)" }}>USDC</span>
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)" }}>
                        ≈ ₹{(prop.totalAmountUsdc * 84.1).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Signatures Progress Visualizer */}
                  <div
                    style={{
                      padding: "16px 20px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      marginBottom: "20px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)" }}>
                        Consensus Progress: {approvalCount} of {prop.threshold} Required Signatures
                      </span>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: hasReachedThreshold ? "#34D399" : "var(--color-saffron)" }}>
                        {hasReachedThreshold ? "Threshold Satisfied" : "Awaiting Approvals"}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(255, 255, 255, 0.08)", borderRadius: "100px", overflow: "hidden", marginBottom: "12px" }}>
                      <div
                        style={{
                          width: `${Math.min(100, (approvalCount / prop.threshold) * 100)}%`,
                          height: "100%",
                          backgroundColor: hasReachedThreshold ? "#34D399" : "var(--color-saffron)",
                          borderRadius: "100px",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>

                    {/* Signers list badges */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {owners.map((owner, idx) => {
                        const hasApproved = prop.approvals.includes(owner);
                        return (
                          <div
                            key={idx}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              backgroundColor: hasApproved ? "rgba(52, 211, 153, 0.1)" : "rgba(255, 255, 255, 0.04)",
                              border: `1px solid ${hasApproved ? "rgba(52, 211, 153, 0.25)" : "rgba(255, 255, 255, 0.08)"}`,
                              fontSize: "0.75rem",
                              color: hasApproved ? "#34D399" : "var(--color-ink-500)",
                            }}
                          >
                            {hasApproved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            Owner {idx + 1} ({shortenAddress(owner)})
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recipient Item Details Accordion/List */}
                  <div style={{ marginBottom: "20px" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-ink-300)", textTransform: "uppercase", marginBottom: "8px" }}>
                      Batch Recipients ({prop.items.length})
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {prop.items.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            backgroundColor: "rgba(255, 255, 255, 0.015)",
                            fontSize: "0.8125rem",
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 600, color: "var(--color-ink-900)" }}>{item.name}</span>
                            <span style={{ color: "var(--color-ink-500)", marginLeft: "8px", fontSize: "0.75rem" }}>
                              {shortenAddress(item.recipient)}
                            </span>
                          </div>
                          <span style={{ fontWeight: 700, color: "#fff" }}>
                            ${item.amountUsdc.toLocaleString()} USDC
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {!prop.executed && (
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                      <button
                        className="btn btn-ghost"
                        onClick={() => handleApprove(prop.id)}
                        style={{ padding: "10px 20px", fontSize: "0.875rem" }}
                      >
                        <ShieldCheck size={16} /> Sign & Approve
                      </button>

                      <button
                        className="btn btn-saffron"
                        disabled={!hasReachedThreshold || isProcessing}
                        onClick={() => handleExecute(prop.id)}
                        style={{
                          padding: "10px 24px",
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          opacity: hasReachedThreshold ? 1 : 0.5,
                          cursor: hasReachedThreshold ? "pointer" : "not-allowed",
                        }}
                      >
                        <Send size={16} /> {isProcessing ? "Broadcasting to Stellar..." : "Execute Batch Disbursement"}
                      </button>
                    </div>
                  )}

                  {prop.executed && prop.txHash && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "0.75rem", color: "var(--color-ink-500)" }}>
                      <span>Disbursed via Soroban Atomic Batch Router</span>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${prop.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "var(--color-saffron)", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                      >
                        TX: {prop.txHash} <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: CREATE BATCH */}
      {activeTab === "create" && (
        <div className="card" style={{ padding: "32px", borderRadius: "20px", backgroundColor: "rgba(255, 255, 255, 0.03)" }}>
          <h3 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#fff", marginBottom: "8px", fontFamily: "var(--font-body)" }}>
            Draft New Multi-Sig Payroll Batch
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--color-ink-500)", marginBottom: "24px" }}>
            Submit a proposal to disburse payroll across multiple contractors in a single atomic transaction.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "28px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)", marginBottom: "6px" }}>
                Proposal Title
              </label>
              <input
                className="input"
                placeholder="e.g. September 2026 Engineering Payroll"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            {/* CSV Box */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)" }}>
                  Paste CSV or Spreadsheet Data (Name, Stellar Address, Amount USDC)
                </label>
                <span style={{ fontSize: "0.75rem", color: "var(--color-saffron)" }}>
                  <FileSpreadsheet size={13} style={{ display: "inline", verticalAlign: "middle" }} /> 1-Click Parser
                </span>
              </div>
              <textarea
                className="input"
                rows={4}
                placeholder={`Alex Rivera, GA74QW12345678901234567890123456789012345678901234567890, 3200\nSarah Chen, GB89K212345678901234567890123456789012345678901234567890, 2400`}
                value={csvRaw}
                onChange={(e) => handleCsvChange(e.target.value)}
                style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}
              />
            </div>

            {/* Parse Errors if any */}
            {parseErrors.length > 0 && (
              <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#F87171", fontSize: "0.8125rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, marginBottom: "4px" }}>
                  <AlertCircle size={14} /> CSV Formatting Errors:
                </div>
                {parseErrors.map((err, i) => (
                  <p key={i} style={{ margin: "2px 0" }}>• {err}</p>
                ))}
              </div>
            )}

            {/* Manual Row Adder */}
            <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-ink-500)", textTransform: "uppercase", marginBottom: "12px" }}>
                Or Add Individual Recipient
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr 1fr auto", gap: "10px", alignItems: "center" }}>
                <input
                  className="input"
                  placeholder="Contractor Name"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  style={{ padding: "8px 12px", fontSize: "0.8125rem" }}
                />
                <input
                  className="input"
                  placeholder="Stellar Public Key (G...)"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  style={{ padding: "8px 12px", fontSize: "0.8125rem", fontFamily: "monospace" }}
                />
                <input
                  className="input"
                  type="number"
                  placeholder="Amount USDC"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  style={{ padding: "8px 12px", fontSize: "0.8125rem" }}
                />
                <button
                  className="btn btn-ghost"
                  onClick={handleAddManual}
                  style={{ padding: "8px 14px", fontSize: "0.8125rem", whiteSpace: "nowrap" }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {/* Live Recipient Preview Table */}
            {parsedItems.length > 0 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff" }}>
                    Parsed Batch List ({parsedItems.length} Recipients)
                  </span>
                  <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--color-saffron)" }}>
                    Total: ${totalCalculatedBatch.toLocaleString()} USDC
                  </span>
                </div>

                <div style={{ border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", overflow: "hidden" }}>
                  {parsedItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 16px",
                        backgroundColor: idx % 2 === 0 ? "rgba(255, 255, 255, 0.015)" : "transparent",
                        borderBottom: idx < parsedItems.length - 1 ? "1px solid rgba(255, 255, 255, 0.04)" : "none",
                        fontSize: "0.8125rem",
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, color: "#fff" }}>{item.name}</span>
                        <span style={{ color: "var(--color-ink-500)", marginLeft: "10px", fontFamily: "monospace", fontSize: "0.75rem" }}>
                          {item.recipient}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span style={{ fontWeight: 700, color: "#34D399" }}>${item.amountUsdc.toLocaleString()} USDC</span>
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          style={{ background: "none", border: "none", color: "var(--color-ink-300)", cursor: "pointer" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button className="btn btn-ghost" onClick={() => setActiveTab("proposals")}>
              Cancel
            </button>
            <button
              className="btn btn-saffron"
              disabled={isProcessing || parsedItems.length === 0}
              onClick={handleCreateProposal}
              style={{ padding: "12px 28px", fontWeight: 700 }}
            >
              <FileCheck2 size={16} /> {isProcessing ? "Submitting to Soroban..." : "Submit Multi-Sig Proposal"}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: GOVERNANCE & SIGNERS */}
      {activeTab === "governance" && (
        <div className="card" style={{ padding: "32px", borderRadius: "20px", backgroundColor: "rgba(255, 255, 255, 0.03)" }}>
          <h3 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#fff", marginBottom: "8px", fontFamily: "var(--font-body)" }}>
            Multi-Sig Configuration & Threshold State
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--color-ink-500)", marginBottom: "24px" }}>
            This Soroban contract enforces that any disbursement must collect at least {threshold} valid cryptographic signatures from authorized owners.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "18px 20px", borderRadius: "12px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-ink-300)", textTransform: "uppercase", marginBottom: "12px" }}>
                Authorized Executive Signers ({owners.length})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {owners.map((owner, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      fontSize: "0.8125rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#34D399" }} />
                      <span style={{ fontFamily: "monospace", color: "#fff" }}>{owner}</span>
                    </div>
                    <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-saffron)", backgroundColor: "rgba(232, 135, 42, 0.12)", padding: "2px 8px", borderRadius: "4px" }}>
                      Owner #{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: "16px 20px", borderRadius: "12px", backgroundColor: "rgba(52, 211, 153, 0.05)", border: "1px solid rgba(52, 211, 153, 0.15)", fontSize: "0.8125rem", color: "#34D399" }}>
              <strong>Atomic Rollback Guarantee:</strong> Soroban guarantees that if any single transfer inside a batch of 100 fails (e.g. invalid trustline or freeze), the entire transaction rolls back cleanly with zero balance change.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
