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
}

export interface AppState {
  currentPhase: number;
  phases: Phase[];
  historicalPhases: Phase[];
  settings: AppSettings;
  expandedPhases?: number[];
  globalGoals?: any[];
}

export interface AppSettings {
  darkMode: boolean;
  riskWarningThreshold: number;
  autoBackup: boolean;
  defaultStrategy: string;
  defaultCurrencyPair: string;
  notifications: boolean;
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