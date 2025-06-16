import { Level, Phase } from '../types/Phase';

export class RiskManager {
  static checkRiskWarnings(level: Level, threshold: number = 3): string[] {
    const warnings: string[] = [];
    
    if (level.riskPercent > threshold) {
      warnings.push(`Risk ${level.riskPercent}% exceeds ${threshold}% threshold`);
    }
    
    if (level.rewardMultiple > 0 && level.rewardMultiple < 1) {
      warnings.push('Risk-to-reward ratio below 1:1');
    }
    
    if (level.lotSize > 1) {
      warnings.push('Large position size detected');
    }
    
    return warnings;
  }
  
  static checkPhaseRiskWarnings(phase: Phase, threshold: number = 3): string[] {
    const warnings: string[] = [];
    const completedTrades = phase.levels.filter(l => l.completed);
    
    if (completedTrades.length === 0) return warnings;
    
    // Check for consecutive losses
    const recentTrades = completedTrades.slice(-5);
    const consecutiveLosses = this.getConsecutiveLosses(recentTrades);
    
    if (consecutiveLosses >= 3) {
      warnings.push(`${consecutiveLosses} consecutive losses detected - consider reducing risk`);
    }
    
    // Check average risk
    const avgRisk = completedTrades.reduce((sum, t) => sum + t.riskPercent, 0) / completedTrades.length;
    if (avgRisk > threshold) {
      warnings.push(`Average risk (${avgRisk.toFixed(1)}%) is high - consider reducing position sizes`);
    }
    
    // Check drawdown
    const drawdown = this.calculateDrawdown(completedTrades);
    const drawdownPercent = (drawdown / phase.initialCapital) * 100;
    if (drawdownPercent > 10) {
      warnings.push(`Current drawdown (${drawdownPercent.toFixed(1)}%) exceeds 10%`);
    }
    
    return warnings;
  }
  
  private static getConsecutiveLosses(trades: Level[]): number {
    let consecutive = 0;
    for (let i = trades.length - 1; i >= 0; i--) {
      if (trades[i].pl < 0) {
        consecutive++;
      } else {
        break;
      }
    }
    return consecutive;
  }
  
  private static calculateDrawdown(trades: Level[]): number {
    let peak = 0;
    let maxDrawdown = 0;
    let runningPL = 0;
    
    for (const trade of trades) {
      runningPL += trade.pl;
      if (runningPL > peak) {
        peak = runningPL;
      }
      const drawdown = peak - runningPL;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return maxDrawdown;
  }
  
  static calculateOptimalPositionSize(
    balance: number, 
    riskPercent: number, 
    stopLossPips: number, 
    pipValue: number = 0.10
  ): number {
    const riskAmount = balance * (riskPercent / 100);
    const lotSize = riskAmount / (stopLossPips * pipValue);
    return Math.round(lotSize * 100) / 100; // Round to 2 decimal places
  }
}