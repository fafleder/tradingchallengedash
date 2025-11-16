export interface Level {
  levelNumber: number;
  date: string;
  balance: number;
  riskPercent: number;
  lotSize: number;
  riskedAmount?: number;
  pipsToRisk: number;
  rewardMultiple: number;
  profitTarget: number;
  pl: number;
  completed: boolean;
  notes?: string;
  strategy?: string;
  currencyPair?: string;
  marketSession?: string;
  entryTime?: string;
  exitTime?: string;
  screenshot?: string;
  slAmount?: number; // Fixed $2 SL tracking
  tradeNumber?: number; // Daily trade counter (max 3)
  emotionalState?: 'disciplined' | 'revenge' | 'fomo' | 'confident' | 'fearful';
  ruleViolations?: string[];
}

export interface Phase {
  phaseNumber: number;
  initialCapital: number;
  levelsPerPhase: number;
  winStreak: number;
  lossStreak: number;
  levels: Level[];
  goalTarget?: number;
  startDate?: string;
  endDate?: string;
  cycleType: 'micro' | 'small' | 'prop-challenge' | 'funded';
  flipTarget: number; // 2x, 3x, 4x, 5x multiplier
  withdrawalStage: 'active' | 'withdraw-deposit' | 'withdraw-half' | 'withdraw-all' | 'reset';
  blowUpCount?: number;
  doublingTime?: number; // Days to reach target
  offlineStack?: number; // Withdrawn profits
  dailyLossCount?: number; // Track 3-loss rule
  dailyTradeCount?: number; // Track 3-trade limit
}

export interface AppState {
  currentPhase: number;
  phases: Phase[];
  historicalPhases: Phase[];
  archivedPhases?: Phase[];
  settings: AppSettings;
  expandedPhases?: number[];
  globalGoals?: any[];
  offlineCapitalStack: number;
  monthlyBlowUps: number;
  totalFlipsCompleted: number;
  propChallengeReadiness: boolean;
}

export interface AppSettings {
  darkMode: boolean;
  riskWarningThreshold: number;
  autoBackup: boolean;
  defaultStrategy: string;
  defaultCurrencyPair: string;
  notifications: boolean;
  maxSLAmount: number; // Fixed at $2
  maxDailyTrades: number; // Fixed at 3
  maxDailyLosses: number; // Fixed at 3
  defaultCycleType: 'micro' | 'small';
  autoWithdrawalRules: boolean;
}

export interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfitLoss: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  bestTrade: number;
  worstTrade: number;
  averageRiskPercent: number;
  totalRisked: number;
  returnOnRisk: number;
}

export interface TradeFilter {
  dateFrom?: string;
  dateTo?: string;
  strategy?: string;
  currencyPair?: string;
  minPL?: number;
  maxPL?: number;
  completed?: boolean;
}