/**
 * DeliteX Automated Fiat Off-Ramp & Local Bank Settlement Engine
 *
 * Facilitates direct off-ramping from on-chain USDC into domestic bank rails
 * (UPI/IMPS for India, SEPA for Europe, Pix for Brazil, FedNow/ACH for US)
 * via Stellar Anchor Open Financial Standards (SEP-24 / SEP-38 / SEP-31).
 */

export type DomesticRail = "UPI" | "IMPS" | "SEPA" | "PIX" | "ACH" | "MPESA";

export interface BankBeneficiaryRecord {
  id: number;
  label: string;
  accountIdentifier: string; // e.g. "rohit@okhdfcbank" or "DE89 3704 0044 0532 0130 00"
  railType: DomesticRail;
  country: string;
  currencyCode: string;
  anchorName: string;
  autoRampPercent: number; // e.g. 40%
  isPrimary: boolean;
}

export interface OffRampTransaction {
  id: number;
  beneficiaryLabel: string;
  accountIdentifier: string;
  railType: DomesticRail;
  amountUsdc: number;
  fiatReceived: string;
  status: "Settled" | "Processing" | "Failed";
  settlementTimeSec: number;
  timestamp: string;
  txHash?: string;
  bankRefNumber: string;
}

export interface RampQuote {
  amountUsdc: number;
  railType: DomesticRail;
  targetCurrency: string;
  exchangeRate: number;
  grossFiat: number;
  anchorFeeUsdc: number;
  networkFeeUsdc: number;
  netFiatPayout: number;
  estimatedSettlementSeconds: number;
}

const RAIL_RATES: Record<DomesticRail, { currency: string; rate: number; speedSec: number; anchor: string }> = {
  UPI: { currency: "INR", rate: 87.25, speedSec: 35, anchor: "Onmeta / Circle INR Anchor" },
  IMPS: { currency: "INR", rate: 87.25, speedSec: 45, anchor: "Onmeta / Stellar Direct IMPS" },
  SEPA: { currency: "EUR", rate: 0.925, speedSec: 20, anchor: "Tempo France / Monerium SEPA" },
  PIX: { currency: "BRL", rate: 5.65, speedSec: 15, anchor: "Anclap Brazil PIX Bridge" },
  ACH: { currency: "USD", rate: 1.00, speedSec: 60, anchor: "Circle USDC Direct Wire/FedNow" },
  MPESA: { currency: "KES", rate: 129.50, speedSec: 25, anchor: "ClickPesa East Africa Anchor" },
};

/**
 * Computes instant real-time FX quote and payout estimates for a domestic rail.
 */
export function calculateRampQuote(amountUsdc: number, railType: DomesticRail): RampQuote {
  const info = RAIL_RATES[railType] || RAIL_RATES.UPI;
  const exchangeRate = info.rate;
  const anchorFeeUsdc = Number((amountUsdc * 0.002).toFixed(2)); // 0.2% interbank bridge fee
  const networkFeeUsdc = 0.00001; // Stellar Testnet gas

  const netUsdc = Math.max(0, amountUsdc - anchorFeeUsdc);
  const netFiatPayout = Number((netUsdc * exchangeRate).toFixed(2));

  return {
    amountUsdc,
    railType,
    targetCurrency: info.currency,
    exchangeRate,
    grossFiat: Number((amountUsdc * exchangeRate).toFixed(2)),
    anchorFeeUsdc,
    networkFeeUsdc,
    netFiatPayout,
    estimatedSettlementSeconds: info.speedSec,
  };
}
