import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Target, Edit2, Check, X } from 'lucide-react';
import { Phase } from '../types/Phase';
import { formatCurrency } from '../utils/formatters';
import { useTheme } from '../contexts/ThemeContext';

interface PhaseHeaderProps {
  phase: Phase;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUpdateGoal?: (goalTarget?: number) => void;
  totalEndingBalance: number;
}

const PhaseHeader: React.FC<PhaseHeaderProps> = ({ 
  phase, 
  expanded,
  onToggle,
  onDelete,
  onUpdateGoal,
  totalEndingBalance
}) => {
  const { darkMode } = useTheme();
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalValue, setGoalValue] = useState(phase.goalTarget?.toString() || '');

  // Get color based on phase number for the accent
  const getAccentColor = () => {
    const phaseNum = phase.phaseNumber > 5 
      ? (phase.phaseNumber % 5 === 0 ? 5 : phase.phaseNumber % 5) 
      : phase.phaseNumber;
      
    switch (phaseNum) {
      case 1: return darkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-100 text-green-800 border-green-200';
      case 2: return darkMode ? 'bg-blue-900 text-blue-200 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200';
      case 3: return darkMode ? 'bg-purple-900 text-purple-200 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-200';
      case 4: return darkMode ? 'bg-orange-900 text-orange-200 border-orange-700' : 'bg-orange-100 text-orange-800 border-orange-200';
      case 5: return darkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-100 text-red-800 border-red-200';
      default: return darkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Calculate completion percentage
  const getCompletionPercentage = () => {
    const completedLevels = phase.levels.filter(level => level.completed).length;
    return Math.round((completedLevels / phase.levels.length) * 100);
  };

  // Calculate goal progress
  const getGoalProgress = () => {
    if (!phase.goalTarget) return 0;
    return Math.min((totalEndingBalance / phase.goalTarget) * 100, 100);
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Phase ${phase.phaseNumber}? This action cannot be undone.`
    );
    if (confirmDelete) {
      onDelete();
    }
  };

  const handleSaveGoal = () => {
    const newGoal = goalValue ? parseFloat(goalValue) : undefined;
    if (newGoal && newGoal <= phase.initialCapital) {
      alert('Goal target should be greater than initial capital.');
      return;
    }
    onUpdateGoal?.(newGoal);
    setEditingGoal(false);
  };

  const handleCancelGoal = () => {
    setGoalValue(phase.goalTarget?.toString() || '');
    setEditingGoal(false);
  };
  
  return (
    <div className={`p-4 border-b transition-colors ${
      darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAccentColor()}`}>
            Phase {phase.phaseNumber}
          </span>
          
          <button 
            onClick={onToggle}
            className={`p-1 rounded-full transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            aria-label={expanded ? "Collapse phase" : "Expand phase"}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          <button 
            onClick={handleDelete}
            className={`inline-flex items-center px-2 py-1 text-sm rounded-md transition-colors ${
              darkMode
                ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                : 'text-red-600 hover:text-red-800 hover:bg-red-50'
            }`}
            aria-label={`Delete Phase ${phase.phaseNumber}`}
          >
            <Trash2 size={14} className="mr-1" />
            Delete
          </button>
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

          {/* Goal Section */}
          <div className="flex items-center gap-2">
            <Target className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            {editingGoal ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={goalValue}
                  onChange={(e) => setGoalValue(e.target.value)}
                  placeholder="Goal amount"
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
                  {phase.goalTarget ? formatCurrency(phase.goalTarget) : 'No goal'}
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
          
          <div className="flex items-center gap-1">
            <div>
              <span className={`${darkMode ? 'text-green-400' : 'text-green-600'} mr-1`}>W:</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {phase.winStreak}
              </span>
            </div>
            <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>|</span>
            <div>
              <span className={`${darkMode ? 'text-red-400' : 'text-red-600'} mr-1`}>L:</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {phase.lossStreak}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress bars */}
      <div className="mt-3 space-y-2">
        {/* Level completion progress */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Level Progress
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

        {/* Goal progress */}
        {phase.goalTarget && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Goal Progress
              </span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {getGoalProgress().toFixed(1)}%
              </span>
            </div>
            <div className={`h-1.5 w-full rounded-full overflow-hidden ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${getGoalProgress()}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhaseHeader;