import React from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Phase } from '../types/Phase';
import { formatCurrency } from '../utils/formatters';

interface PhaseHeaderProps {
  phase: Phase;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  totalEndingBalance: number;
}

const PhaseHeader: React.FC<PhaseHeaderProps> = ({ 
  phase, 
  expanded,
  onToggle,
  onDelete,
  totalEndingBalance
}) => {
  // Get color based on phase number for the accent
  const getAccentColor = () => {
    const phaseNum = phase.phaseNumber > 5 
      ? (phase.phaseNumber % 5 === 0 ? 5 : phase.phaseNumber % 5) 
      : phase.phaseNumber;
      
    switch (phaseNum) {
      case 1: return 'bg-green-100 text-green-800 border-green-200';
      case 2: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 3: return 'bg-purple-100 text-purple-800 border-purple-200';
      case 4: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 5: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Calculate completion percentage
  const getCompletionPercentage = () => {
    const completedLevels = phase.levels.filter(level => level.completed).length;
    return Math.round((completedLevels / phase.levels.length) * 100);
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Phase ${phase.phaseNumber}? This action cannot be undone.`
    );
    if (confirmDelete) {
      onDelete();
    }
  };
  
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAccentColor()}`}>
            Phase {phase.phaseNumber}
          </span>
          
          <button 
            onClick={onToggle}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={expanded ? "Collapse phase" : "Expand phase"}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          <button 
            onClick={handleDelete}
            className="inline-flex items-center px-2 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            aria-label={`Delete Phase ${phase.phaseNumber}`}
          >
            <Trash2 size={14} className="mr-1" />
            Delete
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="text-gray-600 mr-1">Initial:</span>
            <span className="font-medium">{formatCurrency(phase.initialCapital)}</span>
          </div>
          
          <div>
            <span className="text-gray-600 mr-1">Current:</span>
            <span className="font-medium">{formatCurrency(totalEndingBalance)}</span>
          </div>
          
          <div>
            <span className="text-gray-600 mr-1">Progress:</span>
            <span className="font-medium">{getCompletionPercentage()}%</span>
          </div>
          
          <div className="flex items-center gap-1">
            <div>
              <span className="text-green-600 mr-1">W:</span>
              <span className="font-medium">{phase.winStreak}</span>
            </div>
            <span className="text-gray-400">|</span>
            <div>
              <span className="text-red-600 mr-1">L:</span>
              <span className="font-medium">{phase.lossStreak}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${getCompletionPercentage()}%` }}
        ></div>
      </div>
    </div>
  );
};

export default PhaseHeader;