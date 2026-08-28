/**
 * DeliteX Cross-Currency Invoicing & Path Payment Engine
 *
 * Facilitates multi-asset invoice creation, Stellar DEX path-payment conversions,
 * and deterministic on-chain invoice settlements via Soroban.
 */

export type InvoiceStatus = "unpaid" | "paid" | "cancelled";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPriceUsdc: number;
}

export interface InvoiceRecord {
  id: number;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  merchantAddress: string;
  amountDueUsdc: number;
  status: InvoiceStatus;
  createdAt: string;
  dueDate: string;
  items: InvoiceItem[];
  paidAt?: string;
  payerAddress?: string;
  settledAsset?: "USDC" | "EURC" | "XLM";
  txHash?: string;
}

export interface CurrencyOption {
  assetCode: "USDC" | "EURC" | "XLM";
  rateToUsdc: number; // e.g. 1 XLM = 0.118 USDC
  estimatedCost: number;
  networkFee: string;
}

/**
 * Calculates real-time Stellar DEX path payment conversion options.
 */
export function calculatePaymentOptions(amountDueUsdc: number): CurrencyOption[] {
  // Stellar DEX market baseline simulation
  const usdcRate = 1.0;
  const eurcRate = 1.08; // 1 EURC = 1.08 USDC -> 0.926 EURC per USDC
  const xlmRate = 0.118; // 1 XLM = 0.118 USDC -> 8.47 XLM per USDC

  return [
    {
      assetCode: "USDC",
      rateToUsdc: usdcRate,
      estimatedCost: amountDueUsdc,
      networkFee: "< $0.0001",
    },
    {
      assetCode: "EURC",
      rateToUsdc: eurcRate,
      estimatedCost: Number((amountDueUsdc / eurcRate).toFixed(2)),
      networkFee: "< $0.0001",
    },
    {
      assetCode: "XLM",
      rateToUsdc: xlmRate,
      estimatedCost: Number((amountDueUsdc / xlmRate).toFixed(2)),
      networkFee: "< $0.0001",
    },
  ];
}

/**
 * Generates a direct checkout URL for sharing with international clients.
 */
export function generateInvoiceLink(invoiceId: number): string {
  return `https://delite-x-web.vercel.app/pay/${invoiceId}`;
}
