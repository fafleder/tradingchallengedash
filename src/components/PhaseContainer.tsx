import React, { useState, useEffect } from 'react';
import { Phase } from '../types/Phase';
import { calculatePips, calculateRiskedAmount, calculateProfitTarget } from '../utils/calculations';
import { RiskManager } from '../utils/riskManager';
import { useTheme } from '../contexts/ThemeContext';
import PhaseHeader from './PhaseHeader';
import TradeTable from './TradeTable';

interface PhaseContainerProps {
  phase: Phase;
  updatePhase: (phase: Phase) => void;
  onDeletePhase: (phaseNumber: number) => void;
  riskWarningThreshold: number;
  expandedPhases: Set<number>;
  onToggleExpanded: (phaseNumber: number) => void;
}

const PhaseContainer: React.FC<PhaseContainerProps> = ({ 
  phase, 
  updatePhase, 
  onDeletePhase,
  riskWarningThreshold,
  expandedPhases,
  onToggleExpanded
}) => {
  const { darkMode } = useTheme();
  const [showRiskWarnings, setShowRiskWarnings] = useState(false);
  const expanded = expandedPhases.has(phase.phaseNumber);
  
  // Calculate total ending balance 
  const getTotalEndingBalance = (): number => {
    let balance = phase.initialCapital;
    
    for (const level of phase.levels) {
      if (level.completed) {
        balance += level.pl;
      }
    }
    
    return balance;
  };
  
  // Update level balances based on previous levels
  useEffect(() => {
    const updatedLevels = [...phase.levels];
    let currentBalance = phase.initialCapital;
    
    for (let i = 0; i < updatedLevels.length; i++) {
      // First level always starts with initial capital
      if (i === 0) {
        updatedLevels[i].balance = currentBalance;
      } else {
        // If previous level is completed, add its P/L to the balance
        if (updatedLevels[i-1].completed) {
          currentBalance += updatedLevels[i-1].pl;
        }
        updatedLevels[i].balance = currentBalance;
      }
      
      // Recalculate derived values
      updatedLevels[i].riskedAmount = calculateRiskedAmount(currentBalance, updatedLevels[i].riskPercent);
      updatedLevels[i].pipsToRisk = calculatePips(updatedLevels[i].riskedAmount, updatedLevels[i].lotSize);
      updatedLevels[i].profitTarget = calculateProfitTarget(updatedLevels[i].riskedAmount, updatedLevels[i].rewardMultiple);
    }
    
    // Update phase with new level data
    const updatedPhase = {
      ...phase,
      levels: updatedLevels
    };
    
    updatePhase(updatedPhase);
  }, [phase.levels.map(l => l.completed + l.pl).join(',')]);
  
  // Calculate win/loss streaks
  useEffect(() => {
    // Sort completed trades by date
    const completedTrades = phase.levels
      .filter(level => level.completed && level.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let winStreak = 0;
    let lossStreak = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    
    completedTrades.forEach(trade => {
      if (trade.pl > 0) {
        currentWinStreak++;
        currentLossStreak = 0;
        if (currentWinStreak > winStreak) {
          winStreak = currentWinStreak;
        }
      } else if (trade.pl < 0) {
        currentLossStreak++;
        currentWinStreak = 0;
        if (currentLossStreak > lossStreak) {
          lossStreak = currentLossStreak;
        }
      } else {
        // If PL is exactly 0, reset both streaks
        currentWinStreak = 0;
        currentLossStreak = 0;
      }
    });
    
    // Only update if streaks have changed
    if (phase.winStreak !== winStreak || phase.lossStreak !== lossStreak) {
      updatePhase({
        ...phase,
        winStreak,
        lossStreak
      });
    }
  }, [phase.levels.map(l => l.completed + l.pl + l.date).join(',')]);
  
  // Check for risk warnings
  const riskWarnings = RiskManager.checkPhaseRiskWarnings(phase, riskWarningThreshold);
  
  useEffect(() => {
    if (riskWarnings.length > 0 && !showRiskWarnings) {
      setShowRiskWarnings(true);
    }
  }, [riskWarnings.length]);
  
  // Helper to handle level updates
  const handleLevelUpdate = (levelIndex: number, updates: Partial<typeof phase.levels[0]>) => {
    const updatedLevels = [...phase.levels];
    updatedLevels[levelIndex] = {
      ...updatedLevels[levelIndex],
      ...updates
    };
    
    // Recalculate derived values
    const currentBalance = updatedLevels[levelIndex].balance;
    const riskPercent = updatedLevels[levelIndex].riskPercent;
    const lotSize = updatedLevels[levelIndex].lotSize;
    const rewardMultiple = updatedLevels[levelIndex].rewardMultiple;
    
    const riskedAmount = calculateRiskedAmount(currentBalance, riskPercent);
    const pipsToRisk = calculatePips(riskedAmount, lotSize);
    const profitTarget = calculateProfitTarget(riskedAmount, rewardMultiple);
    
    updatedLevels[levelIndex] = {
      ...updatedLevels[levelIndex],
      riskedAmount,
      pipsToRisk,
      profitTarget
    };
    
    updatePhase({
      ...phase,
      levels: updatedLevels
    });
  };
  
  // Toggle level completion
  const toggleLevelCompletion = (levelIndex: number) => {
    const updatedLevels = [...phase.levels];
    const newCompletedState = !updatedLevels[levelIndex].completed;
    
    updatedLevels[levelIndex] = {
      ...updatedLevels[levelIndex],
      completed: newCompletedState
    };
    
    // Check if phase is completed
    const isPhaseCompleted = updatedLevels.every(level => level.completed);
    if (isPhaseCompleted) {
      alert(`Phase ${phase.phaseNumber} completed! Start a new phase with a new initial balance.`);
    }
    
    updatePhase({
      ...phase,
      levels: updatedLevels
    });
  };
  
  // Get bg class based on phase number
  const getPhaseBackgroundClass = () => {
    return darkMode ? 'bg-gray-800' : 'bg-white';
  };
  
  const handleDeletePhase = () => {
    onDeletePhase(phase.phaseNumber);
  };
  
  const handleToggleExpanded = () => {
    onToggleExpanded(phase.phaseNumber);
  };
  
  return (
    <div className={`rounded-lg shadow-sm border overflow-hidden transition-all ${
      darkMode 
        ? 'border-gray-700' 
        : 'border-gray-200'
    } ${getPhaseBackgroundClass()}`}>
      {/* Risk Warnings */}
      {showRiskWarnings && riskWarnings.length > 0 && (
        <div className={`p-3 border-b ${
          darkMode 
            ? 'bg-yellow-900/20 border-yellow-700 text-yellow-200' 
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-sm mb-1">Risk Management Alerts</h4>
              <ul className="text-xs space-y-1">
                {riskWarnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setShowRiskWarnings(false)}
              className={`text-xs px-2 py-1 rounded ${
                darkMode 
                  ? 'bg-yellow-800 hover:bg-yellow-700' 
                  : 'bg-yellow-200 hover:bg-yellow-300'
              }`}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      
      <PhaseHeader 
        phase={phase}
        expanded={expanded}
        onToggle={handleToggleExpanded}
        onDelete={handleDeletePhase}
        totalEndingBalance={getTotalEndingBalance()}
      />
      
      {expanded && (
        <TradeTable 
          levels={phase.levels}
          onUpdateLevel={handleLevelUpdate}
          onToggleCompletion={toggleLevelCompletion}
          riskWarningThreshold={riskWarningThreshold}
        />
      )}
    </div>
  );
};

export default PhaseContainer;