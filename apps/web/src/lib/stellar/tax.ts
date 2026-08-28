/**
 * DeliteX Automated On-Chain Tax Withholding & Yield-Earning Tax Escrow Engine
 *
 * Facilitates autonomous tax slicing on incoming revenue (US 1099, India TDS/GST, UK HMRC),
 * continuous yield compounding on tax reserves inside Soroban vaults (7.4% APY),
 * and verifiable on-chain tax filing receipts.
 */

export interface JurisdictionRule {
  code: number;
  name: string;
  country: string;
  defaultIncomeTaxPercent: number;
  defaultVatGstPercent: number;
  taxAuthorityName: string;
  taxAuthorityAddress: string;
}

export const JURISDICTIONS: JurisdictionRule[] = [
  {
    code: 840,
    name: "United States (IRS 1099-NEC / 1040-ES)",
    country: "United States (US)",
    defaultIncomeTaxPercent: 25,
    defaultVatGstPercent: 5,
    taxAuthorityName: "US Department of Treasury (IRS Direct Pay)",
    taxAuthorityAddress: "GIRS840...TAX_AUTHORITY_US",
  },
  {
    code: 356,
    name: "India (Income Tax Dept / Section 194J / GST)",
    country: "India (IN)",
    defaultIncomeTaxPercent: 20,
    defaultVatGstPercent: 10,
    taxAuthorityName: "Central Board of Direct Taxes (CBDT India)",
    taxAuthorityAddress: "GCBDT356...TAX_AUTHORITY_IN",
  },
  {
    code: 826,
    name: "United Kingdom (HMRC Self-Assessment)",
    country: "United Kingdom (UK)",
    defaultIncomeTaxPercent: 20,
    defaultVatGstPercent: 0,
    taxAuthorityName: "HM Revenue & Customs (HMRC UK)",
    taxAuthorityAddress: "GHMRC826...TAX_AUTHORITY_UK",
  },
  {
    code: 276,
    name: "Germany (Finanzamt EStG / USt)",
    country: "Germany (DE)",
    defaultIncomeTaxPercent: 25,
    defaultVatGstPercent: 0,
    taxAuthorityName: "Bundeszentralamt für Steuern (BZSt)",
    taxAuthorityAddress: "GBZST276...TAX_AUTHORITY_DE",
  },
];

export interface TaxProfileRecord {
  jurisdictionCode: number;
  jurisdictionName: string;
  incomeTaxPercent: number;
  vatGstPercent: number;
  totalWithholdingPercent: number;
  accumulatedPrincipalUsdc: number;
  accruedYieldUsdc: number;
  yieldApy: number; // 7.40%
  lastUpdated: string;
}

export interface TaxFilingReceipt {
  id: number;
  periodLabel: string;
  jurisdictionName: string;
  amountPaidUsdc: number;
  yieldHarvestedUsdc: number;
  taxAuthorityName: string;
  timestamp: string;
  txHash?: string;
  complianceCertHash: string;
}

/**
 * Computes tax slicing on gross inflow.
 */
export function calculateTaxSlicing(
  grossIncomeUsdc: number,
  incomeTaxPercent: number,
  vatGstPercent: number
) {
  const totalTaxPercent = incomeTaxPercent + vatGstPercent;
  const taxWithheldUsdc = Number(((grossIncomeUsdc * totalTaxPercent) / 100).toFixed(2));
  const netSpendableUsdc = Number((grossIncomeUsdc - taxWithheldUsdc).toFixed(2));

  return {
    grossIncomeUsdc,
    totalTaxPercent,
    taxWithheldUsdc,
    netSpendableUsdc,
    incomeTaxPortion: Number(((grossIncomeUsdc * incomeTaxPercent) / 100).toFixed(2)),
    vatGstPortion: Number(((grossIncomeUsdc * vatGstPercent) / 100).toFixed(2)),
  };
}

/**
 * Computes projected annual yield earned on idle tax reserves.
 */
export function calculateCompoundingTaxYield(
  principalUsdc: number,
  annualApyPercent: number = 7.4,
  daysHeld: number = 90 // 1 quarter
) {
  const rate = annualApyPercent / 100;
  const timeYears = daysHeld / 365;
  const projectedTotal = principalUsdc * Math.exp(rate * timeYears);
  const earnedYieldUsdc = Number((projectedTotal - principalUsdc).toFixed(2));

  return {
    principalUsdc,
    daysHeld,
    projectedTotal: Number(projectedTotal.toFixed(2)),
    earnedYieldUsdc,
  };
}
