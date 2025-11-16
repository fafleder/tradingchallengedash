import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import Header from './components/Header';
import InputSection from './components/InputSection';
import PhaseContainer from './components/PhaseContainer';
import HistoricalPhases from './components/HistoricalPhases';
import ArchivedPhases from './components/ArchivedPhases';
import PerformanceDashboard from './components/Dashboard/PerformanceDashboard';
import EquityCurveChart from './components/Charts/EquityCurveChart';
import MonthlyPerformanceChart from './components/Charts/MonthlyPerformanceChart';
import RiskDistributionChart from './components/Charts/RiskDistributionChart';
import TradeJournal from './components/TradeJournal/TradeJournal';
import AdvancedAnalytics from './components/Analytics/AdvancedAnalytics';
import GoalTracker from './components/Goals/GoalTracker';
import NotificationSystem from './components/Notifications/NotificationSystem';
import MobileOptimizations from './components/Mobile/MobileOptimizations';
import CalendarHeatmap from './components/Calendar/CalendarHeatmap';
import FranchisePlan from './components/FranchisePlan/FranchisePlan';
import TradingDashboard from './components/Dashboard/TradingDashboard';
import { StorageManager } from './utils/storage';
import { AnalyticsEngine } from './utils/analytics';
import { ExportManager } from './utils/exportUtils';
import { Phase, AppSettings } from './types/Phase';

