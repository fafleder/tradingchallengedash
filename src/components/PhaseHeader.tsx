import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Target, Edit2, Check, X, Archive, Settings, Zap, DollarSign, AlertTriangle } from 'lucide-react';
import { Phase } from '../types/Phase';
import { formatCurrency } from '../utils/formatters';
import { useTheme } from '../contexts/ThemeContext';

interface PhaseHeaderProps {
  phase: Phase;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onArchive?: () => void;
  onUpdateGoal?: (goalTarget?: number) => void;
  totalEndingBalance: number;
  onWithdraw?: (amount: number) => void;
}

const PhaseHeader: React.FC<PhaseHeaderProps> = ({ 
  phase, 
  expanded,
  onToggle,
  onDelete,
  onArchive,
  onUpdateGoal,
  totalEndingBalance,
  onWithdraw
}) => {
  const { darkMode } = useTheme();
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalValue, setGoalValue] = useState(phase.goalTarget?.toString() || '');
  const [showActions, setShowActions] = useState(false);

  // Get cycle type styling
  const getCycleTypeColor = () => {
    const cycleType = phase.cycleType || 'micro';
    switch (cycleType) {
      case 'micro': return darkMode ? 'bg-orange-900 text-orange-200 border-orange-700' : 'bg-orange-100 text-orange-800 border-orange-200';
      case 'small': return darkMode ? 'bg-blue-900 text-blue-200 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200';
      case 'prop-challenge': return darkMode ? 'bg-purple-900 text-purple-200 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-200';
      case 'funded': return darkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-100 text-green-800 border-green-200';
      default: return darkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Calculate completion percentage
  const getCompletionPercentage = () => {
    const completedLevels = phase.levels.filter(level => level.completed).length;
    return Math.round((completedLevels / phase.levels.length) * 100);
  };

  // Calculate flip progress
  const getFlipProgress = () => {
    if (!phase.goalTarget) return 0;
    return Math.min((totalEndingBalance / phase.goalTarget) * 100, 100);
  };

  // Calculate flip multiplier
  const getFlipMultiplier = () => {
    return totalEndingBalance / phase.initialCapital;
  };

  // Get withdrawal stage
  const getWithdrawalStage = () => {
    const multiplier = getFlipMultiplier();
    if (multiplier >= 5) return { stage: 'withdraw-all', color: 'text-red-500', text: 'WITHDRAW ALL & RESET' };
    if (multiplier >= 4) return { stage: 'withdraw-all', color: 'text-red-500', text: 'WITHDRAW ALL & RESET' };
    if (multiplier >= 3) return { stage: 'withdraw-half', color: 'text-yellow-500', text: 'WITHDRAW 50%' };
    if (multiplier >= 2) return { stage: 'withdraw-deposit', color: 'text-blue-500', text: 'WITHDRAW DEPOSIT' };
    return { stage: 'active', color: 'text-gray-500', text: 'ACTIVE TRADING' };
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Cycle ${phase.phaseNumber}? This action cannot be undone.`
    );
    if (confirmDelete) {
      onDelete();
    }
  };

  const handleArchive = () => {
    const confirmArchive = window.confirm(
      `Are you sure you want to archive Cycle ${phase.phaseNumber}? You can restore it later from the archived cycles section.`
    );
    if (confirmArchive && onArchive) {
      onArchive();
    }
  };

  const handleWithdraw = () => {
    const withdrawalStage = getWithdrawalStage();
    const multiplier = getFlipMultiplier();
    
    let withdrawAmount = 0;
    if (withdrawalStage.stage === 'withdraw-deposit') {
      withdrawAmount = phase.initialCapital;
    } else if (withdrawalStage.stage === 'withdraw-half') {
      const profits = totalEndingBalance - phase.initialCapital;
      withdrawAmount = profits * 0.5;
    } else if (withdrawalStage.stage === 'withdraw-all') {
      withdrawAmount = totalEndingBalance;
    }

    if (withdrawAmount > 0 && onWithdraw) {
      const confirmWithdraw = window.confirm(
        `Withdraw $${withdrawAmount.toFixed(2)} to offline stack? This follows the ${multiplier.toFixed(1)}x flip rule.`
      );
      if (confirmWithdraw) {
        onWithdraw(withdrawAmount);
      }
    }
  };

  const handleSaveGoal = () => {
    const newGoal = goalValue ? parseFloat(goalValue) : phase.initialCapital * 2; // Default 2x
    if (newGoal <= phase.initialCapital) {
      alert('Flip target should be greater than initial capital.');
      return;
    }
    onUpdateGoal?.(newGoal);
    setEditingGoal(false);
  };

  const handleCancelGoal = () => {
    setGoalValue(phase.goalTarget?.toString() || '');
    setEditingGoal(false);
  };

  const withdrawalStage = getWithdrawalStage();
  const multiplier = getFlipMultiplier();
  
  return (
    <div className={`p-4 border-b transition-colors ${
      darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCycleTypeColor()}`}>
            {(phase.cycleType || 'micro').toUpperCase()} #{phase.phaseNumber}
          </span>
          
          <button 
            onClick={onToggle}
            className={`p-1 rounded-full transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            aria-label={expanded ? "Collapse cycle" : "Expand cycle"}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {/* Flip Multiplier Display */}
          <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${
            multiplier >= 2 
              ? (darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
              : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700')
          }`}>
            <Zap className="h-3 w-3 mr-1" />
            {multiplier.toFixed(2)}x
          </div>

          {/* Withdrawal Stage Indicator */}
          {multiplier >= 2 && (
            <button
              onClick={handleWithdraw}
              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold transition-colors ${
                darkMode
                  ? 'bg-yellow-900 text-yellow-200 hover:bg-yellow-800'
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`}
            >
              <DollarSign className="h-3 w-3 mr-1" />
              {withdrawalStage.text}
            </button>
          )}

          {/* Actions Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowActions(!showActions)}
              className={`inline-flex items-center px-2 py-1 text-sm rounded-md transition-colors ${
                darkMode
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              aria-label="Cycle actions"
            >
              <Settings size={14} className="mr-1" />
              Actions
            </button>

            {showActions && (
              <div className={`absolute left-0 top-full mt-1 w-40 rounded-md shadow-lg border z-10 ${
                darkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                {onArchive && (
                  <button
                    onClick={() => {
                      handleArchive();
                      setShowActions(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm transition-colors ${
                      darkMode
                        ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700'
                        : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                    }`}
                  >
                    <Archive size={14} className="mr-2" />
                    Archive
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDelete();
                    setShowActions(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm transition-colors ${
                    darkMode
                      ? 'text-red-400 hover:text-red-300 hover:bg-gray-700'
                      : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                  }`}
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div>
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mr-1`}>Initial:</span>
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(phase.initialCapital)}
            </span>
          </div>
          
          <div>
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mr-1`}>Current:</span>
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(totalEndingBalance)}
            </span>
          </div>
          
          <div>
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mr-1`}>Progress:</span>
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {getCompletionPercentage()}%
            </span>
          </div>

          {/* Flip Target Section */}
          <div className="flex items-center gap-2">
            <Target className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            {editingGoal ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={goalValue}
                  onChange={(e) => setGoalValue(e.target.value)}
                  placeholder="Flip target"
                  className={`w-24 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <button
                  onClick={handleSaveGoal}
                  className={`p-1 rounded transition-colors ${
                    darkMode
                      ? 'text-green-400 hover:bg-gray-700'
                      : 'text-green-600 hover:bg-gray-100'
                  }`}
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  onClick={handleCancelGoal}
                  className={`p-1 rounded transition-colors ${
                    darkMode
                      ? 'text-red-400 hover:bg-gray-700'
                      : 'text-red-600 hover:bg-gray-100'
                  }`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {phase.goalTarget ? formatCurrency(phase.goalTarget) : formatCurrency(phase.initialCapital * 2)}
                </span>
                <button
                  onClick={() => setEditingGoal(true)}
                  className={`p-1 rounded transition-colors ${
                    darkMode
                      ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                      : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          
          {/* Daily Limits Tracker */}
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              T: {phase.dailyTradeCount || 0}/3 • L: {phase.dailyLossCount || 0}/3
            </span>
          </div>
        </div>
      </div>
      
      {/* Progress bars */}
      <div className="mt-3 space-y-2">
        {/* Trade completion progress */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Trade Progress
            </span>
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {phase.levels.filter(l => l.completed).length}/{phase.levels.length}
            </span>
          </div>
          <div className={`h-1.5 w-full rounded-full overflow-hidden ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Flip progress */}
        <div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Flip Progress ({multiplier.toFixed(2)}x)
              </span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {getFlipProgress().toFixed(1)}%
              </span>
            </div>
            <div className={`h-1.5 w-full rounded-full overflow-hidden ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-full transition-all duration-500 ${
                  multiplier >= 2 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${getFlipProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close actions dropdown */}
      {showActions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};

export default PhaseHeader;