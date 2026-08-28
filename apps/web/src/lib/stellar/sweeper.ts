/**
 * DeliteX Automated Liquidity Sweeper & Yield Engine Client
 *
 * Facilitates zero-idle cash auto-sweeping, real-time APY compounding calculations,
 * and atomic Sweep-and-Pay debit simulations on Soroban.
 */

export interface SweeperVaultState {
  underlyingToken: string; // USDC Contract Address
  totalDepositedUsdc: number;
  totalShares: number;
  apyPercent: number; // e.g. 7.4%
  lastUpdateTimestamp: number;
}

export interface UserSweeperPosition {
  userAddress: string;
  shares: number;
  depositedPrincipalUsdc: number;
  currentValueUsdc: number;
  accruedYieldUsdc: number;
  autoSweepEnabled: boolean;
}

/**
 * Calculates real-time continuous compounding yield for live UI tickers.
 * Formula: A = P * e^(r * t)
 */
export function calculateLiveCompounding(
  principal: number,
  apyPercent: number,
  elapsedSeconds: number
): number {
  if (principal <= 0 || apyPercent <= 0) return 0;
  const ratePerSecond = (apyPercent / 100) / (365 * 24 * 3600);
  const compounded = principal * Math.exp(ratePerSecond * elapsedSeconds);
  return Math.max(0, compounded - principal);
}

/**
 * Projects future earnings across standard financial timeframes.
 */
export function projectEarnings(
  principal: number,
  apyPercent: number
): { daily: number; monthly: number; annual: number } {
  if (principal <= 0 || apyPercent <= 0) {
    return { daily: 0, monthly: 0, annual: 0 };
  }
  const annual = principal * (apyPercent / 100);
  const monthly = annual / 12;
  const daily = annual / 365;
  return { daily, monthly, annual };
}

/**
 * Simulates an atomic Sweep-and-Debit operation.
 * Demonstrates zero-idle cash mechanics (paying bills directly from the yield vault).
 */
export function simulateSweepDebit(
  vaultBalanceUsdc: number,
  debitAmountUsdc: number
): {
  canCover: boolean;
  remainingVaultUsdc: number;
  deficitUsdc: number;
} {
  if (vaultBalanceUsdc >= debitAmountUsdc) {
    return {
      canCover: true,
      remainingVaultUsdc: vaultBalanceUsdc - debitAmountUsdc,
      deficitUsdc: 0,
    };
  }
  return {
    canCover: false,
    remainingVaultUsdc: 0,
    deficitUsdc: debitAmountUsdc - vaultBalanceUsdc,
  };
}
