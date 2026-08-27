/**
 * DeliteX Multi-Sig Corporate Treasury & Batch Payroll Client
 *
 * Facilitates M-of-N multisig proposals, CSV batch parsing,
 * and atomic payroll execution via Soroban.
 */

export interface PayoutItem {
  name: string;
  recipient: string; // Stellar public key (G...)
  amountUsdc: number;
}

export interface PayrollProposal {
  id: number;
  title: string;
  proposer: string;
  items: PayoutItem[];
  totalAmountUsdc: number;
  approvals: string[]; // List of signer public keys that have signed
  threshold: number;
  executed: boolean;
  createdAt: string;
  deadline: string;
  txHash?: string;
}

export interface TreasuryState {
  treasuryAddress: string;
  balanceUsdc: number;
  owners: string[];
  threshold: number;
  proposals: PayrollProposal[];
}

/**
 * Validates and parses a CSV file for batch payroll.
 * Expected format: Name, Address, Amount
 *
 * Example:
 * Alex Rivera, GA74...GU73, 1200
 * Sarah Chen, GB89...KL42, 2500
 */
export function parsePayrollCsv(csvText: string): { items: PayoutItem[]; errors: string[]; total: number } {
  const lines = csvText.trim().split(/\r?\n/);
  const items: PayoutItem[] = [];
  const errors: string[] = [];
  let total = 0;

  if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === "")) {
    return { items: [], errors: ["CSV file is empty."], total: 0 };
  }

  // Check if first row is header
  let startIdx = 0;
  const firstRow = lines[0].toLowerCase();
  if (firstRow.includes("address") || firstRow.includes("amount") || firstRow.includes("name") || firstRow.includes("recipient")) {
    startIdx = 1;
  }

  for (let i = startIdx; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const parts = rawLine.split(",").map((p) => p.trim());
    if (parts.length < 2) {
      errors.push(`Row ${i + 1}: Invalid format. Expected 'Name, Address, Amount' or 'Address, Amount'.`);
      continue;
    }

    let name = "Contractor";
    let addr = "";
    let amountStr = "";

    if (parts.length >= 3) {
      name = parts[0] || `Contractor #${i}`;
      addr = parts[1];
      amountStr = parts[2];
    } else {
      addr = parts[0];
      amountStr = parts[1];
      name = `Recipient (${addr.slice(0, 4)}...${addr.slice(-4)})`;
    }

    // Validate Stellar Address (length 56 and starts with G or C)
    if (!addr.startsWith("G") && !addr.startsWith("C") || addr.length !== 56) {
      errors.push(`Row ${i + 1}: Invalid Stellar address '${addr}'. Must be 56 characters starting with 'G' or 'C'.`);
      continue;
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      errors.push(`Row ${i + 1}: Invalid amount '${amountStr}'. Must be a positive number.`);
      continue;
    }

    items.push({
      name,
      recipient: addr,
      amountUsdc: amount,
    });
    total += amount;
  }

  return { items, errors, total };
}

/**
 * Shorten public keys for clean UI display
 */
export function shortenAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.substring(0, 5)}...${addr.substring(addr.length - 4)}`;
}
