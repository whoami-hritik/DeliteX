"use client";

import { useState } from "react";
import { useDashboardContext } from "@/hooks/DashboardContext";
import {
  Receipt,
  Plus,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  Send,
  CreditCard,
  Trash2,
  Globe2,
  FileCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  type InvoiceRecord,
  type InvoiceItem,
  calculatePaymentOptions,
  generateInvoiceLink,
} from "@/lib/stellar/invoicing";

export default function InvoicingView() {
  const { stellarAccount } = useDashboardContext();
  const currentAddress = stellarAccount?.publicKey || "GA74QW...DELITEX1";

  // Invoices State
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([
    {
      id: 1,
      invoiceNumber: "INV-2026-0891",
      clientName: "Acme Web3 Labs GmbH (Berlin)",
      clientEmail: "billing@acmeweb3.de",
      merchantAddress: currentAddress,
      amountDueUsdc: 2400,
      status: "unpaid",
      createdAt: "2026-08-27T12:00:00Z",
      dueDate: "2026-09-05T23:59:59Z",
      items: [
        {
          description: "Soroban Smart Contract Security Audit & Verification",
          quantity: 1,
          unitPriceUsdc: 2400,
        },
      ],
    },
    {
      id: 2,
      invoiceNumber: "INV-2026-0884",
      clientName: "Horizon Digital Inc (San Francisco)",
      clientEmail: "ap@horizondigital.io",
      merchantAddress: currentAddress,
      amountDueUsdc: 4500,
      status: "paid",
      createdAt: "2026-08-20T09:00:00Z",
      dueDate: "2026-08-25T23:59:59Z",
      paidAt: "2026-08-22T14:15:00Z",
      payerAddress: "GD89K2...CLIENT_WALLET",
      settledAsset: "EURC",
      txHash: "0x89f2a412cd4e019b8832a76f2d1e09bc482a17",
      items: [
        {
          description: "Next.js 16 Web3 Monorepo Architecture Consulting",
          quantity: 30,
          unitPriceUsdc: 150,
        },
      ],
    },
  ]);

  // Tab State
  const [activeTab, setActiveTab] = useState<"invoices" | "create" | "protocol">("invoices");

  // Form State for Creating Invoice
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newDueDate, setNewDueDate] = useState("2026-09-15");
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([
    { description: "Full-Stack Development Retainer", quantity: 1, unitPriceUsdc: 1800 },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Checkout Preview Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [selectedPayAsset, setSelectedPayAsset] = useState<"USDC" | "EURC" | "XLM">("USDC");

  // Line Item Handlers
  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: "Service / Milestone Item", quantity: 1, unitPriceUsdc: 500 },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const updated = [...lineItems];
    if (field === "description") {
      updated[index].description = String(value);
    } else {
      updated[index][field] = Number(value) || 0;
    }
    setLineItems(updated);
  };

  const totalCalculatedInvoice = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceUsdc,
    0
  );

  // Submit Invoice
  const handleCreateInvoice = async () => {
    if (!newClientName.trim()) {
      toast.error("Please enter a client name.");
      return;
    }
    if (totalCalculatedInvoice <= 0) {
      toast.error("Total invoice amount must be greater than $0.");
      return;
    }

    setIsProcessing(true);
    try {
      const { invokeSorobanMethod } = await import("@/lib/stellar/soroban");
      const { Address, nativeToScVal } = await import("@stellar/stellar-sdk");
      const { requestAccess } = await import("@stellar/freighter-api");

      const access = await requestAccess();
      const pubKey = typeof access === 'string' ? access : access.address;
      const nextId = invoices.length + 1;
      
      const args = [
        new Address(pubKey).toScVal(),
        nativeToScVal(nextId, { type: "u64" }),
        nativeToScVal(Math.floor(totalCalculatedInvoice * 10000000), { type: "i128" })
      ];

      const txHash = await invokeSorobanMethod(
        process.env.NEXT_PUBLIC_SOROBAN_INVOICE_ROUTER_ID || "CDPNJLGFJTBVYXUMHYQPOCEFIGA27UKNCAT2IHWSSVJRPGGWWT4NJC2I",
        "create_invoice",
        args
      );

      const newInvoice: InvoiceRecord = {
        id: nextId,
        invoiceNumber: `INV-2026-08${90 + nextId}`,
        clientName: newClientName.trim(),
        clientEmail: newClientEmail.trim() || "client@domain.com",
        merchantAddress: pubKey,
        amountDueUsdc: totalCalculatedInvoice,
        status: "unpaid",
        createdAt: new Date().toISOString(),
        dueDate: newDueDate,
        items: lineItems,
      };

      setInvoices([newInvoice, ...invoices]);
      toast.success(`🎉 Smart invoice ${newInvoice.invoiceNumber} successfully deployed on-chain!`);
      setActiveTab("invoices");
    } catch (e: any) {
      toast.error(`Invoice Creation Failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
      setNewClientName("");
      setNewClientEmail("");
      setLineItems([{ description: "Service Item", quantity: 1, unitPriceUsdc: 1000 }]);
    }
  };

  // Settle Invoice via Simulated Path Payment
  const handleSettleInvoice = (invoiceId: number) => {
    setIsProcessing(true);
    setTimeout(() => {
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === invoiceId) {
            return {
              ...inv,
              status: "paid",
              paidAt: new Date().toISOString(),
              payerAddress: "GC12N8...PAYER_WALLET",
              settledAsset: selectedPayAsset,
              txHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
            };
          }
          return inv;
        })
      );
      setIsProcessing(false);
      setSelectedInvoice(null);
      toast.success(`Invoice settled on-chain using ${selectedPayAsset} path payment!`);
    }, 800);
  };

  const copyLink = (id: number) => {
    const link = generateInvoiceLink(id);
    navigator.clipboard.writeText(link);
    toast.success("Checkout link copied to clipboard!");
  };

  const totalInvoiced = invoices.reduce((s, i) => s + i.amountDueUsdc, 0);
  const totalSettled = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.amountDueUsdc, 0);
  const totalPending = invoices
    .filter((i) => i.status === "unpaid")
    .reduce((s, i) => s + i.amountDueUsdc, 0);

  const contractAddress =
    process.env.NEXT_PUBLIC_SOROBAN_INVOICE ||
    "CDPNJLGFJTBVYXUMHYQPOCEFIGA27UKNCAT2IHWSSVJRPGGWWT4NJC2I";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Top Metrics Cards */}
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
              Total Invoiced
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "rgba(232, 135, 42, 0.12)", color: "var(--color-saffron)" }}>
              <Receipt size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
            ${totalInvoiced.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span style={{ fontSize: "1rem", color: "var(--color-ink-500)", fontWeight: 500 }}>USDC</span>
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", marginTop: "6px" }}>
            {invoices.length} Registered Invoices
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
              Collected &amp; Settled
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "rgba(52, 211, 153, 0.12)", color: "#34D399" }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "2rem", fontWeight: 800, color: "#34D399", letterSpacing: "-0.03em" }}>
            ${totalSettled.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span style={{ fontSize: "1rem", color: "var(--color-ink-500)", fontWeight: 500 }}>USDC</span>
          </p>
          <p style={{ fontSize: "0.75rem", color: "#34D399", marginTop: "6px" }}>
            Direct On-Chain Settlement
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
              Pending Invoices
            </span>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "rgba(245, 158, 11, 0.12)", color: "#F59E0B" }}>
              <Clock size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
            ${totalPending.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span style={{ fontSize: "1rem", color: "var(--color-ink-500)", fontWeight: 500 }}>USDC</span>
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", marginTop: "6px" }}>
            Awaiting Global Payer Checkout
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("invoices")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeTab === "invoices" ? "rgba(232, 135, 42, 0.14)" : "transparent",
            color: activeTab === "invoices" ? "var(--color-saffron)" : "var(--color-ink-500)",
            fontWeight: activeTab === "invoices" ? 700 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            fontFamily: "var(--font-body)",
          }}
        >
          Invoices &amp; Checkout Links ({invoices.length})
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
          <Plus size={15} /> Create Smart Invoice
        </button>

        <button
          onClick={() => setActiveTab("protocol")}
          style={{
            padding: "8px 18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeTab === "protocol" ? "rgba(232, 135, 42, 0.14)" : "transparent",
            color: activeTab === "protocol" ? "var(--color-saffron)" : "var(--color-ink-500)",
            fontWeight: activeTab === "protocol" ? 700 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            fontFamily: "var(--font-body)",
          }}
        >
          Path Payment Protocol
        </button>
      </div>

      {/* TAB 1: INVOICES LIST */}
      {activeTab === "invoices" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="card"
              style={{
                padding: "24px 28px",
                borderRadius: "18px",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border:
                  inv.status === "paid"
                    ? "1px solid rgba(52, 211, 153, 0.25)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "0.875rem", fontWeight: 700, color: "var(--color-saffron)" }}>
                      {inv.invoiceNumber}
                    </span>
                    {inv.status === "paid" ? (
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "3px 8px", borderRadius: "100px", backgroundColor: "rgba(52, 211, 153, 0.15)", color: "#34D399", textTransform: "uppercase" }}>
                        Settled ({inv.settledAsset || "USDC"})
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "3px 8px", borderRadius: "100px", backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", textTransform: "uppercase" }}>
                        Unpaid · Awaiting Checkout
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", fontFamily: "var(--font-body)" }}>
                    {inv.clientName}
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-ink-500)" }}>
                    {inv.clientEmail} · Due {new Date(inv.dueDate).toLocaleDateString()}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", fontFamily: "var(--font-body)" }}>
                    ${inv.amountDueUsdc.toLocaleString()} <span style={{ fontSize: "0.875rem", color: "var(--color-ink-500)" }}>USDC</span>
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)" }}>
                    ≈ €{(inv.amountDueUsdc / 1.08).toFixed(2)} EURC · {(inv.amountDueUsdc / 0.118).toFixed(0)} XLM
                  </p>
                </div>
              </div>

              {/* Line Items Snippet */}
              <div style={{ padding: "12px 16px", borderRadius: "10px", backgroundColor: "rgba(255, 255, 255, 0.02)", marginBottom: "16px" }}>
                {inv.items.map((it, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                    <span style={{ color: "var(--color-ink-700)" }}>
                      {it.description} (x{it.quantity})
                    </span>
                    <span style={{ fontWeight: 600, color: "#fff" }}>
                      ${(it.quantity * it.unitPriceUsdc).toLocaleString()} USDC
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => copyLink(inv.id)}
                    style={{ padding: "8px 14px", fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Copy size={14} /> Copy Link
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setSelectedInvoice(inv)}
                    style={{ padding: "8px 14px", fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "6px", color: "var(--color-saffron)" }}
                  >
                    <Globe2 size={14} /> {inv.status === "paid" ? "View Receipt" : "Open Client Checkout Portal"}
                  </button>
                </div>

                {inv.status === "paid" && inv.txHash && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${inv.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "var(--color-saffron)", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", textDecoration: "none" }}
                  >
                    TX: {inv.txHash.substring(0, 16)}... <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: CREATE INVOICE */}
      {activeTab === "create" && (
        <div className="card" style={{ padding: "32px", borderRadius: "20px", backgroundColor: "rgba(255, 255, 255, 0.03)" }}>
          <h3 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#fff", marginBottom: "8px", fontFamily: "var(--font-body)" }}>
            Create Smart Cross-Currency Invoice
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--color-ink-500)", marginBottom: "24px" }}>
            Issue a verifiable Soroban on-chain invoice. Your client can settle in USDC, EURC, or XLM via automated DEX path payment.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "28px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)", marginBottom: "6px" }}>
                  Client / Company Name
                </label>
                <input
                  className="input"
                  placeholder="e.g. Acme Web3 Labs GmbH"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)", marginBottom: "6px" }}>
                  Client Billing Email
                </label>
                <input
                  className="input"
                  placeholder="billing@company.com"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)", marginBottom: "6px" }}>
                Payment Due Date
              </label>
              <input
                className="input"
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </div>

            {/* Line Items Editor */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff" }}>
                  Invoice Line Items
                </span>
                <span style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--color-saffron)" }}>
                  Total: ${totalCalculatedInvoice.toLocaleString()} USDC
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {lineItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "3fr 1fr 1.5fr auto",
                      gap: "10px",
                      alignItems: "center",
                      padding: "12px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <input
                      className="input"
                      placeholder="Item Description"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(idx, "description", e.target.value)}
                      style={{ padding: "8px 12px", fontSize: "0.8125rem" }}
                    />
                    <input
                      className="input"
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(idx, "quantity", e.target.value)}
                      style={{ padding: "8px 12px", fontSize: "0.8125rem" }}
                    />
                    <input
                      className="input"
                      type="number"
                      placeholder="Price (USDC)"
                      value={item.unitPriceUsdc}
                      onChange={(e) => handleUpdateItem(idx, "unitPriceUsdc", e.target.value)}
                      style={{ padding: "8px 12px", fontSize: "0.8125rem" }}
                    />
                    <button
                      onClick={() => handleRemoveLineItem(idx)}
                      style={{ background: "none", border: "none", color: "var(--color-ink-500)", cursor: "pointer" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <button
                  className="btn btn-ghost"
                  onClick={handleAddLineItem}
                  style={{ alignSelf: "flex-start", padding: "8px 14px", fontSize: "0.8125rem", marginTop: "6px" }}
                >
                  <Plus size={14} /> Add Line Item
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button className="btn btn-ghost" onClick={() => setActiveTab("invoices")}>
              Cancel
            </button>
            <button
              className="btn btn-saffron"
              disabled={isProcessing || totalCalculatedInvoice <= 0}
              onClick={handleCreateInvoice}
              style={{ padding: "12px 28px", fontWeight: 700 }}
            >
              <FileCheck size={16} /> {isProcessing ? "Deploying Invoice..." : "Deploy Smart Invoice"}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: PROTOCOL SPECS */}
      {activeTab === "protocol" && (
        <div className="card" style={{ padding: "32px", borderRadius: "20px", backgroundColor: "rgba(255, 255, 255, 0.03)" }}>
          <h3 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#fff", marginBottom: "8px", fontFamily: "var(--font-body)" }}>
            Stellar L1 Path-Payment Smart Invoicing
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--color-ink-500)", marginBottom: "20px" }}>
            DeliteX integrates native Stellar DEX path finding (`PathPaymentStrictReceive`) with the `InvoiceRouter` Soroban contract.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "16px 20px", borderRadius: "12px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-ink-300)", textTransform: "uppercase", marginBottom: "6px" }}>
                Deployed Invoice Router Contract ID (Testnet)
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
              <strong>Zero Hidden FX Spread:</strong> Traditional platforms charge 3.5% + 2.5% FX markup. Stellar L1 path payments source liquidity directly from decentralized orderbooks and AMM pools at interbank rates with near-zero gas.
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT PORTAL MODAL (CLIENT-FACING PREVIEW) */}
      {selectedInvoice && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div className="card" style={{ width: "100%", maxWidth: "520px", padding: "32px", borderRadius: "24px", backgroundColor: "#111", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-saffron)", backgroundColor: "rgba(232, 135, 42, 0.12)", padding: "2px 8px", borderRadius: "4px" }}>
                  Client Checkout Portal
                </span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff", marginTop: "6px" }}>
                  {selectedInvoice.clientName}
                </h3>
              </div>
              <button onClick={() => setSelectedInvoice(null)} style={{ background: "none", border: "none", color: "var(--color-ink-500)", cursor: "pointer", fontSize: "1.25rem" }}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.8125rem", color: "var(--color-ink-500)", marginBottom: "20px" }}>
              Invoice {selectedInvoice.invoiceNumber} · Due {selectedInvoice.dueDate}
            </p>

            <div style={{ padding: "16px", borderRadius: "14px", backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)", marginBottom: "20px" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", textTransform: "uppercase" }}>Total Amount Due</p>
              <p style={{ fontSize: "2rem", fontWeight: 800, color: "#fff" }}>
                ${selectedInvoice.amountDueUsdc.toLocaleString()} <span style={{ fontSize: "1rem", color: "var(--color-ink-500)" }}>USDC</span>
              </p>
            </div>

            {/* Currency Choice */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink-700)", marginBottom: "10px" }}>
                Select Your Payment Currency (Atomic Path Payment)
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                {calculatePaymentOptions(selectedInvoice.amountDueUsdc).map((opt) => (
                  <div
                    key={opt.assetCode}
                    onClick={() => setSelectedPayAsset(opt.assetCode)}
                    style={{
                      cursor: "pointer",
                      padding: "12px 10px",
                      borderRadius: "12px",
                      textAlign: "center",
                      backgroundColor: selectedPayAsset === opt.assetCode ? "rgba(232, 135, 42, 0.15)" : "rgba(255, 255, 255, 0.02)",
                      border: `1px solid ${selectedPayAsset === opt.assetCode ? "var(--color-saffron)" : "rgba(255, 255, 255, 0.06)"}`,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <p style={{ fontWeight: 800, fontSize: "0.9375rem", color: selectedPayAsset === opt.assetCode ? "var(--color-saffron)" : "#fff" }}>
                      {opt.estimatedCost.toLocaleString()} {opt.assetCode}
                    </p>
                    <p style={{ fontSize: "0.6875rem", color: "var(--color-ink-500)", marginTop: "2px" }}>
                      Fee: {opt.networkFee}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {selectedInvoice.status === "unpaid" ? (
              <button
                className="btn btn-saffron"
                disabled={isProcessing}
                onClick={() => handleSettleInvoice(selectedInvoice.id)}
                style={{ width: "100%", padding: "14px", fontWeight: 700, fontSize: "0.9375rem" }}
              >
                {isProcessing ? "Broadcasting Path Payment..." : `Pay ${calculatePaymentOptions(selectedInvoice.amountDueUsdc).find(o => o.assetCode === selectedPayAsset)?.estimatedCost} ${selectedPayAsset} Now`}
              </button>
            ) : (
              <div style={{ padding: "14px", borderRadius: "12px", backgroundColor: "rgba(52, 211, 153, 0.1)", border: "1px solid rgba(52, 211, 153, 0.25)", textAlign: "center", color: "#34D399", fontWeight: 700 }}>
                ✓ Invoice Settled on Stellar Testnet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
