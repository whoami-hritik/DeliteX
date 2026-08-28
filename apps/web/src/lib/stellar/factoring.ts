/**
 * DeliteX Working Capital & Instant Invoice Factoring Engine
 *
 * Facilitates 80% LTV instant cash advances on unpaid invoices,
 * LP liquidity yield staking, and self-repaying settlement routing on Soroban.
 */

export type FactoringStatus = "active" | "settled" | "defaulted";

export interface FactoringPositionRecord {
  id: number;
  invoiceId: number;
  invoiceNumber: string;
  clientName: string;
  totalAmountUsdc: number;
  advanceAmountUsdc: number; // 80% Instant Advance
  discountFeeUsdc: number;   // 1.5% Fee
  remainderUsdc: number;     // 20% - Fee
  status: FactoringStatus;
  fundedAt: string;
  dueDate: string;
  txHash?: string;
}

export interface PoolStats {
  totalLiquidityUsdc: number;
  totalAdvancedUsdc: number;
  availableLiquidityUsdc: number;
  baseLtvPercent: number; // 80%
  discountFeePercent: number; // 1.5%
  annualYieldApy: number; // 14.2% APY for LPs
}

export interface AdvanceCalculation {
  totalInvoiceAmount: number;
  advanceAmount: number;
  reserveAmount: number;
  discountFee: number;
  merchantRemainderOnSettlement: number;
}

/**
 * Computes exact 80% LTV working capital advance and discount fee math.
 */
export function calculateAdvance(
  totalInvoiceAmount: number,
  ltvPercent: number = 80,
  feePercent: number = 1.5
): AdvanceCalculation {
  const advanceAmount = Number(((totalInvoiceAmount * ltvPercent) / 100).toFixed(2));
  const reserveAmount = Number(((totalInvoiceAmount * (100 - ltvPercent)) / 100).toFixed(2));
  const discountFee = Number(((totalInvoiceAmount * feePercent) / 100).toFixed(2));
  const merchantRemainderOnSettlement = Number((reserveAmount - discountFee).toFixed(2));

  return {
    totalInvoiceAmount,
    advanceAmount,
    reserveAmount,
    discountFee,
    merchantRemainderOnSettlement,
  };
}
