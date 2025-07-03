import React, { useState } from 'react';
import { Archive, ChevronDown, ChevronUp, RotateCcw, Trash2, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Phase } from '../types/Phase';
import { formatCurrency } from '../utils/formatters';
import { useTheme } from '../contexts/ThemeContext';

interface ArchivedPhasesProps {
  phases: Phase[];
  onUnarchive: (phaseNumber: number) => void;
  onDelete: (phaseNumber: number) => void;
}

const ArchivedPhases: React.FC<ArchivedPhasesProps> = ({ phases, onUnarchive, onDelete }) => {
  const { darkMode } = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  if (phases.length === 0) return null;
  
  const getTotalProfitLoss = (phase: Phase): number => {
    return phase.levels.reduce((total, level) => {
      return level.completed ? total + level.pl : total;
    }, 0);
  };
  
  const getTotalPhasesProfitLoss = (): number => {
    return phases.reduce((total, phase) => {
      return total + getTotalProfitLoss(phase);
    }, 0);
  };

  const getPhaseStats = (phase: Phase) => {
    const completedTrades = phase.levels.filter(l => l.completed);
    const totalPL = getTotalProfitLoss(phase);
    const winningTrades = completedTrades.filter(l => l.pl > 0).length;
    const winRate = completedTrades.length > 0 ? (winningTrades / completedTrades.length) * 100 : 0;
    
    return {
      completedTrades: completedTrades.length,
      totalTrades: phase.levels.length,
      totalPL,
      winRate,
      finalBalance: phase.initialCapital + totalPL,
    };
  };
  
  return (
    <div className={`rounded-lg shadow-sm border p-4 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <Archive className={`h-5 w-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Archived Phases
          </h3>
          <span className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            ({phases.length})
          </span>
        </div>
        
        <div className="flex items-center">
          <span className="mr-2 text-sm font-medium">
            Total P/L: <span className={getTotalPhasesProfitLoss() >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatCurrency(getTotalPhasesProfitLoss())}
            </span>
          </span>
          {expanded ? (
            <ChevronUp className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          ) : (
            <ChevronDown className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 space-y-3">
          {phases.map((phase) => {
            const stats = getPhaseStats(phase);
            
            return (
              <div 
                key={phase.phaseNumber}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        darkMode
                          ? 'bg-purple-900 text-purple-200 border border-purple-700'
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        Phase {phase.phaseNumber}
                      </span>
                      
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        {phase.startDate && (
                          <span>
                            {new Date(phase.startDate).toLocaleDateString()}
                            {phase.endDate && (
                              <> - {new Date(phase.endDate).toLocaleDateString()}</>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} block`}>
                          Progress
                        </span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {stats.completedTrades}/{stats.totalTrades} trades
                        </span>
                      </div>
                      
                      <div>
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} block`}>
                          Win Rate
                        </span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {stats.winRate.toFixed(1)}%
                        </span>
                      </div>
                      
                      <div>
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} block`}>
                          Initial Capital
                        </span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(phase.initialCapital)}
                        </span>
                      </div>
                      
                      <div>
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} block`}>
                          Final Balance
                        </span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(stats.finalBalance)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <div className="flex items-center">
                        {stats.totalPL >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-lg font-bold ${
                          stats.totalPL >= 0 
                            ? (darkMode ? 'text-green-400' : 'text-green-600')
                            : (darkMode ? 'text-red-400' : 'text-red-600')
                        }`}>
                          {formatCurrency(stats.totalPL)}
                        </span>
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Total P/L
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => onUnarchive(phase.phaseNumber)}
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors ${
                          darkMode
                            ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-900/70 border border-blue-700'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200'
                        }`}
                        title="Unarchive phase"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Unarchive
                      </button>
                      
                      <button
                        onClick={() => onDelete(phase.phaseNumber)}
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors ${
                          darkMode
                            ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70 border border-red-700'
                            : 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-200'
                        }`}
                        title="Delete permanently"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Completion Progress
                    </span>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {Math.round((stats.completedTrades / stats.totalTrades) * 100)}%
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${
                    darkMode ? 'bg-gray-600' : 'bg-gray-200'
                  }`}>
                    <div 
                      className="h-full bg-purple-500 transition-all duration-500"
                      style={{ width: `${(stats.completedTrades / stats.totalTrades) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ArchivedPhases;