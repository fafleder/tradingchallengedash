import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import Header from './components/Header';
import InputSection from './components/InputSection';
import PhaseContainer from './components/PhaseContainer';
import HistoricalPhases from './components/HistoricalPhases';
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
import { StorageManager } from './utils/storage';
import { AnalyticsEngine } from './utils/analytics';
import { ExportManager } from './utils/exportUtils';
import { Phase, AppSettings } from './types/Phase';

function AppContent() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [historicalPhases, setHistoricalPhases] = useState<Phase[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'phases' | 'analytics' | 'journal' | 'goals' | 'calendar'>('dashboard');
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set());
  const [globalGoals, setGlobalGoals] = useState<any[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    riskWarningThreshold: 3,
    autoBackup: true,
    defaultStrategy: '',
    defaultCurrencyPair: '',
    notifications: true,
  });

  // Initialize or load saved state
  useEffect(() => {
    const savedState = StorageManager.loadFromLocalStorage();
    if (savedState) {
      setCurrentPhase(savedState.currentPhase);
      setPhases(savedState.phases);
      setHistoricalPhases(savedState.historicalPhases || []);
      setGlobalGoals(savedState.globalGoals || []);
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
    if (phases.length > 0 || historicalPhases.length > 0 || globalGoals.length > 0) {
      StorageManager.saveToLocalStorage({
        currentPhase,
        phases,
        historicalPhases,
        settings,
        expandedPhases: Array.from(expandedPhases),
        globalGoals,
      });
    }
  }, [currentPhase, phases, historicalPhases, settings, expandedPhases, globalGoals]);

  // Auto-backup functionality
  useEffect(() => {
    if (settings.autoBackup && (phases.length > 0 || historicalPhases.length > 0)) {
      const interval = setInterval(() => {
        StorageManager.saveToLocalStorage({
          currentPhase,
          phases,
          historicalPhases,
          settings,
          expandedPhases: Array.from(expandedPhases),
          globalGoals,
        });
      }, 300000); // Auto-save every 5 minutes

      return () => clearInterval(interval);
    }
  }, [settings.autoBackup, currentPhase, phases, historicalPhases, settings, expandedPhases, globalGoals]);

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
    const newPhase: Phase = {
      phaseNumber: newPhaseNumber,
      initialCapital,
      levelsPerPhase,
      winStreak: 0,
      lossStreak: 0,
      goalTarget,
      startDate: new Date().toISOString().split('T')[0],
      levels: Array(levelsPerPhase).fill(null).map((_, i) => ({
        levelNumber: i + 1,
        date: '',
        balance: i === 0 ? initialCapital : 0,
        riskPercent: 0,
        lotSize: 0.01,
        pipsToRisk: 0,
        rewardMultiple: 0,
        profitTarget: 0,
        pl: 0,
        completed: false,
        strategy: settings.defaultStrategy,
        currencyPair: settings.defaultCurrencyPair,
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
      settings,
      expandedPhases: Array.from(expandedPhases),
      globalGoals,
    });
  };

  const handleLoadFromFile = (data: any) => {
    if (data) {
      setCurrentPhase(data.currentPhase || 0);
      setPhases(data.phases || []);
      setHistoricalPhases(data.historicalPhases || []);
      setGlobalGoals(data.globalGoals || []);
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
    const allPhases = [...historicalPhases, ...phases];
    const metrics = AnalyticsEngine.calculatePerformanceMetrics(allPhases);
    await ExportManager.exportToPDF(allPhases, metrics, 'dashboard-content');
  };

  const handleExportCSV = () => {
    const allPhases = [...historicalPhases, ...phases];
    ExportManager.exportToCSV(allPhases);
  };

  // Calculate analytics data
  const allPhases = [...historicalPhases, ...phases];
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
    { id: 'phases' as const, label: 'Active Phases', count: phases.length },
    { id: 'analytics' as const, label: 'Advanced Analytics', count: performanceMetrics.totalTrades },
    { id: 'journal' as const, label: 'Trade Journal', count: performanceMetrics.totalTrades },
    { id: 'calendar' as const, label: 'Trading Calendar', count: performanceMetrics.totalTrades },
    { id: 'goals' as const, label: 'Goal Tracker', count: globalGoals.length },
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
              <div className="space-y-6">
                {performanceMetrics.totalTrades > 0 && (
                  <PerformanceDashboard metrics={performanceMetrics} phases={allPhases} />
                )}
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <EquityCurveChart data={equityCurve} />
                  <MonthlyPerformanceChart data={monthlyPerformance} />
                </div>
                
                <RiskDistributionChart data={riskDistribution} />
                
                {historicalPhases.length > 0 && (
                  <HistoricalPhases phases={historicalPhases} />
                )}
              </div>
            )}

            {/* Active Phases Tab */}
            {activeTab === 'phases' && (
              <div className="space-y-6">
                <InputSection 
                  onStartNewPhase={handleStartNewPhase} 
                  settings={settings}
                />

                {phases.map(phase => (
                  <PhaseContainer 
                    key={phase.phaseNumber} 
                    phase={phase} 
                    updatePhase={updatePhase}
                    onDeletePhase={handleDeletePhase}
                    riskWarningThreshold={settings.riskWarningThreshold}
                    expandedPhases={expandedPhases}
                    onToggleExpanded={handleTogglePhaseExpanded}
                  />
                ))}
                
                {phases.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <BarChart3 size={48} className="mb-4 opacity-50" />
                    <p className="text-xl font-medium">No active phases</p>
                    <p className="text-sm">Enter your initial capital and levels to start tracking your progress</p>
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

            {/* Goals Tab */}
            {activeTab === 'goals' && (
              <GoalTracker 
                phases={allPhases} 
                savedGoals={globalGoals}
                onGoalsChange={setGlobalGoals}
              />
            )}
          </div>
        </main>
        
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 transition-colors">
          <div className="w-full px-6 text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Trading Challenge Dashboard - Professional Edition
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