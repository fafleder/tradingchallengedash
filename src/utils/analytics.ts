import { Phase, Level, PerformanceMetrics } from '../types/Phase';

export class AnalyticsEngine {
  static calculatePerformanceMetrics(phases: Phase[]): PerformanceMetrics {
    const allTrades = phases.flatMap(phase => 
      phase.levels.filter(level => level.completed)
    );

    if (allTrades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalProfitLoss: 0,
        averageWin: 0,
        averageLoss: 0,
        profitFactor: 0,
        maxDrawdown: 0,
        bestTrade: 0,
        worstTrade: 0,
        averageRiskPercent: 0,
        totalRisked: 0,
        returnOnRisk: 0,
      };
    }

    const winningTrades = allTrades.filter(trade => trade.pl > 0);
    const losingTrades = allTrades.filter(trade => trade.pl < 0);
    
    const totalProfitLoss = allTrades.reduce((sum, trade) => sum + trade.pl, 0);
    const totalWins = winningTrades.reduce((sum, trade) => sum + trade.pl, 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pl, 0));
    
    const averageWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
    
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
    
    const bestTrade = Math.max(...allTrades.map(trade => trade.pl), 0);
    const worstTrade = Math.min(...allTrades.map(trade => trade.pl), 0);
    
    const averageRiskPercent = allTrades.reduce((sum, trade) => sum + trade.riskPercent, 0) / allTrades.length;
    const totalRisked = allTrades.reduce((sum, trade) => sum + (trade.riskedAmount || 0), 0);
    const returnOnRisk = totalRisked > 0 ? (totalProfitLoss / totalRisked) * 100 : 0;
    
    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let runningPL = 0;
    
    for (const trade of allTrades) {
      runningPL += trade.pl;
      if (runningPL > peak) {
        peak = runningPL;
      }
      const drawdown = peak - runningPL;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return {
      totalTrades: allTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: (winningTrades.length / allTrades.length) * 100,
      totalProfitLoss,
      averageWin,
      averageLoss,
      profitFactor,
      maxDrawdown,
      bestTrade,
      worstTrade,
      averageRiskPercent,
      totalRisked,
      returnOnRisk,
    };
  }

  static getMonthlyPerformance(phases: Phase[]): Array<{
    month: string;
    profit: number;
    trades: number;
    winRate: number;
  }> {
    const monthlyData: { [key: string]: { profit: number; trades: Level[]; } } = {};
    
    phases.forEach(phase => {
      phase.levels.filter(level => level.completed && level.date).forEach(level => {
        const date = new Date(level.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { profit: 0, trades: [] };
        }
        
        monthlyData[monthKey].profit += level.pl;
        monthlyData[monthKey].trades.push(level);
      });
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      profit: data.profit,
      trades: data.trades.length,
      winRate: (data.trades.filter(t => t.pl > 0).length / data.trades.length) * 100,
    })).sort((a, b) => a.month.localeCompare(b.month));
  }

  static getEquityCurve(phases: Phase[]): Array<{ date: string; equity: number; }> {
    const allTrades = phases.flatMap(phase => 
      phase.levels.filter(level => level.completed && level.date)
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningEquity = 0;
    const equityCurve: Array<{ date: string; equity: number; }> = [];

    allTrades.forEach(trade => {
      runningEquity += trade.pl;
      equityCurve.push({
        date: trade.date,
        equity: runningEquity,
      });
    });

    return equityCurve;
  }

  static getRiskDistribution(phases: Phase[]): Array<{ risk: string; count: number; }> {
    const allTrades = phases.flatMap(phase => 
      phase.levels.filter(level => level.completed)
    );

    const riskBuckets: { [key: string]: number } = {
      '0-1%': 0,
      '1-2%': 0,
      '2-3%': 0,
      '3-5%': 0,
      '5%+': 0,
    };

    allTrades.forEach(trade => {
      const risk = trade.riskPercent;
      if (risk <= 1) riskBuckets['0-1%']++;
      else if (risk <= 2) riskBuckets['1-2%']++;
      else if (risk <= 3) riskBuckets['2-3%']++;
      else if (risk <= 5) riskBuckets['3-5%']++;
      else riskBuckets['5%+']++;
    });

    return Object.entries(riskBuckets).map(([risk, count]) => ({ risk, count }));
  }
}