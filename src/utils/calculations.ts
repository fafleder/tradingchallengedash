// Base pip value for standard lot calculation
export const BASE_PIP_VALUE = 0.10;

/**
 * Calculate the risked amount based on balance and risk percentage
 */
export function calculateRiskedAmount(balance: number, riskPercent: number): number {
  return balance * (riskPercent / 100);
}

/**
 * Calculate the number of pips to risk based on risked amount and lot size
 */
export function calculatePips(riskedAmount: number, lotSize: number): number {
  // Calculate pip value based on lot size
  const pipValue = BASE_PIP_VALUE * (lotSize / 0.01);
  
  // Avoid division by zero
  if (pipValue === 0) return 0;
  
  return riskedAmount / pipValue;
}

/**
 * Calculate the profit target based on risked amount and reward multiple
 */
export function calculateProfitTarget(riskedAmount: number, rewardMultiple: number): number {
  return riskedAmount * rewardMultiple;
}