function AppContent() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [historicalPhases, setHistoricalPhases] = useState<Phase[]>([]);
  const [archivedPhases, setArchivedPhases] = useState<Phase[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'phases' | 'analytics' | 'journal' | 'goals' | 'calendar' | 'franchise'>('dashboard');
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set());
  const [globalGoals, setGlobalGoals] = useState<any[]>([]);
  const [offlineCapitalStack, setOfflineCapitalStack] = useState<number>(0);
  const [monthlyBlowUps, setMonthlyBlowUps] = useState<number>(0);
  const [totalFlipsCompleted, setTotalFlipsCompleted] = useState<number>(0);
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    riskWarningThreshold: 3,
    autoBackup: true,
    defaultStrategy: '',
    defaultCurrencyPair: '',
    notifications: true,
    maxSLAmount: 2, // Fixed $2 SL
    maxDailyTrades: 3, // Max 3 trades per day
    maxDailyLosses: 3, // Max 3 losses per day
    defaultCycleType: 'micro',
    autoWithdrawalRules: true,
  });

  // Initialize or load saved state
  useEffect(() => {
    const savedState = StorageManager.loadFromLocalStorage();
    if (savedState) {
      setCurrentPhase(savedState.currentPhase);
      setPhases(savedState.phases);
      setHistoricalPhases(savedState.historicalPhases || []);
      setArchivedPhases(savedState.archivedPhases || []);
      setGlobalGoals(savedState.globalGoals || []);
      setOfflineCapitalStack(savedState.offlineCapitalStack || 0);
      setMonthlyBlowUps(savedState.monthlyBlowUps || 0);
      setTotalFlipsCompleted(savedState.totalFlipsCompleted || 0);
      if (savedState.settings) {
        setSettings(savedState.settings);
      }
      // Restore expanded phases state
      if (savedState.expandedPhases) {
        setExpandedPhases(new Set(savedState.expandedPhases));
      } else {
        // Default to all phases expanded
        setExpandedPhases(new Set(savedState.phases.map((p: Phase) => p.phaseNumber)));
      }
    }
  }, []);

  // Auto-save to localStorage when state changes
  useEffect(() => {
    if (phases.length > 0 || historicalPhases.length > 0 || archivedPhases.length > 0 || globalGoals.length > 0) {
      StorageManager.saveToLocalStorage({
        currentPhase,
        phases,
        historicalPhases,
        archivedPhases,
        settings,
        expandedPhases: Array.from(expandedPhases),
        globalGoals,
        offlineCapitalStack,
        monthlyBlowUps,
        totalFlipsCompleted,
        propChallengeReadiness: offlineCapitalStack >= 150,
      });
    }
  }, [currentPhase, phases, historicalPhases, archivedPhases, settings, expandedPhases, globalGoals, offlineCapitalStack, monthlyBlowUps, totalFlipsCompleted]);

  // Auto-backup functionality
  useEffect(() => {
    if (settings.autoBackup && (phases.length > 0 || historicalPhases.length > 0 || archivedPhases.length > 0)) {
      const interval = setInterval(() => {
        StorageManager.saveToLocalStorage({
          currentPhase,
          phases,
          historicalPhases,
          archivedPhases,
          settings,
          expandedPhases: Array.from(expandedPhases),
          globalGoals,
          offlineCapitalStack,
          monthlyBlowUps,
          totalFlipsCompleted,
          propChallengeReadiness: offlineCapitalStack >= 150,
        });
      }, 300000); // Auto-save every 5 minutes

      return () => clearInterval(interval);
    }
  }, [settings.autoBackup, currentPhase, phases, historicalPhases, archivedPhases, settings, expandedPhases, globalGoals, offlineCapitalStack, monthlyBlowUps, totalFlipsCompleted]);

  // Persist expanded phases state across tab changes
  useEffect(() => {
    const savedExpandedPhases = localStorage.getItem('expandedPhases');
    if (savedExpandedPhases) {
      try {
        const expandedArray = JSON.parse(savedExpandedPhases);
        setExpandedPhases(new Set(expandedArray));
      } catch (error) {
        console.error('Error loading expanded phases:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('expandedPhases', JSON.stringify(Array.from(expandedPhases)));
  }, [expandedPhases]);

  const handleStartNewPhase = (initialCapital: number, levelsPerPhase: number, goalTarget?: number) => {
    const newPhaseNumber = currentPhase + 1;
    
    // Determine cycle type based on capital
    let cycleType: 'micro' | 'small' | 'prop-challenge' | 'funded' = 'micro';
    if (initialCapital >= 1000) cycleType = 'funded';
    else if (initialCapital >= 200) cycleType = 'prop-challenge';
    else if (initialCapital >= 100) cycleType = 'small';
    
    // Calculate flip target multiplier
    const flipTarget = goalTarget ? goalTarget / initialCapital : 2;
    
    const newPhase: Phase = {
      phaseNumber: newPhaseNumber,
      initialCapital,
      levelsPerPhase,
      winStreak: 0,
      lossStreak: 0,
      goalTarget: goalTarget || initialCapital * 2,
      startDate: new Date().toISOString().split('T')[0],
      cycleType,
      flipTarget,
      withdrawalStage: 'active',
      blowUpCount: 0,
      dailyLossCount: 0,
      dailyTradeCount: 0,
      levels: Array(levelsPerPhase).fill(null).map((_, i) => ({
        levelNumber: i + 1,
        date: '',
        balance: i === 0 ? initialCapital : 0,
        riskPercent: 0,
        lotSize: 0.01,
        slAmount: settings.maxSLAmount,
        pipsToRisk: 0,
        rewardMultiple: 0,
        profitTarget: 0,
        pl: 0,
        completed: false,
        strategy: settings.defaultStrategy,
        currencyPair: settings.defaultCurrencyPair,
        tradeNumber: 0,
        emotionalState: 'disciplined',
        ruleViolations: [],
      })),
    };

    setCurrentPhase(newPhaseNumber);
    setPhases([...phases, newPhase]);
    // Expand the new phase by default
    setExpandedPhases(prev => new Set([...prev, newPhaseNumber]));
  };

  const handleSaveToFile = () => {
    StorageManager.saveToFile({
      currentPhase,
      phases,
      historicalPhases,
      archivedPhases,
      settings,
      expandedPhases: Array.from(expandedPhases),
      globalGoals,
      offlineCapitalStack,
      monthlyBlowUps,
      totalFlipsCompleted,
      propChallengeReadiness: offlineCapitalStack >= 150,
    });
  };

  const handleLoadFromFile = (data: any) => {
    if (data) {
      setCurrentPhase(data.currentPhase || 0);
      setPhases(data.phases || []);
      setHistoricalPhases(data.historicalPhases || []);
      setArchivedPhases(data.archivedPhases || []);
      setGlobalGoals(data.globalGoals || []);
      setOfflineCapitalStack(data.offlineCapitalStack || 0);
      setMonthlyBlowUps(data.monthlyBlowUps || 0);
      setTotalFlipsCompleted(data.totalFlipsCompleted || 0);
      if (data.settings) {
        setSettings(data.settings);
      }
      if (data.expandedPhases) {
        setExpandedPhases(new Set(data.expandedPhases));
      }
    }
  };

  const updatePhase = (updatedPhase: Phase) => {
    setPhases(phases.map(phase => 
      phase.phaseNumber === updatedPhase.phaseNumber ? updatedPhase : phase
    ));
  };

  const handleWithdraw = (phaseNumber: number, amount: number) => {
    // Add to offline stack
    setOfflineCapitalStack(prev => prev + amount);
    
    // Update phase withdrawal stage
    const updatedPhases = phases.map(phase => {
      if (phase.phaseNumber === phaseNumber) {
        const multiplier = (phase.initialCapital + phase.levels.filter(l => l.completed).reduce((sum, l) => sum + l.pl, 0)) / phase.initialCapital;
        
        let newStage: Phase['withdrawalStage'] = 'active';
        if (multiplier >= 5) newStage = 'reset';
        else if (multiplier >= 4) newStage = 'reset';
        else if (multiplier >= 3) newStage = 'withdraw-half';
        else if (multiplier >= 2) newStage = 'withdraw-deposit';
        
        return {
          ...phase,
          withdrawalStage: newStage,
        };
      }
      return phase;
    });
    
    setPhases(updatedPhases);
    
    // If full withdrawal, increment flip counter
    if (amount >= phases.find(p => p.phaseNumber === phaseNumber)?.initialCapital! * 2) {
      setTotalFlipsCompleted(prev => prev + 1);
    }
  };

  const handleDeletePhase = (phaseNumber: number) => {
    // Remove the phase from the phases array
    const updatedPhases = phases.filter(phase => phase.phaseNumber !== phaseNumber);
    
    // Renumber the remaining phases to maintain sequential numbering
    const renumberedPhases = updatedPhases.map((phase, index) => ({
      ...phase,
      phaseNumber: index + 1
    }));
    
    setPhases(renumberedPhases);
    setCurrentPhase(renumberedPhases.length);
    
    // Remove from expanded phases
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      newSet.delete(phaseNumber);
      return newSet;
    });
  };

  const handleArchivePhase = (phaseNumber: number) => {
    const phaseToArchive = phases.find(phase => phase.phaseNumber === phaseNumber);
    if (!phaseToArchive) return;

    // Add end date to the phase
    const archivedPhase = {
      ...phaseToArchive,
      endDate: new Date().toISOString().split('T')[0],
    };

    // Remove from active phases and add to archived
    const updatedPhases = phases.filter(phase => phase.phaseNumber !== phaseNumber);
    const renumberedPhases = updatedPhases.map((phase, index) => ({
      ...phase,
      phaseNumber: index + 1
    }));
    
    setPhases(renumberedPhases);
    setArchivedPhases([...archivedPhases, archivedPhase]);
    setCurrentPhase(renumberedPhases.length);
    
    // Remove from expanded phases
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      newSet.delete(phaseNumber);
      return newSet;
    });
  };

  const handleUnarchivePhase = (phaseNumber: number) => {
    const phaseToUnarchive = archivedPhases.find(phase => phase.phaseNumber === phaseNumber);
    if (!phaseToUnarchive) return;

    // Remove end date and assign new phase number
    const newPhaseNumber = currentPhase + 1;
    const unArchivedPhase = {
      ...phaseToUnarchive,
      phaseNumber: newPhaseNumber,
      endDate: undefined,
    };

    // Remove from archived and add to active phases
    setArchivedPhases(archivedPhases.filter(phase => phase.phaseNumber !== phaseNumber));
    setPhases([...phases, unArchivedPhase]);
    setCurrentPhase(newPhaseNumber);
    
    // Expand the unarchived phase
    setExpandedPhases(prev => new Set([...prev, newPhaseNumber]));
  };

  const handleDeleteArchivedPhase = (phaseNumber: number) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete archived Cycle ${phaseNumber}? This action cannot be undone.`
    );
    if (confirmDelete) {
      setArchivedPhases(archivedPhases.filter(phase => phase.phaseNumber !== phaseNumber));
    }
  };

  const handleTogglePhaseExpanded = (phaseNumber: number) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phaseNumber)) {
        newSet.delete(phaseNumber);
      } else {
        newSet.add(phaseNumber);
      }
      return newSet;
    });
  };

  const handleExportPDF = async () => {
    const allPhases = [...historicalPhases, ...phases, ...archivedPhases];
    const metrics = AnalyticsEngine.calculatePerformanceMetrics(allPhases);
    await ExportManager.exportToPDF(allPhases, metrics, 'dashboard-content');
  };

  const handleExportCSV = () => {
    const allPhases = [...historicalPhases, ...phases, ...archivedPhases];
    ExportManager.exportToCSV(allPhases);
  };

  // Calculate analytics data
  const allPhases = [...historicalPhases, ...phases, ...archivedPhases];
  const performanceMetrics = AnalyticsEngine.calculatePerformanceMetrics(allPhases);
  const monthlyPerformance = AnalyticsEngine.getMonthlyPerformance(allPhases);
  const equityCurve = AnalyticsEngine.getEquityCurve(allPhases);
  const riskDistribution = AnalyticsEngine.getRiskDistribution(allPhases);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewPhase: () => {
      setActiveTab('phases');
      // Focus on initial capital input
      setTimeout(() => {
        const input = document.getElementById('initialCapital');
        if (input) input.focus();
      }, 100);
    },
    onSave: handleSaveToFile,
    onExportData: handleExportCSV,
  });

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', count: allPhases.length },
    { id: 'phases' as const, label: 'Active Cycles', count: phases.length },
    { id: 'analytics' as const, label: 'Advanced Analytics', count: performanceMetrics.totalTrades },
    { id: 'journal' as const, label: 'Trade Journal', count: performanceMetrics.totalTrades },
    { id: 'calendar' as const, label: 'Trading Calendar', count: performanceMetrics.totalTrades },
    { id: 'goals' as const, label: 'Flip Targets', count: globalGoals.length },
    { id: 'franchise' as const, label: 'Business Plan', count: 0 },
  ];

  return (
    <MobileOptimizations>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
        <Header 
          settings={settings}
          onUpdateSettings={setSettings}
          onExportData={handleSaveToFile}
          onImportData={handleLoadFromFile}
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
        />
        
        <main className="flex-grow">
          {/* Navigation Tabs */}
          <div className="w-full px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto max-w-full">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      activeTab === tab.id
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="w-full px-6 py-6" id="dashboard-content">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <TradingDashboard phases={allPhases} offlineStack={offlineCapitalStack} monthlyBlowUps={monthlyBlowUps} totalFlips={totalFlipsCompleted} />
            )}

            {/* Active Cycles Tab */}
            {activeTab === 'phases' && (
              <div className="space-y-6">
                <InputSection 
                  onStartNewPhase={handleStartNewPhase} 
                  settings={settings}
                  offlineStack={offlineCapitalStack}
                />

                {phases.map(phase => (
                  <PhaseContainer 
                    key={phase.phaseNumber} 
                    phase={phase} 
                    updatePhase={updatePhase}
                    onDeletePhase={handleDeletePhase}
                    onArchivePhase={handleArchivePhase}
                    riskWarningThreshold={settings.riskWarningThreshold}
                    expandedPhases={expandedPhases}
                    onToggleExpanded={handleTogglePhaseExpanded}
                    onWithdraw={(amount) => handleWithdraw(phase.phaseNumber, amount)}
                  />
                ))}

                {/* Archived Cycles Section */}
                {archivedPhases.length > 0 && (
                  <ArchivedPhases 
                    phases={archivedPhases}
                    onUnarchive={handleUnarchivePhase}
                    onDelete={handleDeleteArchivedPhase}
                  />
                )}
                
                {phases.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <BarChart3 size={48} className="mb-4 opacity-50" />
                    <p className="text-xl font-medium">No active flip cycles</p>
                    <p className="text-sm">Start with $20-$50 and begin your first micro flip cycle</p>
                  </div>
                )}
              </div>
            )}

            {/* Advanced Analytics Tab */}
            {activeTab === 'analytics' && (
              <AdvancedAnalytics phases={allPhases} />
            )}

            {/* Trade Journal Tab */}
            {activeTab === 'journal' && (
              <TradeJournal phases={allPhases} />
            )}

            {/* Trading Calendar Tab */}
            {activeTab === 'calendar' && (
              <CalendarHeatmap phases={allPhases} />
            )}

            {/* Flip Targets Tab */}
            {activeTab === 'goals' && (
              <GoalTracker 
                phases={allPhases} 
                savedGoals={globalGoals}
                onGoalsChange={setGlobalGoals}
              />
            )}

            {/* Business Plan Tab */}
            {activeTab === 'franchise' && (
              <FranchisePlan phases={allPhases} />
            )}
          </div>
        </main>
        
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 transition-colors">
          <div className="w-full px-6 text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Micro Capital Trading Business Dashboard - Real Version
          </div>
        </footer>
      </div>
    </MobileOptimizations>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;