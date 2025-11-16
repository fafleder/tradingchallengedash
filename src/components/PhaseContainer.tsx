import React, { useState, useEffect } from 'react';
import { Phase } from '../types/Phase';
import { calculatePips, calculateRiskedAmount, calculateProfitTarget } from '../utils/calculations';
import { RiskManager } from '../utils/riskManager';
import { useTheme } from '../contexts/ThemeContext';
import PhaseHeader from './PhaseHeader';
import TradeTable from './TradeTable';
import RiskWarningsPanel from './RiskWarnings/RiskWarningsPanel';

interface PhaseContainerProps {
  phase: Phase;
  updatePhase: (phase: Phase) => void;
  onDeletePhase: (phaseNumber: number) => void;
  onArchivePhase?: (phaseNumber: number) => void;
  riskWarningThreshold: number;
  expandedPhases: Set<number>;
  onToggleExpanded: (phaseNumber: number) => void;
  onWithdraw?: (amount: number) => void;
}

const PhaseContainer: React.FC<PhaseContainerProps> = ({ 
  phase, 
  updatePhase, 
  onDeletePhase,
  onArchivePhase,
  riskWarningThreshold,
  expandedPhases,
  onToggleExpanded,
  onWithdraw
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
      
      // Enforce $2 SL rule
      if (updatedLevels[i].riskedAmount > 2) {
        updatedLevels[i].riskPercent = (2 / currentBalance) * 100;
        updatedLevels[i].riskedAmount = 2;
        updatedLevels[i].slAmount = 2;
      }
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
    
    // Enforce micro capital rules
    let finalRiskedAmount = riskedAmount;
    let finalRiskPercent = riskPercent;
    
    // Hard $2 SL limit
    if (riskedAmount > 2) {
      finalRiskedAmount = 2;
      finalRiskPercent = (2 / currentBalance) * 100;
    }
    
    // Add rule violations tracking
    const ruleViolations: string[] = [];
    if (riskedAmount > 2) ruleViolations.push('Exceeded $2 SL limit');
    if (updates.tradeNumber && updates.tradeNumber > 3) ruleViolations.push('Exceeded 3 trades/day limit');
    
    updatedLevels[levelIndex] = {
      ...updatedLevels[levelIndex],
      riskedAmount: finalRiskedAmount,
      riskPercent: finalRiskPercent,
      slAmount: Math.min(finalRiskedAmount, 2),
      pipsToRisk,
      profitTarget
      ruleViolations,
    };
    
    updatePhase({
      ...phase,
      levels: updatedLevels
    });
  };

  // Delete level
  const handleDeleteLevel = (levelIndex: number) => {
    if (phase.levels.length <= 1) {
      alert('Cannot delete the last trade in a cycle.');
      return;
    }
    
    const confirmDelete = window.confirm('Are you sure you want to delete this trade?');
    if (!confirmDelete) return;
    
    const updatedLevels = phase.levels.filter((_, index) => index !== levelIndex);
    // Renumber the levels
    const renumberedLevels = updatedLevels.map((level, index) => ({
      ...level,
      levelNumber: index + 1
    }));
    
    updatePhase({
      ...phase,
      levels: renumberedLevels,
      levelsPerPhase: renumberedLevels.length
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
    
    // Check flip target achievement
    const currentBalance = getTotalEndingBalance();
    const multiplier = currentBalance / phase.initialCapital;
    
    if (multiplier >= (phase.flipTarget || 2)) {
      alert(`🎉 Flip target achieved! ${multiplier.toFixed(2)}x multiplier reached. Time to withdraw!`);
    }
    
    updatePhase({
      ...phase,
      levels: updatedLevels
    });
  };

  // Update phase goal
  const handleUpdatePhaseGoal = (goalTarget?: number) => {
    updatePhase({
      ...phase,
      goalTarget
    });
  };
  
  // Get bg class based on phase number
  const getPhaseBackgroundClass = () => {
    return darkMode ? 'bg-gray-800' : 'bg-white';
  };
  
  const handleDeletePhase = () => {
    onDeletePhase(phase.phaseNumber);
  };

  const handleArchivePhase = () => {
    if (onArchivePhase) {
      onArchivePhase(phase.phaseNumber);
    }
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
      
      <PhaseHeader 
        phase={phase}
        expanded={expanded}
        onToggle={handleToggleExpanded}
        onDelete={handleDeletePhase}
        onArchive={onArchivePhase ? handleArchivePhase : undefined}
        onUpdateGoal={handleUpdatePhaseGoal}
        totalEndingBalance={getTotalEndingBalance()}
        onWithdraw={onWithdraw}
      />
      
      {expanded && (
        <div className="space-y-4">
          {/* Risk Warnings Panel */}
          <RiskWarningsPanel 
            warnings={riskWarnings}
            show={riskWarnings.length > 0}
          />
          
          <TradeTable 
            levels={phase.levels}
            onUpdateLevel={handleLevelUpdate}
            onToggleCompletion={toggleLevelCompletion}
            onDeleteLevel={handleDeleteLevel}
            riskWarningThreshold={riskWarningThreshold}
          />
        </div>
      )}
    </div>
  );
};

export default PhaseContainer;