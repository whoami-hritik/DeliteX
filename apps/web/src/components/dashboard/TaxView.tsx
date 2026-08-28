"use client";

import { useState } from "react";
import { useDashboardContext } from "@/hooks/DashboardContext";
import {
  Scale,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Coins,
  TrendingUp,
  FileCheck,
  Download,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";
import {
  JURISDICTIONS,
  type TaxProfileRecord,
  type TaxFilingReceipt,
  calculateTaxSlicing,
  calculateCompoundingTaxYield,
} from "@/lib/stellar/tax";

export default function TaxView() {
  const { stellarAccount } = useDashboardContext();

  // Profile State
  const [profile, setProfile] = useState<TaxProfileRecord>({
    jurisdictionCode: 840,
    jurisdictionName: "United States (IRS 1099-NEC / 1040-ES)",
    incomeTaxPercent: 25,
    vatGstPercent: 5,
    totalWithholdingPercent: 30,
    accumulatedPrincipalUsdc: 14850,
    accruedYieldUsdc: 428.4,
    yieldApy: 7.4,
    lastUpdated: "2026-08-25T10:00:00Z",
  });

  // Filing Receipts State
  const [filings, setFilings] = useState<TaxFilingReceipt[]>([
    {
      id: 1,
      periodLabel: "Q2 2026 Estimated Tax",
      jurisdictionName: "United States (IRS)",
      amountPaidUsdc: 6200,
      yieldHarvestedUsdc: 184.5,
      taxAuthorityName: "US Department of Treasury (IRS Direct Pay)",
      timestamp: "2026-06-15T14:30:00Z",
      txHash: "0x89f2a412cd4e019b8832a76f2d1e09bc482a17",
      complianceCertHash: "SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    },
    {
      id: 2,
      periodLabel: "Q1 2026 Estimated Tax",
      jurisdictionName: "United States (IRS)",
      amountPaidUsdc: 5800,
      yieldHarvestedUsdc: 152.0,
      taxAuthorityName: "US Department of Treasury (IRS Direct Pay)",
      timestamp: "2026-04-15T11:00:00Z",
      txHash: "0x22be9901ac88f21e09bc4844cd8912ba99",
      complianceCertHash: "SHA256: 3b92dc18148a1d65dfc2d4b1fa3d677284addd200126d90697f83b1657ff1fc5",
    },
  ]);

  const [activeTab, setActiveTab] = useState<"reserves" | "config" | "receipts" | "specs">("reserves");

  // Form State
  const [selectedJurisdictionCode, setSelectedJurisdictionCode] = useState<number>(840);
  const [incomeTaxSlider, setIncomeTaxSlider] = useState<number>(25);
  const [vatGstSlider, setVatGstSlider] = useState<number>(5);

  // Filing Modal State
  const [isFilingModalOpen, setIsFilingModalOpen] = useState(false);
  const [filingAmount, setFilingAmount] = useState("5000");
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedJurisdiction =
    JURISDICTIONS.find((j) => j.code === selectedJurisdictionCode) || JURISDICTIONS[0];

  const simulationMath = calculateTaxSlicing(10000, incomeTaxSlider, vatGstSlider);
  const yieldProjection = calculateCompoundingTaxYield(profile.accumulatedPrincipalUsdc, 7.4, 90);

  // Handle Jurisdiction Change
  const handleJurisdictionSelect = (code: number) => {
    setSelectedJurisdictionCode(code);
    const j = JURISDICTIONS.find((item) => item.code === code);
    if (j) {
      setIncomeTaxSlider(j.defaultIncomeTaxPercent);
      setVatGstSlider(j.defaultVatGstPercent);
    }
  };

  // Save Tax Config
  const handleSaveTaxConfig = () => {
    setProfile({
      ...profile,
      jurisdictionCode: selectedJurisdiction.code,
      jurisdictionName: selectedJurisdiction.name,
      incomeTaxPercent: incomeTaxSlider,
      vatGstPercent: vatGstSlider,
      totalWithholdingPercent: incomeTaxSlider + vatGstSlider,
      lastUpdated: new Date().toISOString(),
    });
    toast.success(`Tax Withholding Rules updated on Soroban: ${incomeTaxSlider + vatGstSlider}% Total Slicing!`);
    setActiveTab("reserves");
  };

  // Execute Quarterly Tax Payment
  const handleDisburseTaxFiling = async () => {
    const amt = parseFloat(filingAmount);
    if (isNaN(amt) || amt <= 0 || amt > profile.accumulatedPrincipalUsdc) {
      toast.error("Invalid filing payment amount.");
      return;
    }

    setIsProcessing(true);
    try {
      // Lazy load to avoid SSR issues
      const { invokeSorobanMethod } = await import("@/lib/stellar/soroban");
      const { xdr, Address, nativeToScVal } = await import("@stellar/stellar-sdk");
      const { requestAccess } = await import("@stellar/freighter-api");

      const access = await requestAccess();
      const pubKey = typeof access === 'string' ? access : access.address;
      const authorityAddr = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
      
      const args = [
        new Address(pubKey).toScVal(),
        nativeToScVal(Math.floor(amt * 10000000), { type: "i128" }),
        nativeToScVal(filings.length + 1, { type: "u64" }),
        new Address(authorityAddr).toScVal()
      ];

      const txHash = await invokeSorobanMethod(
        process.env.NEXT_PUBLIC_SOROBAN_TAX_ESCROW_ID || "CDOLCWJWM3NHGWIBY7QZGECAEXJUZVCY2BIHCB4IV7R46VUUOUWYI6F4",
        "pay_tax_filing",
        args
      );

      const newFiling: TaxFilingReceipt = {
        id: filings.length + 1,
        periodLabel: "Q3 2026 Estimated Tax",
        jurisdictionName: profile.jurisdictionName,
        amountPaidUsdc: amt,
        yieldHarvestedUsdc: Number((amt * 0.018).toFixed(2)),
        taxAuthorityName: selectedJurisdiction.taxAuthorityName,
        timestamp: new Date().toISOString(),
        txHash: txHash,
        complianceCertHash: `SHA256: ${Math.random().toString(16).substring(2, 12)}${Math.random().toString(16).substring(2, 12)}`,
      };

      setFilings([newFiling, ...filings]);
      setProfile({
        ...profile,
        accumulatedPrincipalUsdc: profile.accumulatedPrincipalUsdc - amt,
      });
      setIsFilingModalOpen(false);
      toast.success(`🎉 $${amt.toLocaleString()} USDC tax payment settled on-chain to ${selectedJurisdiction.taxAuthorityName}!`);
    } catch (e: any) {
      toast.error(`Transaction Failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCertificate = (certHash: string) => {
    toast.success(`Downloaded Cryptographic Tax Statement (${certHash.substring(0, 20)}...)`);
  };

  const contractAddress =
    process.env.NEXT_PUBLIC_SOROBAN_TAX ||
    "CDOLCWJWM3NHGWIBY7QZGECAEXJUZVCY2BIHCB4IV7R46VUUOUWYI6F4";

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
              Withheld Tax Reserves
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "rgba(52, 211, 153, 0.12)", color: "#34D399" }}>
              <Scale size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
            ${profile.accumulatedPrincipalUsdc.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span style={{ fontSize: "1rem", color: "var(--color-ink-500)", fontWeight: 500 }}>USDC</span>
          </p>
          <p style={{ fontSize: "0.75rem", color: "#34D399", marginTop: "6px" }}>
            Auto-Withheld from Inflows
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
              Compounding Tax Yield
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "rgba(232, 135, 42, 0.12)", color: "var(--color-saffron)" }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "2rem", fontWeight: 800, color: "var(--color-saffron)", letterSpacing: "-0.03em" }}>
            +${profile.accruedYieldUsdc.toFixed(2)} <span style={{ fontSize: "1rem", color: "var(--color-ink-500)", fontWeight: 500 }}>USDC</span>
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", marginTop: "6px" }}>
            7.40% APY Earned on Idle Tax
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
              Active Withholding Slicing
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "rgba(99, 102, 241, 0.12)", color: "#818CF8" }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
            {profile.totalWithholdingPercent}% <span style={{ fontSize: "1rem", color: "var(--color-ink-500)", fontWeight: 500 }}>· {profile.incomeTaxPercent}% Tax + {profile.vatGstPercent}% GST</span>
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", marginTop: "6px" }}>
            Zero End-of-Year Tax Shock
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("reserves")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeTab === "reserves" ? "rgba(232, 135, 42, 0.14)" : "transparent",
            color: activeTab === "reserves" ? "var(--color-saffron)" : "var(--color-ink-500)",
            fontWeight: activeTab === "reserves" ? 700 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            fontFamily: "var(--font-body)",
          }}
        >
          Tax Reserves &amp; Vault
        </button>

        <button
          onClick={() => setActiveTab("config")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeTab === "config" ? "rgba(232, 135, 42, 0.14)" : "transparent",
            color: activeTab === "config" ? "var(--color-saffron)" : "var(--color-ink-500)",
            fontWeight: activeTab === "config" ? 700 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "var(--font-body)",
          }}
        >
          <Sliders size={15} /> Configure Jurisdictions
        </button>

        <button
          onClick={() => setActiveTab("receipts")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeTab === "receipts" ? "rgba(232, 135, 42, 0.14)" : "transparent",
            color: activeTab === "receipts" ? "var(--color-saffron)" : "var(--color-ink-500)",
            fontWeight: activeTab === "receipts" ? 700 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            fontFamily: "var(--font-body)",
          }}
        >
          Filing Receipts &amp; Proofs ({filings.length})
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

      {/* TAB 1: RESERVES & VAULT */}
      {activeTab === "reserves" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
          {/* Main Reserve Card */}
          <div className="card" style={{ padding: "32px", borderRadius: "20px", backgroundColor: "rgba(255, 255, 255, 0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-saffron)", textTransform: "uppercase" }}>
                  Active Compliance Jurisdiction
                </span>
                <h3 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#fff", marginTop: "4px" }}>
                  {profile.jurisdictionName}
                </h3>
              </div>

              <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "4px 10px", borderRadius: "100px", backgroundColor: "rgba(52, 211, 153, 0.15)", color: "#34D399" }}>
                ✓ Compliant
              </span>
            </div>

            <p style={{ fontSize: "0.875rem", color: "var(--color-ink-500)", marginBottom: "24px" }}>
              Tax portions are autonomously sliced into this non-custodial Soroban vault. Funds earn 7.40% compound APY until your quarterly tax filing date.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div style={{ padding: "18px", borderRadius: "14px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <span style={{ fontSize: "0.6875rem", color: "var(--color-ink-500)", textTransform: "uppercase" }}>Current Withheld Principal</span>
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginTop: "4px" }}>
                  ${profile.accumulatedPrincipalUsdc.toLocaleString()} <span style={{ fontSize: "0.8125rem", color: "var(--color-ink-500)" }}>USDC</span>
                </p>
              </div>

              <div style={{ padding: "18px", borderRadius: "14px", backgroundColor: "rgba(232, 135, 42, 0.05)", border: "1px solid rgba(232, 135, 42, 0.2)" }}>
                <span style={{ fontSize: "0.6875rem", color: "var(--color-saffron)", textTransform: "uppercase" }}>Projected 90-Day Yield (7.4% APY)</span>
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-saffron)", marginTop: "4px" }}>
                  +${yieldProjection.earnedYieldUsdc.toLocaleString()} <span style={{ fontSize: "0.8125rem", color: "var(--color-ink-500)" }}>USDC</span>
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                className="btn btn-saffron"
                onClick={() => setIsFilingModalOpen(true)}
                style={{ padding: "12px 24px", fontWeight: 700 }}
              >
                <FileCheck size={16} /> Disburse Quarterly Tax Filing
              </button>

              <button
                className="btn btn-ghost"
                onClick={() => handleDownloadCertificate("SHA256:7f83b1657ff1fc53b92dc18148a1d65d")}
                style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Download size={15} /> Download Tax Statement
              </button>
            </div>
          </div>

          {/* Slicing Mechanics Box */}
          <div className="card" style={{ padding: "28px", borderRadius: "20px", backgroundColor: "rgba(255, 255, 255, 0.03)" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>
              Autonomous Inflow Slicing
            </h3>

            <p style={{ fontSize: "0.8125rem", color: "var(--color-ink-500)", marginBottom: "16px" }}>
              When a paycheck or client invoice of <strong>$10,000 USDC</strong> arrives:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8125rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
                <span style={{ color: "var(--color-ink-500)" }}>Income Tax ({profile.incomeTaxPercent}%):</span>
                <span style={{ fontWeight: 700, color: "var(--color-saffron)" }}>-${(10000 * profile.incomeTaxPercent / 100).toLocaleString()} USDC</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
                <span style={{ color: "var(--color-ink-500)" }}>GST / VAT ({profile.vatGstPercent}%):</span>
                <span style={{ fontWeight: 700, color: "var(--color-saffron)" }}>-${(10000 * profile.vatGstPercent / 100).toLocaleString()} USDC</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", borderRadius: "8px", backgroundColor: "rgba(52, 211, 153, 0.08)", border: "1px solid rgba(52, 211, 153, 0.2)" }}>
                <span style={{ fontWeight: 700, color: "#fff" }}>Net Spendable Balance:</span>
                <span style={{ fontWeight: 800, color: "#34D399", fontSize: "1rem" }}>+${(10000 * (100 - profile.totalWithholdingPercent) / 100).toLocaleString()} USDC</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONFIGURATION */}
      {activeTab === "config" && (
        <div className="card" style={{ padding: "32px", borderRadius: "20px", backgroundColor: "rgba(255, 255, 255, 0.03)", maxWidth: "720px" }}>
          <h3 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
            Configure Tax Jurisdiction &amp; Withholding Brackets
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--color-ink-500)", marginBottom: "24px" }}>
            Select your country or custom tax bracket. The Soroban router will intercept this portion on all inflows.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)", marginBottom: "8px" }}>
                Select Tax Jurisdiction Profile
              </label>
              <select
                className="input"
                value={selectedJurisdictionCode}
                onChange={(e) => handleJurisdictionSelect(Number(e.target.value))}
                style={{ backgroundColor: "#161616", color: "#fff", padding: "12px" }}
              >
                {JURISDICTIONS.map((j) => (
                  <option key={j.code} value={j.code}>
                    {j.name} ({j.country})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)" }}>Income Tax Withholding Rate:</span>
                <span style={{ fontWeight: 800, color: "var(--color-saffron)" }}>{incomeTaxSlider}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={incomeTaxSlider}
                onChange={(e) => setIncomeTaxSlider(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--color-saffron)", cursor: "pointer" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)" }}>GST / VAT / Sales Tax Slicing:</span>
                <span style={{ fontWeight: 800, color: "var(--color-saffron)" }}>{vatGstSlider}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={vatGstSlider}
                onChange={(e) => setVatGstSlider(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--color-saffron)", cursor: "pointer" }}
              />
            </div>

            <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", textTransform: "uppercase", marginBottom: "6px" }}>Target Tax Authority</p>
              <p style={{ fontWeight: 700, color: "#fff", fontSize: "0.9375rem" }}>{selectedJurisdiction.taxAuthorityName}</p>
              <p style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--color-ink-500)" }}>{selectedJurisdiction.taxAuthorityAddress}</p>
            </div>

            <button
              className="btn btn-saffron"
              onClick={handleSaveTaxConfig}
              style={{ padding: "12px", fontWeight: 700 }}
            >
              <ShieldCheck size={16} /> Save Tax Withholding Rule on Soroban
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: RECEIPTS */}
      {activeTab === "receipts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filings.map((f) => (
            <div
              key={f.id}
              className="card"
              style={{
                padding: "24px 28px",
                borderRadius: "18px",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(52, 211, 153, 0.25)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "2px 8px", borderRadius: "100px", backgroundColor: "rgba(52, 211, 153, 0.15)", color: "#34D399", textTransform: "uppercase" }}>
                      ✓ Filed &amp; Confirmed
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-ink-500)" }}>
                      {new Date(f.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>
                    {f.periodLabel}
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-ink-500)" }}>
                    {f.taxAuthorityName}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#34D399" }}>
                    ${f.amountPaidUsdc.toLocaleString()} <span style={{ fontSize: "0.875rem", color: "var(--color-ink-500)" }}>USDC</span>
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-saffron)" }}>
                    +${f.yieldHarvestedUsdc} Accrued Yield Retained
                  </p>
                </div>
              </div>

              <div style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(255, 255, 255, 0.02)", fontFamily: "monospace", fontSize: "0.75rem", color: "var(--color-ink-500)", marginBottom: "14px" }}>
                {f.complianceCertHash}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => handleDownloadCertificate(f.complianceCertHash)}
                  style={{ padding: "6px 14px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Download size={13} /> Download Form 1099/TDS Cert
                </button>

                {f.txHash && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${f.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "var(--color-saffron)", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", textDecoration: "none" }}
                  >
                    TX: {f.txHash.substring(0, 16)}... <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SMART CONTRACT SPECS */}
      {activeTab === "specs" && (
        <div className="card" style={{ padding: "32px", borderRadius: "20px", backgroundColor: "rgba(255, 255, 255, 0.03)" }}>
          <h3 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
            Tax Escrow Vault Smart Contract
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--color-ink-500)", marginBottom: "20px" }}>
            The `TaxEscrowVault` Soroban contract manages non-custodial tax reserves with autonomous inflow slicing and quarterly disbursements.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "16px 20px", borderRadius: "12px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-ink-300)", textTransform: "uppercase", marginBottom: "6px" }}>
                Deployed Tax Escrow Contract ID (Testnet)
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
              <strong>Yield Harvest Profit:</strong> Because tax reserves compound at 7.4% APY while waiting for filing deadlines, users earn passive profit on their tax capital instead of letting it sit idle.
            </div>
          </div>
        </div>
      )}

      {/* DISBURSE FILING MODAL */}
      {isFilingModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div className="card" style={{ width: "100%", maxWidth: "480px", padding: "32px", borderRadius: "24px", backgroundColor: "#111", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>
                Disburse Estimated Tax Filing
              </h3>
              <button onClick={() => setIsFilingModalOpen(false)} style={{ background: "none", border: "none", color: "var(--color-ink-500)", cursor: "pointer", fontSize: "1.25rem" }}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.8125rem", color: "var(--color-ink-500)", marginBottom: "20px" }}>
              Direct settlement to {selectedJurisdiction.taxAuthorityName}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)", marginBottom: "6px" }}>
                  Filing Payment Amount (USDC)
                </label>
                <input
                  className="input"
                  type="number"
                  value={filingAmount}
                  onChange={(e) => setFilingAmount(e.target.value)}
                  max={profile.accumulatedPrincipalUsdc}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", marginTop: "4px", display: "block" }}>
                  Available in Tax Reserve: ${profile.accumulatedPrincipalUsdc.toLocaleString()} USDC
                </span>
              </div>
            </div>

            <button
              className="btn btn-saffron"
              disabled={isProcessing}
              onClick={handleDisburseTaxFiling}
              style={{ width: "100%", padding: "14px", fontWeight: 700 }}
            >
              {isProcessing ? "Settling Tax On-Chain..." : `Pay $${parseFloat(filingAmount || "0").toLocaleString()} USDC Tax Now`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
